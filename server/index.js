/**
 * Lokal /assess-gateway (Node/Express, gptbackend-mönstret) — det generella
 * JSON-drivna GPT-anropet, utökat till per-steg + deterministisk final-compose.
 *
 * Principen: EN ny station = en ny `configs/<id>.json`. Anropskoden här
 * återanvänds. `instructions` (bedömnings-innehållet) är det enda man byter för
 * ett nytt scenario. Slutpoängen räknas i KOD (lib/scoring.js), modellen skriver
 * bara texten. Nyckel via .env (AI_API_KEY) — aldrig i git, aldrig i fronten.
 *
 *   npm run gateway   (kräver server/.env med AI_API_KEY=...)
 */
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { computeFinal } from './lib/scoring.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Ladda server/.env oavsett från vilken katalog gatewayen startas (default-
// dotenv läser cwd/.env — vi vill alltid ha nyckeln bredvid denna fil).
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 8787
const API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY

if (!API_KEY) {
  console.warn(
    '[gateway] VARNING: ingen AI_API_KEY i server/.env — /assess kommer svara 500 tills en nyckel läggs in.',
  )
}

const openai = API_KEY ? new OpenAI({ apiKey: API_KEY }) : null

// --- Config-laddning (cache) ---
const configCache = new Map()
function loadConfig(configId) {
  if (!/^[a-z0-9_-]+$/i.test(configId)) throw new Error('ogiltigt configId')
  if (configCache.has(configId)) return configCache.get(configId)
  const file = path.join(__dirname, 'configs', `${configId}.json`)
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8'))
  cfg._instructions = fs.readFileSync(path.join(__dirname, cfg.instructionsFile), 'utf8').trim()
  cfg._compose = fs.readFileSync(path.join(__dirname, cfg.composeInstructionsFile), 'utf8').trim()
  configCache.set(configId, cfg)
  return cfg
}

// --- JSON-parsning med reparation (ingen naken JSON.parse) ---
function parseJsonLoose(raw) {
  if (raw && typeof raw === 'object') return raw
  let s = String(raw ?? '').trim()
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const first = s.indexOf('{')
  const last = s.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1)
  return JSON.parse(s)
}

const BANDS = ['Stark', 'Godkänd', 'Svag']
const DIMS = ['system', 'framforhallning', 'prioritering', 'resurs', 'anpassning']

/** Tvinga modellsvaret till kontraktsformen (StepAssessment). */
function coerceStep(obj) {
  const o = obj ?? {}
  const dimsIn = o.dimensioner ?? {}
  const dimensioner = {}
  for (const d of DIMS) dimensioner[d] = Boolean(dimsIn[d])
  const motiverat = Boolean(o.motiverat)
  let band = BANDS.includes(o.band) ? o.band : 'Godkänd'
  // §5 (hård regel, deterministisk): utan motivering nås aldrig Stark — tak Godkänd.
  if (!motiverat && band === 'Stark') band = 'Godkänd'
  return {
    band,
    dimensioner,
    motiverat,
    kvitterat: String(o.kvitterat ?? ''),
    miss: String(o.miss ?? ''),
    ankare: String(o.ankare ?? ''),
    svar_text: String(o.svar_text ?? ''),
    osakert: Array.isArray(o.osakert) ? o.osakert.map(String) : [],
  }
}

// --- Prompt-byggare (injicerar steg/roll/scenario/resurser/prior i input) ---
function priorBlock(prior) {
  if (!prior || prior.length === 0) return '(inga tidigare steg)'
  return prior
    .map(
      (p) =>
        `- steg ${p.step}: band=${p.band}; kvitterat=${p.kvitterat || '—'}; miss=${p.miss || '—'}; dimensioner=${Object.entries(
          p.dimensioner || {},
        )
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(',') || '—'}`,
    )
    .join('\n')
}

function buildStepInput(input) {
  const lines = [
    `STEG: ${input.step} (1=packa, 2=färdsätt, 3=slå läger)`,
    `ROLL: ${input.role}`,
    `SCENARIO: ${input.scenario}`,
    `TIDIGARE STEG (dina egna bedömningar):`,
    priorBlock(input.prior),
  ]
  // Packlistan från steg 1 skickas i steg 3 → korsreferera (§7 återkoppling).
  if (input.packlista) {
    lines.push(`PACKLISTA (vad de sa att de tog med i steg 1):`, `"""`, String(input.packlista).trim() || '—', `"""`)
  }
  lines.push(
    `GRUPPENS TÄNK-HÖGT (transkript):`,
    `"""`,
    (input.transcript || '').trim() || '(tyst — inget sades)',
    `"""`,
    `Svara med ett enda giltigt JSON-objekt enligt schemat.`,
  )
  return lines.join('\n')
}

function buildComposeInput(input, computed) {
  return [
    `ROLL: ${input.role}`,
    `SCENARIO: ${input.scenario}`,
    `FASTSTÄLLD POÄNG: ${computed.poang} (skala 1–10)`,
    `FASTSTÄLLD PROFIL: ${computed.profil}`,
    `MARKERING: ${computed.markering}`,
    `STEGENS BEDÖMNINGAR:`,
    priorBlock(input.prior),
    `Svara med ett enda giltigt JSON-objekt: { "sammanfattning": "..." }`,
  ].join('\n')
}

async function callModelJson(model, instructions, input, cfg) {
  if (!openai) throw new Error('ingen AI_API_KEY konfigurerad i server/.env')
  const req = { model, instructions, input }
  // gpt-5-familjen: låg reasoning-effort kapar latensen kraftigt (config-styrt).
  if (cfg && cfg.reasoningEffort) req.reasoning = { effort: cfg.reasoningEffort }
  if (cfg && cfg.maxOutputTokens) req.max_output_tokens = cfg.maxOutputTokens
  // JSON-läge: modellen kan bara emittera giltig JSON (rätt escaping) → inga
  // trasiga svar. coerceStep normaliserar ändå formen.
  if (cfg && cfg.jsonMode) req.text = { format: { type: 'json_object' } }
  const response = await openai.responses.create(req)
  return parseJsonLoose(response.output_text)
}

// --- Server ---
const app = express()
app.use(express.json({ limit: '256kb' }))
app.use(cors())

app.get('/health', (_req, res) => res.json({ ok: true, keyed: Boolean(openai) }))

app.post('/assess', async (req, res) => {
  const started = Date.now()
  try {
    const { configId, input, meta } = req.body ?? {}
    if (!configId || !input) return res.status(400).json({ error: 'configId och input krävs' })
    const cfg = loadConfig(configId)
    const model = (meta && meta.modelOverride) || cfg.model

    if (input.step === 'final') {
      // Slutpoäng deterministiskt i KOD; modellen skriver bara sammanfattning.
      const computed = computeFinal(input.prior || [], cfg)
      let sammanfattning = ''
      try {
        const out = await callModelJson(model, cfg._compose, buildComposeInput(input, computed), cfg)
        sammanfattning = String(out.sammanfattning ?? '')
      } catch (err) {
        console.warn('[gateway] compose-text misslyckades, tom sammanfattning:', err.message)
      }
      return res.json({
        final: {
          poang: computed.poang,
          profil: computed.profil,
          markering: computed.markering,
          sammanfattning,
        },
        meta: { model, latencyMs: Date.now() - started, strongest: computed.strongest },
      })
    }

    // Per-steg
    const raw = await callModelJson(model, cfg._instructions, buildStepInput(input), cfg)
    const assessment = coerceStep(raw)
    return res.json({ assessment, meta: { model, latencyMs: Date.now() - started } })
  } catch (err) {
    console.error('[gateway] /assess fel:', err)
    return res.status(500).json({ error: String(err.message || err) })
  }
})

/**
 * /speak (ElevenLabs) — läser upp NPC-svaret. Icke-essentiell add-on: fronten
 * sväljer icke-2xx tyst och texten står kvar. Nyckel via server/.env
 * (ELEVENLABS_API_KEY), röst/modell ur configen. Byt nyckel/röst = env/config,
 * ingen kodändring.
 */
app.post('/speak', async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return res.status(503).json({ error: 'ELEVENLABS_API_KEY saknas i server/.env' })
  try {
    const { configId = 'minnestest', text } = req.body ?? {}
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'text krävs' })
    const cfg = loadConfig(configId)
    const speak = cfg.speak
    if (!speak || !speak.voiceId) return res.status(500).json({ error: 'ingen röst i config' })

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${speak.voiceId}`
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: String(text),
        model_id: speak.modelId || 'eleven_multilingual_v2',
        voice_settings: speak.voiceSettings || undefined,
      }),
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.warn('[gateway] /speak ElevenLabs-fel', r.status, detail.slice(0, 200))
      return res.status(502).json({ error: `elevenlabs ${r.status}` })
    }
    const buf = Buffer.from(await r.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    return res.send(buf)
  } catch (err) {
    console.error('[gateway] /speak fel:', err)
    return res.status(500).json({ error: String(err.message || err) })
  }
})

app.listen(PORT, () => {
  console.log(`[gateway] lyssnar på http://localhost:${PORT}  (keyed: ${Boolean(openai)})`)
})

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
  return {
    band: BANDS.includes(o.band) ? o.band : 'Godkänd',
    dimensioner,
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
  return [
    `STEG: ${input.step}`,
    `ROLL: ${input.role}`,
    `SCENARIO: ${input.scenario}`,
    `RESURSER SOM FINNS I HEMMET: ${(input.resources || []).join(', ') || '—'}`,
    `TIDIGARE STEG (dina egna bedömningar):`,
    priorBlock(input.prior),
    `GRUPPENS TÄNK-HÖGT (transkript):`,
    `"""`,
    (input.transcript || '').trim() || '(tyst — inget sades)',
    `"""`,
    `Svara med ett enda giltigt JSON-objekt enligt schemat.`,
  ].join('\n')
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
 * /speak (ElevenLabs) — STUBB i pilot. Röst är en icke-essentiell add-on;
 * fronten sväljer icke-2xx tyst och texten står kvar. Tänds server-side med
 * ELEVENLABS_API_KEY + röst-ID utan att fronten ändras.
 */
app.post('/speak', (_req, res) => {
  res.status(501).json({ error: 'speak ej aktiverad i pilot' })
})

app.listen(PORT, () => {
  console.log(`[gateway] lyssnar på http://localhost:${PORT}  (keyed: ${Boolean(openai)})`)
})

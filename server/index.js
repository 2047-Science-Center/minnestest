/**
 * Lokal /assess-gateway (Node/Express, gptbackend-mönstret). Gatad stege:
 * per NIVÅ poängsätter modellen gruppens RESONEMANG 0–10 mot nivåns rubrik.
 * KODEN (fronten) gatar mot en stigande tröskel. En ny station = en ny
 * configs/<id>.json; den generella score-instruktionen delas.
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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = process.env.PORT || 8787
const API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY

if (!API_KEY) {
  console.warn('[gateway] VARNING: ingen AI_API_KEY i server/.env — /assess svarar 500 tills en nyckel läggs in.')
}

const openai = API_KEY ? new OpenAI({ apiKey: API_KEY }) : null

// --- Config-laddning (cache) ---
const configCache = new Map()
function loadConfig(configId) {
  if (!/^[a-z0-9_-]+$/i.test(configId)) throw new Error('ogiltigt configId')
  if (configCache.has(configId)) return configCache.get(configId)
  const file = path.join(__dirname, 'configs', `${configId}.json`)
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8'))
  const scoreFile = cfg.scoreInstructionsFile || 'instructions/stege-score.sv.txt'
  cfg._score = fs.readFileSync(path.join(__dirname, scoreFile), 'utf8').trim()
  configCache.set(configId, cfg)
  return cfg
}

// --- JSON-parsning med reparation ---
function parseJsonLoose(raw) {
  if (raw && typeof raw === 'object') return raw
  let s = String(raw ?? '').trim()
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const first = s.indexOf('{')
  const last = s.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1)
  return JSON.parse(s)
}

function clampInt(n, min, max) {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v)) return min
  return Math.max(min, Math.min(max, v))
}

/** Tvinga modellsvaret till kontraktsformen (gatad nivå). */
function coerceScore(obj) {
  const o = obj ?? {}
  const kommentar = String(o.kommentar ?? '')
  return {
    poang: clampInt(o.poang, 0, 10),
    kommentar,
    saknades: String(o.saknades ?? ''),
    svar_text: String(o.svar_text ?? kommentar),
    // Bakåtkompatibla fält (oanvända i stege-modellen).
    dimensioner: {},
    kvitterat: '',
    miss: '',
    ankare: '',
    osakert: [],
  }
}

function priorBlock(prior) {
  if (!prior || prior.length === 0) return '(inga tidigare nivåer)'
  return prior
    .map((p) => `- nivå ${p.step}: poäng=${p.poang ?? '—'}${p.kommentar ? ` (${p.kommentar})` : ''}`)
    .join('\n')
}

function groupAnswer(input) {
  if (input.val) return input.val
  if (input.guess != null) return `${input.guess} ${input.unit || ''}`.trim()
  return '(se motiveringen)'
}

function buildScoreInput(input) {
  return [
    `NIVÅ: ${input.step}`,
    `FRÅGA: ${input.fraga || '—'}`,
    `RUBRIK (godkänt kräver): ${input.rubrik || '—'}`,
    `TRÖSKEL: ${input.threshold ?? '—'} / 10`,
    `GRUPPENS SVAR: ${groupAnswer(input)}`,
    `GRUPPENS MOTIVERING (tänk-högt):`,
    `"""`,
    (input.transcript || '').trim() || '(tyst — inget sades)',
    `"""`,
    `TIDIGARE NIVÅER:`,
    priorBlock(input.prior),
    `Svara med ETT giltigt JSON-objekt enligt schemat.`,
  ].join('\n')
}

async function callModelJson(model, instructions, input, cfg) {
  if (!openai) throw new Error('ingen AI_API_KEY konfigurerad i server/.env')
  const req = { model, instructions, input }
  if (cfg && cfg.reasoningEffort) req.reasoning = { effort: cfg.reasoningEffort }
  if (cfg && cfg.maxOutputTokens) req.max_output_tokens = cfg.maxOutputTokens
  if (cfg && cfg.jsonMode) req.text = { format: { type: 'json_object' } }
  const response = await openai.responses.create(req)
  return parseJsonLoose(response.output_text)
}

// --- Server ---
const app = express()
app.use(express.json({ limit: '256kb' }))
app.use(cors())

app.get('/health', (_req, res) => res.json({ ok: true, keyed: Boolean(openai) }))
app.get('/healthz', (_req, res) => res.type('text/plain').send('ok'))

app.post('/assess', async (req, res) => {
  const started = Date.now()
  try {
    const { configId, input, meta } = req.body ?? {}
    if (!configId || !input) return res.status(400).json({ error: 'configId och input krävs' })
    const cfg = loadConfig(configId)
    const model = (meta && meta.modelOverride) || cfg.model
    const raw = await callModelJson(model, cfg._score, buildScoreInput(input), cfg)
    const assessment = coerceScore(raw)
    return res.json({ assessment, meta: { model, latencyMs: Date.now() - started, poang: assessment.poang } })
  } catch (err) {
    console.error('[gateway] /assess fel:', err)
    return res.status(500).json({ error: String(err.message || err) })
  }
})

/**
 * /speak (ElevenLabs) — läser upp ENHETENs kommentar. Icke-essentiell add-on.
 */
app.post('/speak', async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return res.status(503).json({ error: 'ELEVENLABS_API_KEY saknas i server/.env' })
  try {
    const { configId = 'flykt', text } = req.body ?? {}
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'text krävs' })
    const cfg = loadConfig(configId)
    const speak = cfg.speak
    if (!speak || !speak.voiceId) return res.status(500).json({ error: 'ingen röst i config' })

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${speak.voiceId}`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
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

// --- Servera den byggda appen (kiosk-drift: EN process, samma origin) ---
const DIST = path.join(__dirname, '..', 'dist')
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST))
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))
  console.log('[gateway] serverar byggd app från', DIST)
}

app.listen(PORT, () => {
  console.log(`[gateway] lyssnar på http://localhost:${PORT}  (keyed: ${Boolean(openai)})`)
})

/**
 * Fermi-bedömningens deterministiska del (metodspecialist-spec §5). Modellen
 * klassar RESONEMANGSNIVÅ ur transkriptet; KODEN här räknar TRÄFF (gissning vs
 * facit / egna tal) och slår upp DELPOÄNG i matrisen, samt stationens slutpoäng.
 * Allt transparent + enhetstestbart.
 */

export const NIVAER = ['Exceptionell', 'Stark', 'Godkänd', 'Svag']
export const FERMI_DIMS = ['dekomposition', 'antaganden', 'storleksordning', 'sanitycheck', 'osakerhet']

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}
function inRange(v, band) {
  return Array.isArray(band) && v >= band[0] && v <= band[1]
}
function priorGuess(prior, step) {
  const p = (prior || []).find((x) => x.step === step)
  return p && typeof p.guess === 'number' ? p.guess : null
}

/**
 * Träff-kolumnen (§5.4). Steg 1&2 mot facit-band i config; steg 3 mot DERAS
 * EGNA tal (guess1×guess2), aldrig mot nationellt facit. Tom gissning → neutral
 * mittkolumn 'tiopotens'.
 */
export function fermiTraff(step, guess, prior, cfg) {
  if (guess == null || !Number.isFinite(guess)) return 'tiopotens'
  const reference = cfg.reference || {}

  if (step === 1 || step === 2) {
    const ref = reference[String(step)]
    if (!ref) return 'tiopotens'
    if (inRange(guess, ref.prick)) return 'prick'
    if ((ref.tiopotens || []).some((r) => inRange(guess, r))) return 'tiopotens'
    return 'utanfor'
  }

  // Steg 3: mot egna tal. guess1 (kg) × guess2 (antal) → ton.
  const g1 = priorGuess(prior, 1)
  const g2 = priorGuess(prior, 2)
  if (g1 == null || g2 == null) return 'tiopotens'
  const expectedTon = (g1 * g2) / 1000
  if (!(expectedTon > 0)) return 'tiopotens'
  const ratio = guess / expectedTon
  const s3 = (cfg.scoring && cfg.scoring.step3) || { prick: [0.7, 1.5], tiopotens: [0.2, 5] }
  if (ratio >= s3.prick[0] && ratio <= s3.prick[1]) return 'prick'
  if (ratio >= s3.tiopotens[0] && ratio <= s3.tiopotens[1]) return 'tiopotens'
  return 'utanfor'
}

/** Matris-uppslaget (§5.1): resonemangsnivå × träff → delpoäng 1–10. */
export function fermiDelpoang(niva, traff, cfg) {
  const matrix = (cfg.scoring && cfg.scoring.matrix) || {}
  const row = matrix[niva] || matrix['Godkänd'] || {}
  return row[traff] ?? row['tiopotens'] ?? 5
}

/** Starkaste Fermi-dimensionen över stegen (tie-break = FERMI_DIMS-ordning). */
export function strongestFermiDim(prior) {
  const tally = {}
  for (const d of FERMI_DIMS) tally[d] = 0
  for (const p of prior || []) {
    const dims = p.dimensioner || {}
    for (const d of FERMI_DIMS) if (dims[d]) tally[d] += 1
  }
  let best = FERMI_DIMS[0]
  let bestN = -1
  for (const d of FERMI_DIMS) {
    if (tally[d] > bestN) {
      bestN = tally[d]
      best = d
    }
  }
  return best
}

/**
 * Stationens slutpoäng (§5.5): medel av de tre delpoängen, +1 för tydlig röd
 * tråd (steg 3 kombinerar egna tal rätt → traff='prick'), klampat 1–10.
 */
export function fermiFinal(prior, cfg) {
  const ds = (prior || []).map((p) => p.delpoang).filter((n) => typeof n === 'number')
  const mean = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 5
  const step3 = (prior || []).find((p) => p.step === 3)
  const finalCfg = (cfg.scoring && cfg.scoring.final) || { rodTradBonus: 1, clamp: { min: 1, max: 10 } }
  const bonus = step3 && step3.traff === 'prick' ? finalCfg.rodTradBonus : 0
  const poang = clamp(Math.round(mean) + bonus, finalCfg.clamp.min, finalCfg.clamp.max)

  const strongest = strongestFermiDim(prior)
  const profil = (cfg.profiles && cfg.profiles[strongest]) || '—'
  const mark = (cfg.scale || []).find((m) => poang >= m.min && poang <= m.max)

  return { poang, markering: mark ? mark.label : '', profil, strongest, bonus }
}

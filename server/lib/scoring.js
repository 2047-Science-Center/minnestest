/**
 * Deterministisk slutpoäng-beräkning (innehållsspec §6.3). Ligger i KOD, inte i
 * modellen — transparent och enhetstestbar. Alla parametrar (bandpoäng, bonus,
 * clamp, profiler, skala) kommer ur `configs/<id>.json` så en ny station bara
 * byter config.
 *
 * Modellen skriver BARA texten (sammanfattning); poäng/markering/profil härleds
 * här så UI och poäng aldrig glider isär.
 */

/** Dimensionsordning för tie-break vid val av starkaste dimension. */
export const DIM_ORDER = ['system', 'framforhallning', 'prioritering', 'resurs', 'anpassning']

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Slutpoäng ur modellens tre kriterie-poäng (1–10 var). TOTAL = avrundat medel,
 * klampat 1–10. Markering ur cfg.scale. Delas av båda exempel (flykt/fermi) —
 * modellen sätter kriterie-poängen, KODEN gör totalen så UI och siffra aldrig glider.
 * @param {Array<{namn?:string, poang:number, motivering?:string}>} kriterier
 * @param {object} cfg  laddad station-config (scale)
 * @returns {{poang:number, markering:string}}
 */
export function totalFromKriterier(kriterier, cfg) {
  const poeng = (kriterier || [])
    .map((k) => Number(k && k.poang))
    .filter((n) => Number.isFinite(n))
    .map((n) => clamp(Math.round(n), 1, 10))
  const mean = poeng.length ? poeng.reduce((a, b) => a + b, 0) / poeng.length : 5
  const poang = clamp(Math.round(mean), 1, 10)
  const mark = (cfg && cfg.scale ? cfg.scale : []).find((m) => poang >= m.min && poang <= m.max)
  return { poang, markering: mark ? mark.label : '' }
}

/** Summera stegens band → råpoäng (Svag/Godkänd/Stark → bandPoints). */
export function bandSum(bands, bandPoints) {
  return bands.reduce((s, b) => s + (bandPoints[b] ?? 0), 0)
}

/** Räkna hur ofta varje dimension var sann över stegen. */
export function tallyDimensions(prior) {
  const tally = {}
  for (const dim of DIM_ORDER) tally[dim] = 0
  for (const p of prior) {
    const dims = p.dimensioner ?? {}
    for (const dim of DIM_ORDER) if (dims[dim]) tally[dim] += 1
  }
  return tally
}

/** Starkaste dimensionen (flest sanna steg; tie-break = DIM_ORDER). */
export function strongestDimension(prior) {
  const tally = tallyDimensions(prior)
  let best = DIM_ORDER[0]
  let bestN = -1
  for (const dim of DIM_ORDER) {
    if (tally[dim] > bestN) {
      bestN = tally[dim]
      best = dim
    }
  }
  return best
}

/**
 * Beräkna slutpoäng + härledd markering + profil.
 * @param {Array<{band:string, dimensioner:object}>} prior  de tre stegens bedömningar
 * @param {object} cfg  laddad station-config (scoring, profiles, scale)
 * @returns {{poang:number, markering:string, profil:string, strongest:string, base:number, bonus:number}}
 */
export function computeFinal(prior, cfg) {
  const scoring = cfg.scoring
  const bands = prior.map((p) => p.band)
  const base = bandSum(bands, scoring.bandPoints)

  const anpassningCount = prior.filter((p) => p.dimensioner && p.dimensioner.anpassning).length
  const bonus = anpassningCount >= scoring.bonus.minSteps ? scoring.bonus.points : 0

  const poang = clamp(base + bonus, scoring.clamp.min, scoring.clamp.max)

  const strongest = strongestDimension(prior)
  const profil = (cfg.profiles && cfg.profiles[strongest]) || '—'

  const mark = (cfg.scale || []).find((m) => poang >= m.min && poang <= m.max)
  const markering = mark ? mark.label : ''

  return { poang, markering, profil, strongest, base, bonus }
}

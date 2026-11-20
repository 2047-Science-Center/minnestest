/**
 * Mått per person för VALdi (xy-rigg/SOM.md "Mått per person för VALdi", spikad 2026-11-20).
 * Design: xy-arkitektur/XY-VALDI-BEDOMNING.md §2–3, integritet §8.
 *
 * Station 2 är delad: sida A Människotestet (`plats: "lur"`), sida B Lögndetektorn (`plats: "talare"`).
 * Stationen MÄTER, den bedömer inte: inga vikter eller valv här. Ren funktion, testbar.
 *
 *   A: matt = { manniskopoang (snitt 0–10 av personens svar), slapptin (0/1, gruppens utlåtande) }
 *   B: matt = { overtygande (snitt 0–10 av personens turer), rum (roomsCleared) }
 *   utdrag = kort städat transkriptutdrag (≤ 200 tecken, ordgräns, inga radbrytningar, inga andras namn).
 *
 * Ett mått som inte går att räkna utelämnas (aldrig 0 som "saknas"). Personen på roster-index i
 * talade på tur i i varje rum (deltagare i = participants[i] = roster[i]); index utan tur får
 * inget `overtygande`/`manniskopoang` och inget `utdrag`.
 */
import type { Game } from '@/config'

/** En tur ur ett skarpt rum: personens dolda AI-poäng och transkript. */
export interface Tur {
  poang: number
  transcript: string
}

export interface ValdiMattIn {
  game: Game
  /** Skarpa rum i ordning; varje rum = svar per deltagarindex (null = ingen tur/inget svar). */
  turer: (Tur | null)[][]
  /** Slutresultatet (null = spelet tog inte slut → gruppmåtten utelämnas). */
  outcome: { granted: boolean; roomsCleared: number } | null
  /** Gruppens namn (rensas ur utdragen: inga namn på andra, §8). */
  namn?: string[]
}

export interface ValdiPersonMatt {
  plats: 'lur' | 'talare'
  matt: Record<string, number>
  utdrag?: string
}

export const UTDRAG_MAX = 200

const avrunda = (n: number) => Math.round(n * 10) / 10

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Städa ett transkript till ett utdrag: en rad, andras namn bort, ≤ max tecken klippt vid ordgräns. */
export function utdragAv(transcript: string, namn: string[] = [], max = UTDRAG_MAX): string | undefined {
  let s = transcript.replace(/\s+/g, ' ').trim()
  for (const n of namn) {
    const ren = n.trim()
    if (!ren) continue
    s = s.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(ren)}(?![\\p{L}\\p{N}])`, 'giu'), '…')
  }
  if (!s) return undefined
  if (s.length <= max) return s
  const plats = max - 1 // ett tecken till "…"
  const klipp = s.slice(0, plats + 1)
  const sista = klipp.lastIndexOf(' ')
  const kropp = (sista > 0 ? klipp.slice(0, sista) : s.slice(0, plats)).replace(/[\s,;:.–-]+$/u, '')
  return `${kropp}…`
}

/** Mått + utdrag för personen på deltagarindex `i`. */
export function valdiMattFor(i: number, inp: ValdiMattIn): ValdiPersonMatt {
  const mina = inp.turer.map((rum) => rum[i]).filter((t): t is Tur => t != null && Number.isFinite(t.poang))
  const snitt = mina.length ? avrunda(mina.reduce((s, t) => s + t.poang, 0) / mina.length) : undefined
  const matt: Record<string, number> = {}
  let plats: ValdiPersonMatt['plats']

  if (inp.game === 'manniskotest') {
    plats = 'lur'
    if (snitt != null) matt.manniskopoang = snitt
    if (inp.outcome) matt.slapptin = inp.outcome.granted ? 1 : 0
  } else {
    plats = 'talare'
    if (snitt != null) matt.overtygande = snitt
    if (inp.outcome) matt.rum = inp.outcome.roomsCleared
  }

  // Utdraget: personens starkaste tur med något sagt (lika → den första).
  const sagt = mina.filter((t) => t.transcript.trim())
  const basta = sagt.reduce<Tur | null>((b, t) => (!b || t.poang > b.poang ? t : b), null)
  const utdrag = basta ? utdragAv(basta.transcript, inp.namn ?? []) : undefined

  return utdrag ? { plats, matt, utdrag } : { plats, matt }
}

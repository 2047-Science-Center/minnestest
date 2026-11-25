/**
 * Station 2:s nya spel i stationsskalet (Josef 2026-11-24, xy-rigg/SOM.md "Station 2 från 2026-11-24").
 * Skalet (den här appen) äger entrén, rotationen, resultatet och leken; efter entrén öppnas sidans spel
 * i helskärm: sida A = Människa eller maskin (:8796), sida B = Lögndetektorn (:8798), på samma dator.
 * Spelet svarar med postMessage {kalla:"xy-st2", typ:"skarp"|"klar", personer?}.
 * Ren logik här (testbar); vyn är components/ExternSpel.vue.
 */
import { UTDRAG_MAX } from './store/valdiMatt'

export type SideId = 'A' | 'B'

/** Spelens portar på stationens NUC (appens egna servrar; samma dator → inga IP:n). */
export const SPEL_PORT: Record<SideId, number> = { A: 8796, B: 8798 }

/** Sidans spel-URL, eller null = de gamla rumsspelen (delad vy, eller ?spel=gammalt). ?spelurl= överstyr. */
export function externSpelUrl(side: SideId | null, loc: { search: string; protocol: string; hostname: string }): string | null {
  const q = new URLSearchParams(loc.search)
  if (q.get('spel') === 'gammalt') return null
  const egen = q.get('spelurl')
  if (egen) return egen
  if (!side) return null
  return `${loc.protocol}//${loc.hostname}:${SPEL_PORT[side]}/`
}

/** Parametrar som skalet skickar vidare till spelet (test/rigg). lur/lurar/lurnamn = lurarnas etiketter
 *  (deploy/nuc/st2-ljud.sh: XY-lur-A1/A2/B) — sida A lyssnar per tur på den aktiva spelarens lur. */
export const VIDAREBEFORDRA = ['lur', 'lurar', 'lurnamn', 'text', 'snabb', 'mock', 'debug', 'sensor', 'halmax', 'hal', 'ovning', 'aterkalla', 'fall'] as const

/** Spelets adress med gruppen + skalets origin. */
export function spelSrc(o: { url: string; namn: string[]; grupp: string | null; skalOrigin: string; mqttUrl: string | null; search: string }): string {
  const u = new URL(o.url)
  u.searchParams.set('embed', '1')
  u.searchParams.set('skal', o.skalOrigin)
  if (o.namn.length) {
    u.searchParams.set('namn', o.namn.join(','))
    u.searchParams.set('spelare', String(o.namn.length))
  }
  if (o.grupp) u.searchParams.set('grupp', o.grupp)
  if (o.mqttUrl) u.searchParams.set('mqtt', o.mqttUrl)
  const q = new URLSearchParams(o.search)
  for (const k of VIDAREBEFORDRA) {
    const v = q.get(k)
    if (v != null && !u.searchParams.has(k)) u.searchParams.set(k, v)
  }
  return u.toString()
}

export interface ExternPerson {
  index: number
  plats?: string
  matt: Record<string, number>
  utdrag?: string
}

const PLATSER = new Set(['lur', 'talare'])

/** Spelets personer → kontrollerade rader (bara tal i matt, kända platser, utdrag ≤ 200). Okänt kastas. */
export function tolkaPersoner(raw: unknown): ExternPerson[] {
  if (!Array.isArray(raw)) return []
  const ut: ExternPerson[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    const index = Number(o.index)
    if (!Number.isInteger(index) || index < 0 || index > 9) continue
    const matt: Record<string, number> = {}
    if (o.matt && typeof o.matt === 'object') {
      for (const [k, v] of Object.entries(o.matt as Record<string, unknown>)) {
        if (/^[a-z_]{1,32}$/.test(k) && typeof v === 'number' && Number.isFinite(v)) matt[k] = v
      }
    }
    const p: ExternPerson = { index, matt }
    if (typeof o.plats === 'string' && PLATSER.has(o.plats)) p.plats = o.plats
    if (typeof o.utdrag === 'string' && o.utdrag.trim()) p.utdrag = o.utdrag.trim().slice(0, UTDRAG_MAX)
    ut.push(p)
  }
  return ut
}

/** result_value (gammalt fält) ur måtten: personens 0–10-poäng avrundad, annars 0. */
export function resultValueAv(p: ExternPerson | undefined): number {
  const v = p?.matt.manniskopoang ?? p?.matt.overtygande
  return typeof v === 'number' ? Math.round(v) : 0
}

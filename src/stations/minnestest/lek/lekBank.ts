/**
 * Lek-lägets innehåll för station 2 + ren logik (testad i lekBank.test.ts).
 *   2A "Fråga VALdi" (telefonsidan / Människotestet)
 *   2C "Håll tråden"  (lögnsidan / Lögndetektorn)
 * Kurerat för 13–16 år. Nämner aldrig valv/arbetslag (skyddar sorteringen).
 */

/* ---------------- 2A FRÅGA VALDI ---------------- */

export const FRAGOR: string[] = [
  'Vad är min superkraft?',
  'Vad skulle jag kunna uppfinna?',
  'Vilket jobb som inte finns än skulle passa mig?',
  'Vad är jag bra på utan att veta om det?',
  'Vilket äventyr borde jag ge mig ut på?',
  'Vad skulle jag kunna lära en robot?',
]

/** Det man berättar i luren (samma för alla frågor). */
export const BERATTA = 'Berätta om dig själv: vad gillar du att göra?'
export const BERATTA_MS = 15_000

/** Offline-reservens snabbval (tre ja/nej-par). Index 0 = vänster, 1 = höger. */
export const SNABBVAL: Array<[string, string]> = [
  ['Morgon', 'Kväll'],
  ['Planera', 'Hitta på'],
  ['Ensam', 'Tillsammans'],
]

/**
 * Förskrivna svar för offline-reserven: ett per kombination av snabbvalen
 * (bit 0 = morgon/kväll, bit 1 = planera/hitta på, bit 2 = ensam/tillsammans).
 * Skrivna så att de svarar på vilken av FRAGOR som helst.
 */
export const OFFLINE_SVAR: string[] = [
  'Du är en tidig planerare som gillar lugn och ro. Din superkraft: du ser mönster innan andra ens har vaknat. Sådana som du bygger saker som håller.',
  'Morgonmänniska med fri fantasi som trivs i egen takt. Din superkraft är idéer som kommer från ingenstans — skriv ner dem, de är värda mer än du tror.',
  'Du vaknar tidigt, planerar och vill ha folk omkring dig. Din superkraft: du får grupper att faktiskt komma iväg. Utan dig hade alla fortfarande stått och väntat.',
  'Morgonpigg, spontan och social — en farlig kombination, på bästa sätt. Din superkraft är att få andra att våga hänga på.',
  'Kvällsmänniska som planerar i tysthet. Din superkraft är tålamod: du löser det andra har gett upp på, gärna när det är mörkt ute.',
  'Kvällsuggla med fri fantasi som trivs bäst själv. Din superkraft: du hittar på saker som ingen maskin hade kunnat räkna ut.',
  'Du blir piggare ju senare det blir, och du gillar en plan som alla är med på. Din superkraft är att hålla ihop gänget när det börjar bli rörigt.',
  'Spontan kvällsmänniska som laddar bäst med andra. Din superkraft: du förvandlar en vanlig kväll till något folk pratar om länge efteråt.',
]

export function offlineSvar(val: number[]): string {
  const idx = (val[0] ? 1 : 0) + (val[1] ? 2 : 0) + (val[2] ? 4 : 0)
  return OFFLINE_SVAR[idx] ?? OFFLINE_SVAR[0]
}

/** Tre frågor att välja bland (blandade, deterministiskt med rnd). */
export function threeQuestions(rnd: () => number = Math.random): string[] {
  const a = FRAGOR.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, 3)
}

/* ---------------- 2C HÅLL TRÅDEN ---------------- */

export const AMNEN: string[] = [
  'Världens bästa smörgås',
  'Om jag fick en egen ö',
  'Det perfekta lovet',
  'Varför katter är bättre än hundar (eller tvärtom)',
  'Min drömrobot',
  'Hur man bygger en snögubbe',
  'Den bästa pizzan',
  'Om djur kunde prata',
  'Världens tråkigaste superkraft',
  'Hur skolan ser ut om hundra år',
  'Det bästa spelet någonsin',
  'Om jag var osynlig en dag',
  'Hur man lagar världens godaste frukost',
  'Ett hus på månen',
  'Den perfekta födelsedagen',
  'Om jag fick bestämma över fredagar',
  'Vad man packar till ett äventyr i skogen',
  'Hur man tränar en drake',
]

export const TRAD = {
  /** Tystnad längre än så här → surr. */
  silenceMs: 2500,
  /** Ingen tystnadskoll de första ms (man hinner börja). */
  graceMs: 3000,
  /** Drift-koll var så här ofta (online). */
  driftEveryMs: 5000,
  /** Första drift-kollen tidigast efter. */
  driftFirstMs: 8000,
  /** Klarar man så här länge har tråden hållit hela vägen. */
  maxMs: 90_000,
} as const

/**
 * Tystnadsdetektor (ren): matas med ljudnivå (RMS 0..1) + tid. Brusgolvet
 * kalibreras under nedräkningen; tal = nivå över max(golv × 2,5, 0,012).
 */
export interface SilenceState {
  floor: number
  lastVoiceAt: number
  startedAt: number
}
export function silenceThreshold(floor: number): number {
  return Math.max(floor * 2.5, 0.012)
}
export function feedLevel(s: SilenceState, rms: number, now: number): { state: SilenceState; silent: boolean } {
  const voice = rms >= silenceThreshold(s.floor)
  const next = voice ? { ...s, lastVoiceAt: now } : s
  const sinceStart = now - s.startedAt
  const silent = sinceStart >= TRAD.graceMs && now - Math.max(next.lastVoiceAt, s.startedAt + TRAD.graceMs - TRAD.silenceMs) >= TRAD.silenceMs
  return { state: next, silent }
}

/** Resultatlistan (RAM): längsta först, högst 5. */
export interface TradResultat {
  namn: string
  ms: number
  orsak: 'tyst' | 'drift' | 'max' | 'stopp'
}
export function topplista(list: TradResultat[]): TradResultat[] {
  return list.slice().sort((a, b) => b.ms - a.ms).slice(0, 5)
}

/**
 * /assess-kontraktet — det generella JSON-drivna GPT-anropet, utökat till
 * per-steg + deterministisk final-compose, för TVÅ exempel-typer:
 *   flykt: band + motiverat (grind).
 *   fermi: resonemang_niva (modellen) × traff (koden) → delpoäng (matris).
 * `configId` väljer gateway-config; koden räknar alltid siffran, modellen texten.
 */

export type Band = 'Stark' | 'Godkänd' | 'Svag'
export type FermiNiva = 'Exceptionell' | 'Stark' | 'Godkänd' | 'Svag'
export type FermiTraff = 'prick' | 'tiopotens' | 'utanfor'

/** Dimensioner varierar per exempel (flykt: 5 nycklar, fermi: 5 andra). */
export type Dimensioner = Record<string, boolean>

/** Ett tidigare stegs bedömning (superset för båda exempel). */
export interface PriorStep {
  step: number
  /** Gatad stege: nivåns resonemangspoäng 0–10 + kommentar (kontext till modellen). */
  poang?: number
  kommentar?: string
  band?: Band
  motiverat?: boolean
  resonemang_niva?: FermiNiva
  traff?: FermiTraff
  delpoang?: number
  guess?: number | null
  dimensioner?: Dimensioner
  kvitterat?: string
  miss?: string
  /** Gruppens tänk-högt-transkript för steget (svar + motivering) — modellen
   *  poängsätter de tre kriterierna ur detta i final-compose. */
  transcript?: string
}

export interface StepInput {
  /** Nivå-index 1..5 i den gatade stegen. */
  step: number
  role: string
  example: string
  transcript: string
  /** Fermi: gruppens numeriska gissning + enhet (null om de hoppade). */
  guess?: number | null
  unit?: string
  /** Fermi ja/nej-nivå: gruppens val ('Ja'/'Nej'). */
  val?: string
  /** Flykt: packlistan från steg 1 (skickas i steg 3). */
  packlista?: string
  /** Gatad stege: nivåns fråga (UI-copy) + gate-rubrik + tröskel (0–10). */
  fraga?: string
  rubrik?: string
  threshold?: number
  prior: PriorStep[]
}

export interface FinalInput {
  step: 'final'
  role: string
  example: string
  prior: PriorStep[]
}

export interface AssessMeta {
  lang: string
  modelOverride?: string
}

/** Per-steg-svar (superset). Koden fyller traff/delpoang (fermi) resp. band-cap
 *  (flykt); modellen fyller resten. */
export interface StepAssessment {
  /** Gatad stege: modellens resonemangspoäng 0–10 mot nivåns rubrik (koden gatar). */
  poang?: number
  /** Kort kommentar om prestationen (positiv om godkänd). */
  kommentar?: string
  /** Vad som saknades för att nå tröskeln (bara vid underkänt). */
  saknades?: string
  band?: Band
  motiverat?: boolean
  resonemang_niva?: FermiNiva
  traff?: FermiTraff
  delpoang?: number
  dimensioner: Dimensioner
  kvitterat: string
  miss: string
  ankare: string
  svar_text: string
  osakert: string[]
}

/** Ett bedömt kriterium i slut-ceremonin (modellen sätter poäng 1–10 + motivering). */
export interface Kriterium {
  namn: string
  poang: number
  motivering: string
}

export interface FinalResult {
  poang: number
  profil: string
  markering: string
  /** De tre resonemangs-kriterierna, var för sig 1–10 + kort motivering. */
  kriterier: Kriterium[]
  /** EN mening som rösten läser upp (positiv, profilering, lyfter en grupp-egenskap). */
  slutmening: string
  /** Bakåtkompatibel — ersatt av slutmening/kriterier. */
  sammanfattning?: string
  /** Fermi: verklig svensk siffra som payoff efter landningen. */
  facit?: string
}

export interface Assess {
  assessStep(configId: string, input: StepInput, meta: AssessMeta): Promise<StepAssessment>
  composeFinal(configId: string, input: FinalInput, meta: AssessMeta): Promise<FinalResult>
}

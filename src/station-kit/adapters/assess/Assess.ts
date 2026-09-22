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
  band?: Band
  motiverat?: boolean
  resonemang_niva?: FermiNiva
  traff?: FermiTraff
  delpoang?: number
  guess?: number | null
  dimensioner?: Dimensioner
  kvitterat?: string
  miss?: string
}

export interface StepInput {
  step: 1 | 2 | 3
  role: string
  example: string
  transcript: string
  /** Fermi: gruppens numeriska gissning + enhet (null om de hoppade). */
  guess?: number | null
  unit?: string
  /** Flykt: packlistan från steg 1 (skickas i steg 3). */
  packlista?: string
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

export interface FinalResult {
  poang: number
  profil: string
  markering: string
  sammanfattning: string
  /** Fermi: verklig svensk siffra som payoff efter landningen. */
  facit?: string
}

export interface Assess {
  assessStep(configId: string, input: StepInput, meta: AssessMeta): Promise<StepAssessment>
  composeFinal(configId: string, input: FinalInput, meta: AssessMeta): Promise<FinalResult>
}

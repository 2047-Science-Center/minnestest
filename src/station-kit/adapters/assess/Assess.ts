/**
 * /assess-kontraktet — det generella JSON-drivna GPT-anropet, utökat till
 * per-steg + en deterministisk final-compose. En ny station = en ny
 * `configs/<id>.json` i gatewayen; DENNA kod (och frontend-adaptern) ändras ej.
 *
 * Formen speglar innehållsspec §6.1/§6.3. Fronten pratar ALDRIG direkt med
 * OpenAI — alltid via denna adapter → gateway (nyckeln bor server-side).
 */

/** De fem bedömda dimensionerna (delade av båda roller; `resurs`/`anpassning`
 *  är metodspecialist-lagret, byts mot inferenslager för doktoranden). */
export interface Dimensioner {
  system: boolean
  framforhallning: boolean
  prioritering: boolean
  resurs: boolean
  anpassning: boolean
}

export type Band = 'Stark' | 'Godkänd' | 'Svag'

/** Ett tidigare stegs bedömning, skickas som `prior[]` så modellen kan belöna
 *  att gruppen väver in det som redan hänt. */
export interface PriorStep {
  step: number
  band: Band
  dimensioner: Dimensioner
  kvitterat: string
  miss: string
}

export interface StepInput {
  step: 1 | 2 | 3
  role: string
  scenario: string
  transcript: string
  resources: string[]
  prior: PriorStep[]
}

export interface FinalInput {
  step: 'final'
  role: string
  scenario: string
  resources: string[]
  prior: PriorStep[]
}

export interface AssessMeta {
  lang: string
  modelOverride?: string
}

/** Per-steg-svar (§6.1). */
export interface StepAssessment {
  band: Band
  dimensioner: Dimensioner
  kvitterat: string
  miss: string
  ankare: string
  /** 3–4 meningar, NPC-ton — visas och (valfritt) läses upp. */
  svar_text: string
  /** Ev. yttranden som behandlades neutralt vid genuin osäkerhet. */
  osakert: string[]
}

/** Final-compose-svar (§6.3). `poang`/`markering`/`profil` beräknas
 *  deterministiskt i gatewayen; modellen skriver bara `sammanfattning`. */
export interface FinalResult {
  poang: number
  profil: string
  markering: string
  sammanfattning: string
}

export interface Assess {
  /** Bedöm ett steg. Kastar vid nät-/serverfel (anroparen maskerar/omprövar). */
  assessStep(input: StepInput, meta: AssessMeta): Promise<StepAssessment>
  /** Väv ihop de tre stegen till profil + slutpoäng. */
  composeFinal(input: FinalInput, meta: AssessMeta): Promise<FinalResult>
}

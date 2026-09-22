/**
 * Central config för Minnestestet (X&Y-riggen).
 *
 * Rollvalet är en FORK (metodspecialist-Fermi-spec §0): `role → exampleId →
 * exempeldata + configs/<configId>.json`. Två OLIKA exempel delar motorn
 * (trestegsraket, tvåfas tänk-högt, /assess per-steg, final-compose, stigande
 * skala); det som skiljer dem är hela uppgiftsinnehållet + bedömningen.
 *   metodspecialist → 'fermi-skrotbilar' (Fermi-skattning) — byggs skarpt.
 *   doktorand       → 'flykt'            (flykt undan krig).
 *
 * Pilot vs drift skiljs av `mode`. INGA hemligheter här (nycklar i gatewayns
 * .env). Fronten pratar aldrig direkt med OpenAI/ElevenLabs — alltid via adapter.
 */

export type Mode = 'pilot' | 'production'
export type RoleId = 'metodspecialist' | 'doktorand'
export type ExampleId = 'flykt' | 'fermi-skrotbilar'
export type ExampleType = 'flykt' | 'fermi'

export const STATION_N = 0

export const config = {
  mode: 'pilot' as Mode,
  stationN: STATION_N,
  lang: 'sv' as 'sv' | 'no' | 'svorsk',

  /** Tänk-högt-fönster per steg (sekunder) och när 10-sek-varningen tänds. */
  stepSeconds: 60,
  warnAtSeconds: 10,

  /** Incheckningens auto-vidare (ms). */
  checkinAutoMs: 2000,

  /** /assess-gatewayen. baseUrl byts pilot→drift; configId kommer per exempel. */
  assess: {
    baseUrl: import.meta.env.VITE_ASSESS_URL || 'http://localhost:8787',
  },

  /** NPC-röst (/speak, ElevenLabs). Texten bär alltid; röst är add-on ovanpå.
   *  `rate` = uppspelningshastighet i klienten (pitch bevaras). */
  speak: {
    enabled: true,
    rate: 1.4,
  },

  production: {
    wsUrl: '',
    mqttUrl: '',
  },
} as const

/**
 * Bygger en url till en fil i public/ som funkar oavsett bas-sökväg.
 */
export function asset(path: string): string {
  return encodeURI(import.meta.env.BASE_URL + path.replace(/^\/+/, ''))
}

/* ------------------------------------------------------------------ *
 * Roller — rollvalet loggas (chosen_role/role_presented_as, matar könssiffran)
 * OCH forkar till exempel (§0).
 * ------------------------------------------------------------------ */

export interface RoleDef {
  id: RoleId
  media: string
  resultRole: 'A' | 'B'
  /** Forken: vilket exempel rollen leder in på. */
  example: ExampleId
}

export const ROLES: RoleDef[] = [
  { id: 'metodspecialist', media: 'roll_metodspecialist', resultRole: 'A', example: 'fermi-skrotbilar' },
  { id: 'doktorand', media: 'roll_doktorand', resultRole: 'B', example: 'flykt' },
]

/* ------------------------------------------------------------------ *
 * Exempel — två olika uppgiftstyper på samma motor.
 * ------------------------------------------------------------------ */

export interface ExampleStep {
  /** i18n-nyckelrot, t.ex. 'flykt.steg1' / 'fermi.steg1'. */
  key: string
  /** Stegets referensbild (media-id) — ligger kvar genom steget. */
  referenceMedia: string
  /** Latensmask-klipp i analys-rutan; utelämnas → referensbilden används. */
  analysMedia?: string
  /** Fermi: enhet på gissningen ('kg' | 'antal' | 'ton'). */
  unit?: string
}

export interface ExampleDef {
  id: ExampleId
  type: ExampleType
  /** Gateway-config (configs/<configId>.json). */
  configId: string
  /** Extra intro-skärm före steg 1 (Fermi-intro). Utelämnas = ingen. */
  introMedia?: string
  /** Nedräkning innan uppgiften startar (beat 3). */
  countdownFrom: number
  steps: ExampleStep[]
}

export const EXAMPLES: Record<ExampleId, ExampleDef> = {
  // Doktorand-sidan — flykt undan krig (byggd tidigare).
  flykt: {
    id: 'flykt',
    type: 'flykt',
    configId: 'flykt',
    countdownFrom: 10,
    steps: [
      { key: 'flykt.steg1', referenceMedia: 'flykt_1_packa' },
      { key: 'flykt.steg2', referenceMedia: 'flykt_2_vagar' },
      { key: 'flykt.steg3', referenceMedia: 'flykt_3_skog' },
    ],
  },
  // Metodspecialist-sidan — sluten Fermi-skattning (skrotbilar).
  'fermi-skrotbilar': {
    id: 'fermi-skrotbilar',
    type: 'fermi',
    configId: 'fermi-skrotbilar',
    introMedia: 'intro_fermi',
    countdownFrom: 3,
    steps: [
      { key: 'fermi.steg1', referenceMedia: 'steg1_bil', analysMedia: 'esk1_berakning', unit: 'kg' },
      { key: 'fermi.steg2', referenceMedia: 'steg2_trafik', analysMedia: 'esk2_berakning', unit: 'antal' },
      { key: 'fermi.steg3', referenceMedia: 'steg3_skrot', analysMedia: 'esk3_overgang', unit: 'ton' },
    ],
  },
}

export function exampleForRole(role: RoleId): ExampleDef {
  const r = ROLES.find((x) => x.id === role) ?? ROLES[0]
  return EXAMPLES[r.example]
}

/* ------------------------------------------------------------------ *
 * Stigande slutskala 1–10 — namngivna markeringar (delad av båda exempel).
 * ------------------------------------------------------------------ */

export interface ScaleMark {
  min: number
  max: number
  key: string
}

export const SCALE_MARKS: ScaleMark[] = [
  { min: 1, max: 2, key: 'skala.mark_1_2' },
  { min: 3, max: 4, key: 'skala.mark_3_4' },
  { min: 5, max: 6, key: 'skala.mark_5_6' },
  { min: 7, max: 8, key: 'skala.mark_7_8' },
  { min: 9, max: 10, key: 'skala.mark_9_10' },
]

export const PILOT_GROUP = {
  id: '07',
  members: ['Alva', 'Noah', 'Iris'],
} as const

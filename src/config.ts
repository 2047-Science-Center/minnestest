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

/** Minnestestet = station 2 i X&Y-kedjan (incheckning → st1 → st2 → reveal …). */
export const STATION_N = 2

export const config = {
  mode: 'pilot' as Mode,
  stationN: STATION_N,
  lang: 'sv' as 'sv' | 'no' | 'svorsk',

  /** Tänk-högt-fönster per block (sekunder) och när varningen tänds. Rappare
   *  tempo i gatade stegen: 30 s per block (svar resp. motivering). */
  stepSeconds: 30,
  warnAtSeconds: 7,

  /** Incheckningens auto-vidare (ms). */
  checkinAutoMs: 2000,

  /** /assess-gatewayen. Kiosk-bygget sätter VITE_ASSESS_URL='' → tomt = SAMMA
   *  ORIGIN (gatewayn serverar även appen). Osatt (dev) → separat gateway-port.
   *  `??` (inte `||`) så tom sträng bevaras som "same origin". */
  assess: {
    baseUrl: (import.meta.env.VITE_ASSESS_URL ?? 'http://localhost:8787') as string,
  },

  /** NPC-röst (/speak, ElevenLabs). Texten bär alltid; röst är add-on ovanpå.
   *  `rate` = uppspelningshastighet i klienten (pitch bevaras). */
  speak: {
    enabled: true,
    rate: 0.7,
  },

  /** Drift-adresser. wsUrl tomt → BroadcastChannel (samma-dator-synk).
   *  mqttUrl = broker för identitet/resultat/ljus (webbläsare → ws-lyssnare).
   *  Överstyrs vid bygget med VITE_MQTT_URL. Inga hemligheter här. */
  production: {
    wsUrl: '',
    mqttUrl: 'ws://127.0.0.1:9001',
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
  /** i18n-nyckelrot, t.ex. 'flykt.niva1' / 'fermi.niva1'. */
  key: string
  /** Stegets referensbild (media-id) — ligger kvar genom steget. */
  referenceMedia: string
  /** Latensmask-klipp i analys-rutan; utelämnas → referensbilden används. */
  analysMedia?: string
  /** Fermi: enhet på gissningen ('kg' | 'antal' | 'ton' | 'lass'). */
  unit?: string
  /** Fermi-gissning: stegets +/- -knappar (touch). Olika skala per nivå. */
  guess?: GuessScale
  /** Fermi ja/nej-nivå: svars-blocket blir två knappar i stället för sifferväljare. */
  choice?: string[]
  /** Gate-rubrik: vad ett godkänt resonemang kräver på DEN HÄR nivån (stigande
   *  krav). Skickas till /assess så modellen poängsätter mot rätt ribba. */
  rubrik: string
}

/** Touch-stepper för Fermi-gissningen: bas-steg, gränser och startvärde. */
export interface GuessScale {
  /** Ökning/minskning per tryck (och bas för håll-acceleration). */
  step: number
  min: number
  max: number
  /** Förifyllt värde (mitt i ett rimligt spann → färre tryck). */
  start: number
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
  // Doktorand-sidan — flykten som en gatad stege: allt mer pressad & specifik.
  flykt: {
    id: 'flykt',
    type: 'flykt',
    configId: 'flykt',
    countdownFrom: 3,
    steps: [
      {
        key: 'flykt.niva1', referenceMedia: 'flykt_1_packa',
        rubrik: 'GENERÖS nivå: nämn något rimligt att ta med och minsta lilla skäl. Nästan allt rimligt godkänns.',
      },
      {
        key: 'flykt.niva2', referenceMedia: 'flykt_2_vagar',
        rubrik: 'Väg minst EN avvägning (t.ex. snabbt vs säkert, stor väg vs liten) och motivera vägvalet.',
      },
      {
        key: 'flykt.niva3', referenceMedia: 'flykt_3_skog',
        rubrik: 'Visa risk-resonemang kring vägspärren/soldaterna OCH en plan B om det går fel.',
      },
      {
        key: 'flykt.niva4', referenceMedia: 'flykt_2_vagar',
        rubrik: 'Väg konsekvenser åt BÅDA håll (ta med främlingen eller inte) — inte bara en sida.',
      },
      {
        key: 'flykt.niva5', referenceMedia: 'flykt_3_skog',
        rubrik: 'Fatta ett TYDLIGT beslut under tidspress och osäkerhet och försvara det med framförhållning.',
      },
    ],
  },
  // Metodspecialist-sidan — skattnings-stegen: eskalerande Fermi-skattningar.
  'fermi-skrotbilar': {
    id: 'fermi-skrotbilar',
    type: 'fermi',
    configId: 'fermi-skrotbilar',
    countdownFrom: 3,
    steps: [
      {
        key: 'fermi.niva1', referenceMedia: 'steg1_bil', analysMedia: 'esk1_berakning', unit: 'kg',
        guess: { step: 10, min: 100, max: 5000, start: 1000 },
        rubrik: 'GENERÖS nivå: ge en rimlig storleksordning för en bils vikt + minsta skäl.',
      },
      {
        key: 'fermi.niva2', referenceMedia: 'steg2_trafik', analysMedia: 'esk2_berakning', unit: 'antal',
        guess: { step: 5000, min: 0, max: 1000000, start: 100000 },
        rubrik: 'Bryt ner antalet skrotade bilar/år (t.ex. antal bilar × andel som skrotas) — gissa inte blint.',
      },
      {
        key: 'fermi.niva3', referenceMedia: 'steg3_skrot', analysMedia: 'esk3_overgang', unit: 'ton',
        guess: { step: 5000, min: 0, max: 2000000, start: 100000 },
        rubrik: 'Kombinera vikt × antal till ton OCH gör en storleksordnings-sanity-check.',
      },
      {
        key: 'fermi.niva4', referenceMedia: 'steg3_skrot', choice: ['Ja', 'Nej'],
        rubrik: 'Jämför ett års skrotmetall mot Eiffeltornet (~7 300 ton), explicita antaganden, tydlig ja/nej.',
      },
      {
        key: 'fermi.niva5', referenceMedia: 'steg2_trafik', unit: 'lass',
        guess: { step: 1000, min: 0, max: 500000, start: 50000 },
        rubrik: 'Dela ton med lastbilskapacitet (~25 ton/lass) och motivera antagandet.',
      },
    ],
  },
}

export function exampleForRole(role: RoleId): ExampleDef {
  const r = ROLES.find((x) => x.id === role) ?? ROLES[0]
  return EXAMPLES[r.example]
}

/**
 * ÖVNINGSEXEMPEL (testläge) — EN enkel övningsfråga per gren, egen gateway-config
 * (fermi-ovning/flykt-ovning). Deltagarna svarar, får en riktig bedömning och ser
 * poäng-genomgången i testläge INNAN det skarpa. Ingen intro (coach-introt gjorde
 * den biten); countdown kort.
 */
export const PRACTICE: Record<ExampleId, ExampleDef> = {
  flykt: {
    id: 'flykt',
    type: 'flykt',
    configId: 'flykt-ovning',
    countdownFrom: 3,
    steps: [
      {
        key: 'flykt.ovning', referenceMedia: 'flykt_ovning_eld',
        rubrik: 'ÖVNING, generös: nämn något rimligt att ta med + minsta skäl.',
      },
    ],
  },
  'fermi-skrotbilar': {
    id: 'fermi-skrotbilar',
    type: 'fermi',
    configId: 'fermi-ovning',
    countdownFrom: 3,
    steps: [
      {
        key: 'fermi.ovning', referenceMedia: 'steg1_bil', analysMedia: 'esk1_berakning', unit: 'slag',
        guess: { step: 5000, min: 0, max: 500000, start: 100000 },
        rubrik: 'ÖVNING, generös: rimlig storleksordning + minsta skäl.',
      },
    ],
  },
}

/* ------------------------------------------------------------------ *
 * Gatad stege — stigande tröskel per nivå (0–10). L1–2 generösa, sen snabbt
 * hårdare. Poängen = högsta klarade nivån. Tunbar här.
 * ------------------------------------------------------------------ */
export const MAX_NIVA = 5
export const LEVEL_THRESHOLDS: readonly number[] = [2, 4, 6, 7, 8]

/** Tröskel för en nivå (0-indexerat steg). Övning (1 nivå) → generös. */
export function thresholdForLevel(index: number): number {
  return LEVEL_THRESHOLDS[index] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

export function practiceForRole(role: RoleId): ExampleDef {
  const r = ROLES.find((x) => x.id === role) ?? ROLES[0]
  return PRACTICE[r.example]
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

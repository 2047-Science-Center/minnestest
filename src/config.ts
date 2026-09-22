/**
 * Central config för Minnestestet (X&Y-riggen).
 *
 * Pilot vs drift skiljs av EN sak: `mode`. Allt annat (STATION_N, scenario-data,
 * timers, språk, gateway-URL) är konstanter/data här. Att lägga till ett
 * scenario/en station = ny data här + ny `configs/<id>.json` i gatewayen +
 * i18n/manifest — INGEN ändring i anropskoden.
 *
 * INGA hemligheter i denna fil (AI_API_KEY, ev. ElevenLabs-nyckel hör hemma i
 * gatewayns .env, aldrig i git). Fronten pratar aldrig direkt med OpenAI/
 * ElevenLabs — alltid via adapter → gateway.
 */

export type Mode = 'pilot' | 'production'
export type ScenarioId = 'strom' | 'internet'
export type RoleId = 'metodspecialist' | 'doktorand'

/** Stationens nummer i riggen. Topic-namespace blir `station<N>/…`.
 *  ANTA ALDRIG ett faktiskt legacy-nummer — bekräfta mot riggen innan skarp koppling. */
export const STATION_N = 0

export const config = {
  /** 'pilot' = BroadcastChannel + mock-identitet/resultat. 'production' =
   *  WebSocket + MQTT-identitet/resultat (stubbat). /assess är riktig i BÅDA. */
  mode: 'pilot' as Mode,

  stationN: STATION_N,

  /** Aktivt scenario. 'strom' byggs skarpt; 'internet' är stubbad struktur. */
  scenario: 'strom' as ScenarioId,

  /** Aktivt språk. Svenska byggd; no/svorsk stubbade. */
  lang: 'sv' as 'sv' | 'no' | 'svorsk',

  /** Tänk-högt-fönster per steg (sekunder) och när 10-sek-varningen tänds. */
  stepSeconds: 60,
  warnAtSeconds: 10,

  /** Incheckningens auto-vidare (ms). */
  checkinAutoMs: 2000,

  /** /assess-gatewayen. baseUrl byts pilot→drift (config.mode/driftadress);
   *  configId väljer `configs/<id>.json` i gatewayen. */
  assess: {
    baseUrl: import.meta.env.VITE_ASSESS_URL || 'http://localhost:8787',
    configId: 'minnestest',
  },

  /** NPC-röst (/speak, ElevenLabs). AV som default i pilot — texten bär allt. */
  speak: {
    enabled: false,
  },

  /** MQTT/WS-adresser fylls i driftläget (miljövariabler, ej här). */
  production: {
    wsUrl: '',
    mqttUrl: '',
  },
} as const

/**
 * Bygger en url till en fil i public/ som funkar oavsett bas-sökväg
 * (`/` i dev/host, ev. subpath på Pages). Filnamn med mellanslag encode:as.
 */
export function asset(path: string): string {
  return encodeURI(import.meta.env.BASE_URL + path.replace(/^\/+/, ''))
}

/* ------------------------------------------------------------------ *
 * Roller — rollvalet är det könssiffran mäter (chosen_role/role_presented_as).
 * Rollen är en lins: samma trestegsmotor, rollen färgar framing + det tunna
 * bedömnings-lagret (dim. 4). Två LIKVÄRDIGA kort.
 * ------------------------------------------------------------------ */

export interface RoleDef {
  id: RoleId
  /** Rollklipp (media-id i manifestet), spelas vid fokus. */
  media: string
  /** X&Y-resultatets rollbokstav (matar könssiffran uppströms). */
  resultRole: 'A' | 'B'
}

export const ROLES: RoleDef[] = [
  { id: 'metodspecialist', media: 'roll_metodspecialist', resultRole: 'A' },
  { id: 'doktorand', media: 'roll_doktorand', resultRole: 'B' },
]

/* ------------------------------------------------------------------ *
 * Scenarion — samma motor, olika skinn. All scenario-specifik text/media
 * ligger som DATA (i18n + manifest) keyat på scenarioId. 'strom' skarpt,
 * 'internet' stubbad (struktur redo, copy fylls i i18n senare).
 * ------------------------------------------------------------------ */

export interface StepDef {
  /** i18n-nyckelrot, t.ex. 'strom.steg1' → '<rot>.prompt', '<rot>.lage'. */
  key: string
  /** Lägesklipp (delruta A). null = ingen ny video, bara banner (i18n '<key>.banner'). */
  lagesMedia: string | null
  /** Eskaleringsklipp (delruta C) — fast längd = latensmask. */
  eskaleringMedia: string
  /** Diegetiska mätaretiketter (i18n-nycklar). En eller flera. */
  meterKeys: string[]
}

export interface ScenarioDef {
  id: ScenarioId
  /** Resurs-id:n som AI:n får veta finns (skickas som `resources` till /assess);
   *  visningsnamn via i18n `resurs.<id>`. Exakt de etiketterade i hem-revealet. */
  resources: string[]
  introMedia: string
  homeMedia: string
  /** Exakt tre steg. */
  steps: StepDef[]
}

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  strom: {
    id: 'strom',
    resources: ['vatten', 'gasspis', 'ficklampa', 'filtar', 'bilen', 'grannen'],
    introMedia: 'intro_strommen',
    homeMedia: 'hem_oversikt',
    steps: [
      {
        key: 'strom.steg1',
        lagesMedia: 'steg1_narr',
        eskaleringMedia: 'steg1_eskalering',
        meterKeys: ['strom.steg1.meter'],
      },
      {
        key: 'strom.steg2',
        lagesMedia: null,
        eskaleringMedia: 'steg2_eskalering',
        meterKeys: ['strom.steg2.meter_a', 'strom.steg2.meter_b'],
      },
      {
        key: 'strom.steg3',
        lagesMedia: null,
        eskaleringMedia: 'steg3_overgang',
        meterKeys: ['strom.steg3.meter_a', 'strom.steg3.meter_b'],
      },
    ],
  },
  // STUBB: doktorand/uppkopplingen — samma struktur, copy fylls i i18n (internet.*).
  internet: {
    id: 'internet',
    resources: ['router', 'powerbank', 'grannen', 'radio', 'kontanter', 'bilen'],
    introMedia: 'intro_internet',
    homeMedia: 'hem_oversikt_internet',
    steps: [
      { key: 'internet.steg1', lagesMedia: 'steg1_narr_internet', eskaleringMedia: 'steg1_eskalering_internet', meterKeys: ['internet.steg1.meter'] },
      { key: 'internet.steg2', lagesMedia: null, eskaleringMedia: 'steg2_eskalering_internet', meterKeys: ['internet.steg2.meter_a', 'internet.steg2.meter_b'] },
      { key: 'internet.steg3', lagesMedia: null, eskaleringMedia: 'steg3_overgang_internet', meterKeys: ['internet.steg3.meter_a', 'internet.steg3.meter_b'] },
    ],
  },
}

/** Aktivt scenario-objekt (bekvämt uppslag). */
export function activeScenario(): ScenarioDef {
  return SCENARIOS[config.scenario]
}

/* ------------------------------------------------------------------ *
 * Stigande slutskala 1–10 — namngivna markeringar (innehållsspec §4 ruta 17),
 * låg→hög. `key` slås upp i i18n. Gatewayns final-compose härleder `markering`
 * ur samma intervall så UI och poäng aldrig glider isär.
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

/* ------------------------------------------------------------------ *
 * Pilot-grupp (mockad identitet). Ersätts av riggens RFID-identitet i drift.
 * ------------------------------------------------------------------ */

export const PILOT_GROUP = {
  id: '07',
  members: ['Alva', 'Noah', 'Iris'],
} as const

/**
 * Central config för Minnestestet (X&Y-riggen) — FLYKT-scenariot.
 *
 * Pilot vs drift skiljs av EN sak: `mode`. Allt annat (STATION_N, scenario-data,
 * timers, språk, gateway-URL) är konstanter/data här. Att lägga till ett
 * scenario/en station = ny data här + ny `configs/<id>.json` i gatewayen +
 * i18n/manifest — INGEN ändring i anropskoden.
 *
 * INGA hemligheter i denna fil (AI_API_KEY, ElevenLabs-nyckel hör hemma i
 * gatewayns .env, aldrig i git). Fronten pratar aldrig direkt med OpenAI/
 * ElevenLabs — alltid via adapter → gateway.
 */

export type Mode = 'pilot' | 'production'
export type ScenarioId = 'flykt'
export type RoleId = 'metodspecialist' | 'doktorand'

/** Stationens nummer i riggen. Topic-namespace blir `station<N>/…`.
 *  ANTA ALDRIG ett faktiskt legacy-nummer — bekräfta mot riggen innan skarp koppling. */
export const STATION_N = 0

export const config = {
  /** 'pilot' = BroadcastChannel + mock-identitet/resultat. 'production' =
   *  WebSocket + MQTT-identitet/resultat (stubbat). /assess är riktig i BÅDA. */
  mode: 'pilot' as Mode,

  stationN: STATION_N,

  /** Aktivt scenario. */
  scenario: 'flykt' as ScenarioId,

  /** Aktivt språk. Svenska byggd; no/svorsk stubbade. */
  lang: 'sv' as 'sv' | 'no' | 'svorsk',

  /** Tänk-högt-fönster per steg (sekunder) och när 10-sek-varningen tänds. */
  stepSeconds: 60,
  warnAtSeconds: 10,

  /** Nedräkning innan uppgiften startar (beat 3): "Uppgiften börjar om …10, 9 …". */
  startCountdown: 10,

  /** Incheckningens auto-vidare (ms). */
  checkinAutoMs: 2000,

  /** /assess-gatewayen. baseUrl byts pilot→drift; configId väljer configs/<id>.json. */
  assess: {
    baseUrl: import.meta.env.VITE_ASSESS_URL || 'http://localhost:8787',
    configId: 'minnestest',
  },

  /** NPC-röst (/speak, ElevenLabs). Texten bär alltid; röst är add-on ovanpå.
   *  `rate` = uppspelningshastighet i klienten (pitch bevaras) — 1.4 = 40 % snabbare. */
  speak: {
    enabled: true,
    rate: 1.4,
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
 * Rollen är en lins: samma trestegsmotor, rollen färgar framing. Två LIKVÄRDIGA kort.
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
 * Scenario — flykt undan krig i tre steg: packa → ta sig fram → slå läger.
 * Per-uppgifts-läges-flöde (§3): bild+undertext → pop-up "DET HÄR ÄR LÄGET" →
 * nedräkning 10 → tänk-högt. All copy ligger som DATA (i18n), keyad på step.key.
 * ------------------------------------------------------------------ */

export interface StepDef {
  /** i18n-nyckelrot, t.ex. 'flykt.steg1' → '<rot>.undertext', '.popup1..3',
   *  '.fraga'. */
  key: string
  /** Stegets referensbild (media-id) — fyller beat 1 och ligger kvar centrerad
   *  genom tänk-högt (beat 4) och analys-rutan (latensmask). */
  referenceMedia: string
}

export interface ScenarioDef {
  id: ScenarioId
  /** Exakt tre steg. */
  steps: StepDef[]
}

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  flykt: {
    id: 'flykt',
    steps: [
      { key: 'flykt.steg1', referenceMedia: 'flykt_1_packa' },
      { key: 'flykt.steg2', referenceMedia: 'flykt_2_vagar' },
      { key: 'flykt.steg3', referenceMedia: 'flykt_3_skog' },
    ],
  },
}

/** Aktivt scenario-objekt (bekvämt uppslag). */
export function activeScenario(): ScenarioDef {
  return SCENARIOS[config.scenario]
}

/* ------------------------------------------------------------------ *
 * Stigande slutskala 1–10 — namngivna markeringar, låg→hög. `key` slås upp i
 * i18n. Gatewayns final-compose härleder `markering` ur samma intervall.
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

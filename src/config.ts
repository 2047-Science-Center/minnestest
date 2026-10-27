/**
 * Central config för MÄNNISKOTESTET (X&Y-riggen, station 2).
 *
 * Valvets innersta släpper bara in MÄNNISKOR — ett test som inte går att hacka.
 * Tre deltagare tar sig genom FEM gatade valvrum i serie. Per rum: ett scenario
 * utan facit → de tre resonerar EN I TAGET → Valdi väger ihop → porten ÖPPNAS
 * eller ACCESS DENIED. En förtroendemätare (dold 0–10 per svar → 0–100 för
 * gruppen) driver utslaget.
 *
 * Delar UPPBYGGNAD med lögndetektorn men är en EGEN app. Inga hemligheter här
 * (nycklar i gatewayns .env). Fronten pratar aldrig direkt med OpenAI/ElevenLabs.
 */

export type Mode = 'pilot' | 'production'
/** Rummens färgidentitet (så man kan säga "det gula rummet"). */
export type RoomColor = 'bla' | 'gul' | 'gron' | 'rod' | 'guld'

/** Människotestet = station 2 i X&Y-kedjan. */
export const STATION_N = 2

export const config = {
  mode: 'pilot' as Mode,
  stationN: STATION_N,
  lang: 'sv' as 'sv' | 'no' | 'svorsk',

  /** Antal deltagare som turas om (en i taget) per rum. */
  participants: 3,

  /** Taltid per deltagare (sekunder) + när 10-sek-varningen tänds. */
  talkSeconds: 25,
  warnAtSeconds: 7,

  /** Nedräkning innan första deltagaren i ett rum (och mellan deltagare). */
  countdownFrom: 5,
  handoffSeconds: 5,

  /** Incheckningens auto-vidare (ms). */
  checkinAutoMs: 2000,

  /** /assess-gatewayen. Kiosk-bygget sätter VITE_ASSESS_URL='' → samma origin. */
  assess: {
    baseUrl: (import.meta.env.VITE_ASSESS_URL ?? 'http://localhost:8787') as string,
  },

  /** Valdi-röst (/speak, ElevenLabs): läser upp det vägande utlåtandet i
   *  revealen — den är rolig och lyfter stämningen i gruppen. */
  speak: {
    enabled: true,
    rate: 1.0,
  },

  /** Drift-adresser. */
  production: {
    wsUrl: '',
    mqttUrl: 'ws://127.0.0.1:9001',
  },
} as const

/** Bygger en url till en fil i public/ som funkar oavsett bas-sökväg. */
export function asset(path: string): string {
  return encodeURI(import.meta.env.BASE_URL + path.replace(/^\/+/, ''))
}

/* ------------------------------------------------------------------ *
 * Valvrummen — 5 gatade rum i serie, var sitt scenario (v5) + färg.
 * Kurva: lätt/konkret → läs det sociala → väg lojalitet → läs det osagda →
 * vänd ditt eget omdöme. All copy i i18n under scenario.<id>.*; ljud/bild via
 * sceneBase (public/video/<base>.mp4|.jpg, public/Sound/ambience/<base>.mp3).
 * ------------------------------------------------------------------ */

export interface Room {
  /** i18n-rot: scenario.<id>.context/.story/.question/.rubrik. */
  id: string
  /** Scen-asset-bas (video + poster + ljudbild). */
  sceneBase: string
  /** Rummets färgidentitet (driver accent + namn). */
  color: RoomColor
  /** Gateway-config för per-deltagar-bedömningen. */
  configId: string
}

export const ROOMS: Room[] = [
  { id: 'badplats', sceneBase: 'mt_1_badplats', color: 'bla', configId: 'manniskotest' },
  { id: 'pizza', sceneBase: 'mt_3_pizza', color: 'gul', configId: 'manniskotest' },
  { id: 'hangel', sceneBase: 'mt_2_fest', color: 'gron', configId: 'manniskotest' },
  { id: 'syskon', sceneBase: 'mt_4_smasyskon', color: 'rod', configId: 'manniskotest' },
  { id: 'tystminut', sceneBase: 'mt_5_aula', color: 'guld', configId: 'manniskotest' },
]

/** ÖVNINGSRUMMET — en full genomspelning (scenario → tre talar → port-reveal)
 *  på ett laddningsfritt vardagsdilemma, så de fattar hela maskineriet. Räknas
 *  ALDRIG; porten öppnas alltid. */
export const TUTORIAL_ROOM: Room = {
  id: 'ovning',
  sceneBase: '',
  color: 'bla',
  configId: 'manniskotest',
}

/** Config för sammanvägningen (Valdis gemensamma utlåtande per rum). */
export const VERDICT_CONFIG = 'manniskotest-verdict'

/* ------------------------------------------------------------------ *
 * Rum-färger — hex + rgb för glöd. Driver --color-primary/--mode-accent-rgb
 * i det aktiva rummet (överstyr bärnstens-grundtemat).
 * ------------------------------------------------------------------ */
export interface ColorDef {
  hex: string
  rgb: string
  dim: string
}
/** UI-chrome-färg per läge (speglar crt.css): ÖVNING = mintblå, SKARPT = bärnsten.
 *  Rummens egen färg bärs av dörr-arten — INTE av UI-texten. */
export const MODE_COLORS = {
  test: { hex: '#35e0d0', rgb: '53, 224, 208' },
  live: { hex: '#ff9500', rgb: '255, 149, 0' },
} as const

export const ROOM_COLORS: Record<RoomColor, ColorDef> = {
  bla: { hex: '#4aa3ff', rgb: '74, 163, 255', dim: '#2b6fb8' },
  gul: { hex: '#ffe24a', rgb: '255, 226, 74', dim: '#b8a01f' },
  gron: { hex: '#7ad14f', rgb: '122, 209, 79', dim: '#4f9630' },
  rod: { hex: '#ff5a3c', rgb: '255, 90, 60', dim: '#b83a26' },
  guld: { hex: '#f0b429', rgb: '240, 180, 41', dim: '#a87a16' },
}

/* ------------------------------------------------------------------ *
 * Dörr-/rums-art per färg. Varje rum har en STÄNGD-stillbild (visas stängd +
 * under "VALDI ÖVERVÄGER") och en ÖPPNINGS-video (stängd port → ljus strömmar
 * ut; spelas när porten öppnas). Rumsnumret är inbakat i arten. `video`
 * utelämnad → stillbild + CSS-öppning som fallback tills videon finns.
 * Övningen (ingen färg-art) → CSS-porten.
 * ------------------------------------------------------------------ */
export interface DoorArt {
  /** Stängd-dörr-stillbild (sökväg relativt public/, via asset()). */
  still: string
  /** Öppnings-video (sökväg relativt public/). Saknas → CSS-öppning. */
  video?: string
}
export const DOOR_ART: Record<RoomColor, DoorArt> = {
  bla: { still: 'media/valv_bla.png', video: 'video/valv_bla.mp4' },
  gul: { still: 'media/valv_gul.png', video: 'video/valv_gul.mp4' },
  gron: { still: 'media/valv_gron.png', video: 'video/valv_gron.mp4' },
  rod: { still: 'media/valv_rod.png', video: 'video/valv_rod.mp4' },
  guld: { still: 'media/valv_guld.png', video: 'video/valv_guld.mp4' },
}

/* ------------------------------------------------------------------ *
 * Förtroendemätaren — dold 0–10 per svar → 0–100 för gruppen. Tre zoner.
 * Nålrörelse per rum = (medel − par) × k, clampat 0–100. Stigande par → svårare
 * att hålla ställningen på senare rum. Förlust ≤ loseAt → ACCESS DENIED (slut).
 * ------------------------------------------------------------------ */
export const METER = {
  start: 50,
  loseAt: 30,
  highAt: 65,
  /** Hur hårt snittet slår på nålen. */
  k: 5,
  /** "Godkänt" per deltagare (✓) ur egen dold poäng. */
  passMark: 5.5,
  /** Stigande par per rum (0-indexerat). Högre par → tuffare rum. */
  parByRoom: [5.0, 5.2, 5.5, 5.8, 6.1] as readonly number[],
} as const

export function parForRoom(index: number): number {
  return METER.parByRoom[index] ?? METER.parByRoom[METER.parByRoom.length - 1]
}

export const PILOT_GROUP = {
  id: '07',
  members: ['Deltagare 1', 'Deltagare 2', 'Deltagare 3'],
} as const

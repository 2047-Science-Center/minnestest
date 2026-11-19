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

import { bandlostFran } from '@/station-kit/band/band'
import type { RollvalConfig } from './station-kit/rollval/types'
import type { EntreConfig, SideId } from './station-kit/entre/types'

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
    /** Tom → VITE_MQTT_URL (riggen: ws://192.168.10.10:9001) → dev-default ws://127.0.0.1:9001. */
    mqttUrl: '',
  },
} as const

/**
 * ROTATION (xy-arkitektur/XY-ROTATION.md, SOM.md 2026-11-17): regi skickar
 * station<N>/group → "Testgrupp X — tryck för att börja" → tutorial → skarp →
 * done → lek. Av i piloten (demo/Pages oförändrade); på i drift. Överstyrs
 * med ?rotation=1|0 / ?mqtt=ws://… i kiosk-URL:en eller VITE_ROTATION /
 * VITE_MQTT_URL vid bygget. Ingen IP i koden.
 */
export const ROTATION = {
  stationN: STATION_N,
  enabled: config.mode === 'production',
  mqttUrl: config.production.mqttUrl || 'ws://127.0.0.1:9001', // dev-default; env/URL går före
}

/**
 * BANDLÖST LÄGE (station-kit/band, xy-arkitektur/XY-BANDLOST-OCH-ANKOMST.md, SOM.md "bandlöst läge (v49)"):
 * på = allt banden gör görs på skärmen (rollvalet: en person i taget). Av = RFID-läsarna
 * (station<N>/rfidnej = roll A, rfidja = roll B). Default PÅ inför v49 (läsarna är inte klara).
 * Överstyrs med ?bandlost=1|0 i kiosk-URL:en eller VITE_BANDLOST=1|0 vid bygget.
 * ?rost=rfid|skarm (en enskild skärm) och facilitatormenyn går fortfarande före.
 */
export const BANDLOST: boolean = bandlostFran(true, import.meta.env.VITE_BANDLOST as string | undefined)

/**
 * LJUS (station-kit/ljus, XY-FEEDBACK-LJUS-LJUD §1.2/§5.2, SOM.md "Stationsljus"):
 * station2/underglow (bas, retained) + station2/feedback (gester). DELAD station: varje
 * sidas NUC skriver bara SINA segment — A = Människotestet (3 lurar), B = Lögndetektorn
 * (mik + kö) + `valdi` (VALdi-ringen på B-sidan). Pixelintervallen är BÄNK-värden
 * (Josefs 60 px-slinga: A = första halvan, B = andra halvan); riktiga intervall = Eriks
 * mätning. `valdi` ligger bortom 60 px och klipps på bänken. Av i piloten (följer
 * config.mode); ?ljus=1|0|visa / VITE_LJUS överstyr.
 */
export const LJUS = {
  valv: 'teknolog' as const,
  segment: {
    A: [0, 29],
    B: [30, 59],
    valdi: [60, 75],
  } as Record<string, [number, number]>,
}

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
  /** Rummets färgidentitet (människotest = valvdörr-art). Utelämnas för lögndetektorn. */
  color?: RoomColor
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

/** Config för sammanvägningen (människotestets utlåtande per rum). */
export const VERDICT_CONFIG = 'manniskotest-verdict'

/* ------------------------------------------------------------------ *
 * LÖGNDETEKTORN — 5 lögn-seeds + läxa-övning. Transkript-only, "ljug
 * trovärdigt". Reveal = Valdi-hålet (ingen valvdörr/färg). Scener = ld_*.
 * ------------------------------------------------------------------ */
export const LD_ROOMS: Room[] = [
  { id: 'pixel', sceneBase: 'ld_1_pixel', configId: 'logndetektor' },
  { id: 'youtuber', sceneBase: 'ld_2_youtuber', configId: 'logndetektor' },
  { id: 'london', sceneBase: 'ld_3_london', configId: 'logndetektor' },
  { id: 'jonglera', sceneBase: 'ld_4_jonglera', configId: 'logndetektor' },
  { id: 'utflykt', sceneBase: 'ld_5_utflykt', configId: 'logndetektor' },
]
export const LD_TUTORIAL: Room = { id: 'laxa', sceneBase: 'ld_laxa', configId: 'logndetektor' }

/* ------------------------------------------------------------------ *
 * SPELEN — valbart läge i samma app. Delad motor (3 deltagare, mätare, röst);
 * skiljer sig i scenarier, regelverk, taltid och reveal-typ.
 * ------------------------------------------------------------------ */
export type Game = 'manniskotest' | 'logndetektor'

export interface GameDef {
  rooms: Room[]
  tutorial: Room
  /** Gateway-config för det sammanvägda utlåtandet. */
  verdictConfig: string
  /** Taltid per deltagare (sekunder). */
  talkSeconds: number
  /** Reveal-visual: valvdörr (människotest) eller Valdi-hålet (lögndetektor). */
  reveal: 'door' | 'hole'
}

export const GAMES: Record<Game, GameDef> = {
  manniskotest: {
    rooms: ROOMS,
    tutorial: TUTORIAL_ROOM,
    verdictConfig: 'manniskotest-verdict',
    talkSeconds: 25,
    reveal: 'door',
  },
  logndetektor: {
    rooms: LD_ROOMS,
    tutorial: LD_TUTORIAL,
    verdictConfig: 'logndetektor-verdict',
    talkSeconds: 20,
    reveal: 'hole',
  },
}

/** Lås appen till ETT spel på en viss NUC (hoppar över väljaren). null = väljare. */
export const PINNED_GAME: Game | null = (import.meta.env.VITE_GAME as Game) || null

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

/* ------------------------------------------------------------------ *
 * ROLLVAL — nytt touchskärms-flöde FÖRE stationens eget flöde (Lager A).
 * Besökaren ser ett "en dag i livet"-klipp per roll och väljer roll på
 * skärmen. Skippbart via ROLLVAL_ENABLED. Inramning: förmågor värda att
 * vara bra på — IMPLICIT, copyn nämner aldrig "framtidsyrke" eller AI.
 *
 * Rollerna speglar appens två sidor: Äkthetsgranskare = människotestet
 * ("är det en äkta människa?"), Sanningsanalytiker = lögndetektorn
 * ("är det sant?").
 *
 * INGA riktiga klipp finns än → tydligt märkta PLACEHOLDER-klipp i
 * minnestest/Assets/ (prefix roll_). Strukturerat som TVÅ klippset så det är
 * redo när de riktiga klippen kommer: byt filerna (behåll namnen) eller
 * uppdatera filnamnen nedan.
 * ------------------------------------------------------------------ */

/** Sätt false för att hoppa över hela rollvalet (appen kör utan det). */
export const ROLLVAL_ENABLED = true

/** Aktivt klippset. Testet kör ETT fast set (set 1 = placeholders); det andra
 *  setet finns kvar i config. 'alternate' = växla per körning. */
export const ROLLVAL_START_SET: number | 'alternate' = 0

/** Placeholder-rollklipp i minnestest/Assets/ (prefix roll_, url via Vite). */
const ROLLVAL_CLIPS = import.meta.glob('../Assets/roll_*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function rollvalClip(file: string): string {
  // Vite-globens nycklar är NFD (macOS dekomponerar å/ä/ö); våra literaler är
  // NFC. Normalisera båda till NFC före jämförelsen.
  const target = ('/' + file).normalize('NFC')
  const hit = Object.entries(ROLLVAL_CLIPS).find(([k]) => k.normalize('NFC').endsWith(target))
  return hit?.[1] ?? ''
}

/** Vilket spel som körs på vilken sida (ROLE_TO_GAME i appen måste stämma med ENTRE.roles). */
export const SIDE_GAME: Record<SideId, Game> = { A: 'manniskotest', B: 'logndetektor' }

/**
 * STATIONENS NAMN PER SIDA (Josef 2026-11-19: Människotestet och Lögndetektorn är två stationer på två NUC:ar).
 * Följer thisSide(): sida B = "Lögndetektorn", sida A och den delade vyn = "Människotestet". Används överallt där
 * stationens namn visas (ENTRE/ROLLVAL.stationTitle → ankomstvyns mitt, incheckningen, rotationens skärmar).
 */
export const STATION_TITLE: string = thisSide() === 'B' ? 'Lögndetektorn' : 'Människotestet'

/**
 * ATTRACT-BILD PER SIDA (förberedd, Josef har inte valt bilder än → null = ingen bild, som i dag).
 * Lägg bilden i public/attract/ och sätt sökvägen, t.ex. A: 'attract/manniskotestet.jpg'.
 * attractBild() ger den här NUC:ens bild (thisSide(); delad vy = A). Inte inkopplad i någon vy än.
 */
export const ATTRACT_BILD: Record<SideId, string | null> = { A: null, B: null }
export function attractBild(): string | null {
  const p = ATTRACT_BILD[thisSide() ?? 'A']
  return p ? asset(p) : null
}

export const ROLLVAL: RollvalConfig = {
  stationTitle: STATION_TITLE,
  intro: 'Två sätt att se igenom det som inte stämmer. Titta på hur en dag ser ut — välj sedan vilken du vill kliva in i.',
  question: 'Vilken av dem känns som du?',
  roles: [
    {
      id: 'akthetsgranskare',
      name: 'Äkthetsgranskare',
      tagline: 'Den som känner igen det äkta.',
      description: 'Mitt i allt som härmar och kopierar är förmågan att känna igen det genuina — en riktig människa, en äkta reaktion — ovärderlig. Litar inte blint, prövar.',
    },
    {
      id: 'sanningsanalytiker',
      name: 'Sanningsanalytiker',
      tagline: 'Den som ser skillnad på sant och påhittat.',
      description: 'Lyssnar, väger och genomskådar. Att kunna avgöra om något faktiskt stämmer är en av de svåraste och viktigaste förmågor man kan bli bra på.',
    },
  ],
  clipSets: [
    { akthetsgranskare: rollvalClip('roll_akthetsgranskare_set1.mp4'), sanningsanalytiker: rollvalClip('roll_sanningsanalytiker_set1.mp4') },
    { akthetsgranskare: rollvalClip('roll_akthetsgranskare_set2.mp4'), sanningsanalytiker: rollvalClip('roll_sanningsanalytiker_set2.mp4') },
  ],
}

/* ------------------------------------------------------------------ *
 * ENTRÉN (station-kit/entre, gemensam för st1–3): attract med testgrupp +
 * sidindelning → rollval-klippen → valet (person för person / RFID) →
 * ombalansering → "gå till sida A/B". SIDA = ROLL, fast här. TVÅ NUC:ar, en per sida:
 *   sida A = Människotestet (rollvalets Äkthetsgranskare)
 *   sida B = Lögndetektorn  (rollvalets Sanningsanalytiker)
 * NUC:ens sida: ?sida=A|B i kiosk-URL:en, annars ur VITE_GAME (PINNED_GAME) via
 * SIDE_GAME, annars delad vy (en skärm för hela gruppen, pilot → sida A:s spel).
 * Sida A-NUC:en leder (lottar). De två NUC:arna synkar entrén över appens transport
 * (?net=<relä> — utan relä når rösterna inte den andra NUC:en).
 * Röstläge: styrs av BANDLOST (ovan); voteMode gäller bara om BANDLOST inte skickas in. ?rost=rfid|skarm går före.
 * ------------------------------------------------------------------ */

export const ENTRE: EntreConfig = {
  stationTitle: STATION_TITLE,
  // XY-PLATSER (2026-11-18): A = Människotestet, 3 telefonlurar = max 3; överskottet till
  // lögndetektorn (en mikrofon, turordning: 1 vid mikrofonen, resten i kö).
  roles: [
    { letter: 'A', rollvalRoleId: 'akthetsgranskare', name: 'Äkthetsgranskare', titel: 'Människotestet', max: 3, plats: 'A.lur' },
    {
      letter: 'B',
      rollvalRoleId: 'sanningsanalytiker',
      name: 'Sanningsanalytiker',
      subRoles: [
        { id: 'mikrofon', name: 'Vid mikrofonen', count: 1, plats: 'B.mikrofon' },
        { id: 'ko', name: 'I kö', plats: 'B.ko' },
      ],
    },
  ],
  station3d: 'minne',
  sides: {
    A: { id: 'A', label: 'Människotestet' },
    B: { id: 'B', label: 'Lögndetektorn' },
  },
  voteMode: 'skarm',
  /** 3D-översikten från three.js-tråden (xy-entre-3d → public/entre/). Saknas → 2D-vyn. */
  illustrationUrl: `${import.meta.env.BASE_URL}entre/sidor-3d.html`,
  /** Stationsintrot (hype-klipp ~5–6 s) efter "Ställ er på rätt sida". Saknas filen → hoppas över.
   *  Två stationer på två NUC:ar (Josef 2026-11-19): eget klipp per sida (thisSide()).
   *  Sida B = logndetektorn.mp4. Sida A och den delade vyn = manniskotestet.mp4. */
  introClip: `${import.meta.env.BASE_URL}media/stationsintro/${thisSide() === 'B' ? 'logndetektorn' : 'manniskotestet'}.mp4`,
  /** Rollsekvensen efter introt (inga klick): brygga → kort A → klipp A → brygga → kort B → klipp B → valet.
   *  Rollnamn/valvfärg enligt station-kit/stationsintro/README.md (Josef 2026-11-19). */
  rollkort: { A: 'ÄKTHETSGRANSKARE', B: 'SANNINGSANALYTIKER', valvfarg: '#ff5a3c', sprak: config.lang === 'no' ? 'no' : 'sv' },
  clips: ROLLVAL_ENABLED,
  clipSet: ROLLVAL_START_SET,
  clipSetCount: ROLLVAL.clipSets.length,
  /** DB:ns set_id per klippset-index (SOM.md "Klippset per grupp"): platshållarklipp roll_*_set1/set2 — kontrollera mot presentation_sets (st2: set 1 = kvinnlig B, set 2 = kvinnlig A) när de riktiga klippen finns. */
  clipSetIds: [1, 2],
  pilotRoster: [
    { band_id: 'PILOT01', name: 'Liam', gender: 'man' },
    { band_id: 'PILOT02', name: 'Jonna', gender: 'kvinna' },
    { band_id: 'PILOT03', name: 'Andreas', gender: 'man' },
    { band_id: 'PILOT04', name: 'Maja', gender: 'kvinna' },
    { band_id: 'PILOT05', name: 'Omar', gender: 'man' },
    { band_id: 'PILOT06', name: 'Saga', gender: 'kvinna' },
  ],
}

/** Den här NUC:ens sida (null = delad vy). */
export function thisSide(): SideId | null {
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search).get('sida')?.toUpperCase()
    if (p === 'A' || p === 'B') return p
  }
  if (PINNED_GAME) return SIDE_GAME.A === PINNED_GAME ? 'A' : 'B'
  return null
}

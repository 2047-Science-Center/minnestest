/**
 * Pinia-store för MÄNNISKOTESTET. Orkestrerar tillståndsmaskinen och adaptrarna.
 *
 * Tre deltagare tar sig genom FEM gatade valvrum. Per rum resonerar de EN I
 * TAGET om ett scenario utan facit; varje svar bedöms (dold 0–10 = hur mänskligt
 * resonemanget var). Valdi väger ihop de tre → ett utlåtande + nål-rörelse på
 * FÖRTROENDEMÄTAREN (0–100). Över förlusttröskeln → porten ÖPPNAS (nästa rum);
 * ≤ loseAt → ACCESS DENIED (slut).
 *
 * Faser: attract → branchIntro → intro → room(ÖVNING, full genomspelning)
 *        → goLive → room ×5 (gatade) → result → checkout
 */
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

import { createAdapters, type Adapters } from '@/station-kit/adapters'
import type { IdentityGroup } from '@/station-kit/adapters/identity/Identity'
import type { PriorStep } from '@/station-kit/adapters/assess/Assess'
import type { ResultPayload, ResultPerson } from '@/station-kit/adapters/result/ResultSink'

import {
  config,
  GAMES,
  PINNED_GAME,
  ROOM_COLORS,
  METER,
  parForRoom,
  PILOT_GROUP,
  type Game,
  type Room,
  type ColorDef,
} from '@/config'
import { t } from '@/station-kit/i18n'

export type Phase =
  | 'attract'
  | 'gameSelect'
  | 'branchIntro'
  | 'intro'
  | 'goLive'
  | 'room'
  | 'result'
  | 'checkout'

/** Zon på förtroendemätaren. */
export type Zone = 'lose' | 'tveksam' | 'hog'

/** En deltagares svar i ett rum. */
export interface ParticipantAnswer {
  transcript: string
  /** Dold 0–10: hur mänskligt resonemanget var (visas aldrig som siffra). */
  poang: number
  kommentar: string
  saknades: string
}

/** Valdis sammanvägning för ett rum. */
export interface RoomVerdict {
  utlatande: string
  /** Snittet av de tre dolda poängen. */
  poangMean: number
  /** Per-deltagare ✓/✗ (ur egen dold poäng ≥ passMark). */
  perChecks: boolean[]
  confBefore: number
  confAfter: number
  /** Porten öppnas? (övning: alltid; skarpt: confAfter > loseAt). */
  granted: boolean
}

/** Slutresultat. */
export interface GameOutcome {
  roomsCleared: number
  maxRooms: number
  granted: boolean
  zone: Zone
  lastUtlatande: string
}

function filled<T>(n: number, v: T): T[] {
  return Array.from({ length: n }, () => v)
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

export function zoneFor(conf: number): Zone {
  if (conf <= METER.loseAt) return 'lose'
  if (conf >= METER.highAt) return 'hog'
  return 'tveksam'
}

export const useMinnestestStore = defineStore('minnestest', () => {
  const phase = ref<Phase>('attract')
  const group = ref<{ id: string; members: string[] }>({
    id: PILOT_GROUP.id,
    members: [...PILOT_GROUP.members],
  })

  /** Valt spel (låst via PINNED_GAME på en NUC, annars via väljaren). */
  const game = ref<Game>(PINNED_GAME ?? 'manniskotest')
  const gameDef = computed(() => GAMES[game.value])

  const roomIndex = ref(0)
  const isTutorial = ref(false)
  const activeParticipant = ref(0)

  /** Förtroendemätaren — 0–100, gruppens gemensamma nål. */
  const confidence = ref<number>(METER.start)

  const answers = ref<(ParticipantAnswer | null)[]>(filled(config.participants, null))
  const verdict = ref<RoomVerdict | null>(null)
  const outcome = ref<GameOutcome | null>(null)

  const assessing = ref(false)
  const speaking = ref(false)
  const paused = ref(false)

  const adapters = shallowRef<Adapters | null>(null)

  // --- Härledda ---
  const room = computed<Room>(() =>
    isTutorial.value ? gameDef.value.tutorial : gameDef.value.rooms[roomIndex.value],
  )
  const roomColor = computed<ColorDef>(() => ROOM_COLORS[room.value.color ?? 'bla'])
  const roomNr = computed(() => roomIndex.value + 1)
  const roomMax = computed(() => gameDef.value.rooms.length)
  const isLastRoom = computed(() => roomIndex.value >= gameDef.value.rooms.length - 1)
  const talkSeconds = computed(() => gameDef.value.talkSeconds)
  const reveal = computed(() => gameDef.value.reveal)
  const participants = computed(() => {
    const names = group.value.members
    return Array.from({ length: config.participants }, (_, i) => names[i] ?? t('p.generic', { n: i + 1 }))
  })
  const zone = computed<Zone>(() => zoneFor(confidence.value))

  function init(): void {
    if (!adapters.value) adapters.value = createAdapters()
  }

  // --- Övergångar ---
  function begin(): void {
    // Låst spel på denna NUC → hoppa över väljaren.
    phase.value = PINNED_GAME ? 'branchIntro' : 'gameSelect'
  }

  function chooseGame(g: Game): void {
    game.value = g
    confidence.value = METER.start
    phase.value = 'branchIntro'
  }

  function applyIdentity(idn: IdentityGroup): void {
    if (idn.medlemmar.length) {
      group.value = { id: idn.grupp, members: idn.medlemmar.map((m) => m.name ?? m.band_id) }
    }
  }

  function listenIdentity(cb: (idn: IdentityGroup) => void): () => void {
    return adapters.value?.identity.listen(cb) ?? (() => {})
  }

  /** Gren-intro (STARTA) → story-intro. */
  function startBranch(): void {
    phase.value = 'intro'
  }

  /** Story-intro klar → ÖVNINGEN (full genomspelning, räknas inte). */
  function introDone(): void {
    isTutorial.value = true
    resetRoom()
    phase.value = 'room'
  }

  /** Övningen klar → tydlig "nu gäller det"-nedräkning → skarpa rummen. */
  function startLive(): void {
    isTutorial.value = false
    roomIndex.value = 0
    confidence.value = METER.start
    resetRoom()
    phase.value = 'goLive'
  }

  function goLiveDone(): void {
    phase.value = 'room'
  }

  function resetRoom(): void {
    activeParticipant.value = 0
    answers.value = filled(config.participants, null)
    verdict.value = null
  }

  // --- Scenario-copy (till /assess) ---
  function scenarioFraga(): string {
    const id = room.value.id
    return `${t(`scenario.${id}.story`)} ${t(`scenario.${id}.question`)}`.trim()
  }
  function scenarioRubrik(): string {
    return t(`scenario.${room.value.id}.rubrik`)
  }

  function priorParticipants(upTo: number): PriorStep[] {
    const out: PriorStep[] = []
    for (let i = 0; i < upTo; i++) {
      const a = answers.value[i]
      if (!a) continue
      out.push({ step: i + 1, poang: a.poang, kommentar: a.kommentar, transcript: a.transcript })
    }
    return out
  }

  /** Bedöm EN deltagares svar (pipelinat — anropas direkt när hen är klar). */
  async function assessParticipant(index: number, transcript: string): Promise<void> {
    assessing.value = true
    try {
      const a = await adapters.value!.assess.assessStep(
        room.value.configId,
        {
          step: roomNr.value,
          role: 'sakerhetsansvarig',
          example: room.value.id,
          transcript,
          fraga: scenarioFraga(),
          rubrik: scenarioRubrik(),
          threshold: METER.passMark,
          prior: priorParticipants(index),
        },
        { lang: config.lang },
      )
      answers.value[index] = {
        transcript,
        poang: clamp(a.poang ?? 0, 0, 10),
        kommentar: a.kommentar ?? '',
        saknades: a.saknades ?? '',
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[manniskotest] assessParticipant misslyckades — fallback', err)
      const words = transcript.trim().split(/\s+/).filter(Boolean).length
      answers.value[index] = {
        transcript,
        poang: clamp(Math.round(words / 8) + 3, 0, 10),
        kommentar: t('npc.error'),
        saknades: '',
      }
    } finally {
      assessing.value = false
    }
  }

  /** Väg ihop de tre → Valdis utlåtande + nål-rörelse. Avgör porten. */
  async function computeVerdict(): Promise<void> {
    const got = answers.value.map((a, i) => ({ a, i })).filter((x) => x.a) as {
      a: ParticipantAnswer
      i: number
    }[]
    const poangMean =
      got.length > 0 ? got.reduce((s, x) => s + x.a.poang, 0) / got.length : 0
    const perChecks = answers.value.map((a) => (a ? a.poang >= METER.passMark : false))

    // Nål-rörelse: (medel − par) × k, clampat.
    const par = parForRoom(roomIndex.value)
    const confBefore = confidence.value
    const confAfter = clamp(confBefore + (poangMean - par) * METER.k, 0, 100)

    // Valdis sammanvägda utlåtande (eget litet GPT-anrop).
    let utlatande = ''
    try {
      const combined = got
        .map((x) => `Deltagare ${x.i + 1}: ${x.a.transcript}`)
        .join('\n')
      const v = await adapters.value!.assess.assessStep(
        gameDef.value.verdictConfig,
        {
          step: roomNr.value,
          role: 'sakerhetsansvarig',
          example: room.value.id,
          transcript: combined,
          fraga: scenarioFraga(),
          rubrik: t('verdict.rubrik'),
          prior: [],
        },
        { lang: config.lang },
      )
      utlatande = v.kommentar ?? ''
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[manniskotest] computeVerdict misslyckades — fallback', err)
      utlatande = t('verdict.fallback')
    }

    const granted = isTutorial.value ? true : confAfter > METER.loseAt
    confidence.value = confAfter
    verdict.value = { utlatande, poangMean, perChecks, confBefore, confAfter, granted }
  }

  async function speakNpc(text: string): Promise<void> {
    const sp = adapters.value?.speak
    if (!sp || !sp.enabled || !config.speak.enabled || !text) return
    speaking.value = true
    try {
      await sp.speak(text)
    } finally {
      speaking.value = false
    }
  }

  /** Avbryt pågående uppläsning (t.ex. när man klickar vidare). */
  function stopSpeak(): void {
    adapters.value?.speak.cancel()
    speaking.value = false
  }

  /** RoomCycle har visat port-utslaget → gå vidare. */
  function proceedRoom(): void {
    adapters.value?.speak.cancel()
    speaking.value = false

    if (isTutorial.value) {
      startLive()
      return
    }
    const v = verdict.value
    if (v && v.granted) {
      if (isLastRoom.value) {
        finish(true)
      } else {
        roomIndex.value += 1
        resetRoom()
        phase.value = 'room' // RoomCycle remountas via :key=roomIndex
      }
    } else {
      finish(false)
    }
  }

  function finish(granted: boolean): void {
    outcome.value = {
      roomsCleared: granted ? gameDef.value.rooms.length : roomIndex.value,
      maxRooms: gameDef.value.rooms.length,
      granted,
      zone: zone.value,
      lastUtlatande: verdict.value?.utlatande ?? '',
    }
    phase.value = 'result'
    sendResult()
  }

  function resultDone(): void {
    phase.value = 'checkout'
  }

  // --- Facilitator ---
  function togglePause(): void {
    paused.value = !paused.value
  }
  function quitStation(): void {
    try {
      window.close()
    } catch {
      /* i vanlig flik gör webbläsaren inget */
    }
  }
  function reset(): void {
    paused.value = false
    phase.value = 'attract'
    isTutorial.value = false
    roomIndex.value = 0
    confidence.value = METER.start
    resetRoom()
    outcome.value = null
    group.value = { id: PILOT_GROUP.id, members: [...PILOT_GROUP.members] }
  }

  // --- Resultat-söm (AVSTÄNGD i pilot = MockResultSink) ---
  function sendResult(): void {
    const value = outcome.value?.roomsCleared ?? 0
    const personer: ResultPerson[] = group.value.members.map((name, i) => ({
      band_id: `${group.value.id}-${i + 1}-${name}`,
      chosen_role: 'A',
      assigned_role: 'A',
      role_presented_as: null,
      result_value: value,
    }))
    const payload: ResultPayload = {
      grupp: group.value.id,
      rollresultat_A: personer.reduce((s, p) => s + p.result_value, 0),
      rollresultat_B: 0,
      personer,
    }
    adapters.value?.result.send(payload)
  }

  return {
    phase,
    game,
    reveal,
    talkSeconds,
    group,
    roomIndex,
    isTutorial,
    activeParticipant,
    confidence,
    answers,
    verdict,
    outcome,
    assessing,
    speaking,
    paused,
    room,
    roomColor,
    roomNr,
    roomMax,
    isLastRoom,
    participants,
    zone,
    init,
    begin,
    chooseGame,
    applyIdentity,
    listenIdentity,
    startBranch,
    introDone,
    startLive,
    goLiveDone,
    assessParticipant,
    computeVerdict,
    speakNpc,
    stopSpeak,
    proceedRoom,
    resultDone,
    togglePause,
    quitStation,
    reset,
  }
})

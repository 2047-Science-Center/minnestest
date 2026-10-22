/**
 * Pinia-store: orkestrering mellan tillståndsmaskinen och adaptrarna. Rollvalet
 * FORKar till ett exempel (metodspecialist→fermi-stege, doktorand→flykt-stege);
 * motorn är gemensam. Stationen är en GATAD STEGE: 5 nivåer, allt hårdare krav,
 * man når så långt resonemanget bär. Modellen poängsätter resonemanget 0–10 mot
 * nivåns rubrik; KODEN gatar mot en stigande tröskel. Mjukt stopp vid underkänt.
 *
 * Faser: attract → checkin → roleSelect → pilotIntro → step (×N, gatad)
 *        → goLive → step (×N) → verdict → checkout
 */
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

import { createAdapters, type Adapters } from '@/station-kit/adapters'
import type { IdentityGroup } from '@/station-kit/adapters/identity/Identity'
import type { PriorStep, StepAssessment } from '@/station-kit/adapters/assess/Assess'
import type { ResultPayload, ResultPerson } from '@/station-kit/adapters/result/ResultSink'
import { audio } from '@/station-kit/audio/AudioEngine'

import {
  config,
  exampleForRole,
  practiceForRole,
  thresholdForLevel,
  ROLES,
  PILOT_GROUP,
  type RoleId,
} from '@/config'
import { t } from '@/station-kit/i18n'

export type Phase =
  | 'attract'
  | 'checkin'
  | 'roleSelect'
  | 'pilotIntro'
  | 'goLive'
  | 'step'
  | 'practiceReveal'
  | 'verdict'
  | 'checkout'

/** Övningsläge (test, blått) vs skarpt (live, bärnsten). */
export type StationMode = 'test' | 'live'

export interface StationGroup {
  id: string
  members: string[]
}

/** Slutresultat för den gatade stegen. */
export interface LevelOutcome {
  nivaReached: number
  maxNiva: number
  passedAll: boolean
  kommentar: string
  saknades: string
}

function filled<T>(n: number, v: T): T[] {
  return Array.from({ length: n }, () => v)
}

export const useMinnestestStore = defineStore('minnestest', () => {
  const phase = ref<Phase>('attract')
  const mode = ref<StationMode>('live')
  const group = ref<StationGroup>({ id: PILOT_GROUP.id, members: [...PILOT_GROUP.members] })
  const roleId = ref<RoleId | null>(null)
  const stepIndex = ref(0)

  const transcripts = ref<string[]>(filled(5, ''))
  const guesses = ref<(number | null)[]>(filled(5, null))
  const vals = ref<(string | null)[]>(filled(5, null))
  const assessments = ref<(StepAssessment | null)[]>(filled(5, null))
  const packlista = ref('')

  /** Antal klarade nivåer hittills (= poängen i slutet). */
  const levelsCleared = ref(0)
  const levelOutcome = ref<LevelOutcome | null>(null)

  const assessing = ref(false)
  const speaking = ref(false)
  /** Facilitator-paus — fryser tänk-högt-timern och lägger paus-overlay. */
  const paused = ref(false)

  const adapters = shallowRef<Adapters | null>(null)

  // --- Fork: exempel ur rollen (övning i testläge, skarpt i live) ---
  const example = computed(() =>
    mode.value === 'test'
      ? practiceForRole(roleId.value ?? 'doktorand')
      : exampleForRole(roleId.value ?? 'doktorand'),
  )
  const exampleType = computed(() => example.value.type)
  const steps = computed(() => example.value.steps)
  const currentStep = computed(() => steps.value[stepIndex.value])
  const memberCount = computed(() => group.value.members.length)

  // --- Gate (nivåns tröskel vs modellens poäng) ---
  const currentThreshold = computed(() => thresholdForLevel(stepIndex.value))
  const currentAssessment = computed(() => assessments.value[stepIndex.value])
  const lastPoang = computed(() => currentAssessment.value?.poang ?? 0)
  const lastPassed = computed(() => lastPoang.value >= currentThreshold.value)
  const isLastLevel = computed(() => stepIndex.value >= steps.value.length - 1)

  function init(): void {
    if (!adapters.value) adapters.value = createAdapters()
  }

  // --- Övergångar ---
  function begin(): void {
    phase.value = 'checkin'
  }

  function applyIdentity(idn: IdentityGroup): void {
    if (idn.medlemmar.length) {
      group.value = { id: idn.grupp, members: idn.medlemmar.map((m) => m.name ?? m.band_id) }
    }
  }

  function listenIdentity(cb: (idn: IdentityGroup) => void): () => void {
    return adapters.value?.identity.listen(cb) ?? (() => {})
  }

  function checkinDone(): void {
    phase.value = 'roleSelect'
  }

  function chooseRole(id: RoleId): void {
    roleId.value = id
    mode.value = 'test' // övning först → hela UI:t blått
    audio.play('confirm')
    phase.value = 'pilotIntro'
  }

  /** Pilot-intro klar → in i ÖVNINGEN (testläge, en generös nivå). */
  function pilotIntroDone(): void {
    resetRound()
    phase.value = 'step'
  }

  /** Övningen klar → tydlig "nu på riktigt"-nedräkning innan skarpa stegen. */
  function startLive(): void {
    mode.value = 'live'
    resetRound()
    phase.value = 'goLive'
  }

  function goLiveDone(): void {
    phase.value = 'step'
  }

  /** Nollställ steg-state inför en ny omgång (behåll roll/mode/grupp). */
  function resetRound(): void {
    const n = Math.max(5, steps.value.length)
    stepIndex.value = 0
    transcripts.value = filled(n, '')
    guesses.value = filled(n, null)
    vals.value = filled(n, null)
    assessments.value = filled(n, null)
    levelsCleared.value = 0
    levelOutcome.value = null
    packlista.value = ''
  }

  // --- Svar (fermi) ---
  function setGuess(value: number | null): void {
    guesses.value[stepIndex.value] = value
  }
  function setVal(value: string | null): void {
    vals.value[stepIndex.value] = value
  }

  // --- Nivå-cykel ---
  function priorSoFar(upTo: number): PriorStep[] {
    const out: PriorStep[] = []
    for (let i = 0; i < upTo; i++) {
      const a = assessments.value[i]
      if (!a) continue
      out.push({
        step: i + 1,
        poang: a.poang,
        kommentar: a.kommentar,
        guess: guesses.value[i],
        transcript: transcripts.value[i],
      })
    }
    return out
  }

  async function assessCurrentStep(transcript: string, answer?: string): Promise<StepAssessment> {
    const idx = stepIndex.value
    transcripts.value[idx] = transcript
    if (exampleType.value === 'flykt' && idx === 0) packlista.value = (answer ?? transcript).trim()
    assessing.value = true
    try {
      const a = await adapters.value!.assess.assessStep(
        example.value.configId,
        {
          step: idx + 1,
          role: roleId.value ?? 'metodspecialist',
          example: example.value.id,
          transcript,
          guess: exampleType.value === 'fermi' ? guesses.value[idx] : undefined,
          unit: currentStep.value.unit,
          val: vals.value[idx] ?? undefined,
          packlista: exampleType.value === 'flykt' && idx >= 1 ? packlista.value : undefined,
          fraga: t(`${currentStep.value.key}.task`),
          rubrik: currentStep.value.rubrik,
          threshold: currentThreshold.value,
          prior: priorSoFar(idx),
        },
        { lang: config.lang },
      )
      assessments.value[idx] = a
      return a
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[minnestest] assessStep misslyckades — fallback', err)
      // Fallback utan gateway: härled en rimlig poäng ur hur mycket som sades, så
      // loopen går att spela/testa i dev. Längre, mer genomtänkt svar → högre.
      const words = transcript.trim().split(/\s+/).filter(Boolean).length
      const poang = Math.max(1, Math.min(10, Math.round(words / 6) + 2))
      const fallback: StepAssessment = {
        poang,
        kommentar: t('npc.error'),
        saknades: '',
        dimensioner: {},
        kvitterat: '',
        miss: '',
        ankare: '',
        svar_text: t('npc.error'),
        osakert: [],
      }
      assessments.value[idx] = fallback
      return fallback
    } finally {
      assessing.value = false
    }
  }

  async function speakNpc(text: string): Promise<void> {
    const sp = adapters.value?.speak
    if (!sp || !sp.enabled || !text) return
    speaking.value = true
    try {
      await sp.speak(text)
    } finally {
      speaking.value = false
    }
  }

  /** Gaten avgjord (StepCycle har visat mätaren passera/stanna vid tröskeln). */
  function resolveGate(): void {
    adapters.value?.speak.cancel()
    speaking.value = false

    // Övning: ingen utslagning — visa resultatet och gå vidare till skarpt.
    if (mode.value === 'test') {
      if (lastPassed.value) levelsCleared.value = 1
      phase.value = 'practiceReveal'
      return
    }

    if (lastPassed.value) {
      levelsCleared.value = stepIndex.value + 1
      if (!isLastLevel.value) {
        stepIndex.value += 1
        phase.value = 'step'
        return
      }
      finishRound(true)
    } else {
      // Mjukt stopp: stannar på nådd nivå, direkt till ceremonin.
      finishRound(false)
    }
  }

  function finishRound(passedAll: boolean): void {
    const a = assessments.value[stepIndex.value]
    levelOutcome.value = {
      nivaReached: levelsCleared.value,
      maxNiva: steps.value.length,
      passedAll,
      kommentar: a?.kommentar ?? '',
      saknades: passedAll ? '' : (a?.saknades ?? ''),
    }
    phase.value = 'verdict'
    sendResult()
  }

  function practiceRevealDone(): void {
    startLive()
  }

  function verdictDone(): void {
    phase.value = 'checkout'
  }

  // --- Facilitator-kontroller ---
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
    mode.value = 'live'
    roleId.value = null
    resetRound()
    group.value = { id: PILOT_GROUP.id, members: [...PILOT_GROUP.members] }
  }

  // --- Resultat-söm (AVSTÄNGD i pilot = MockResultSink) ---
  function sendResult(): void {
    const poang = levelOutcome.value?.nivaReached ?? 0
    const chosen = ROLES.find((r) => r.id === roleId.value)
    const resultRole: 'A' | 'B' = chosen?.resultRole ?? 'A'
    const personer: ResultPerson[] = group.value.members.map((name, i) => ({
      band_id: `${group.value.id}-${i + 1}-${name}`,
      chosen_role: resultRole,
      assigned_role: resultRole,
      role_presented_as: null,
      result_value: poang,
    }))
    const payload: ResultPayload = {
      grupp: group.value.id,
      rollresultat_A: personer.filter((p) => p.chosen_role === 'A').reduce((s, p) => s + p.result_value, 0),
      rollresultat_B: personer.filter((p) => p.chosen_role === 'B').reduce((s, p) => s + p.result_value, 0),
      personer,
    }
    adapters.value?.result.send(payload)
  }

  return {
    phase,
    mode,
    group,
    roleId,
    stepIndex,
    transcripts,
    guesses,
    vals,
    assessments,
    levelsCleared,
    levelOutcome,
    assessing,
    speaking,
    paused,
    example,
    exampleType,
    steps,
    currentStep,
    currentThreshold,
    currentAssessment,
    lastPoang,
    lastPassed,
    isLastLevel,
    memberCount,
    init,
    begin,
    applyIdentity,
    listenIdentity,
    checkinDone,
    chooseRole,
    pilotIntroDone,
    startLive,
    goLiveDone,
    setGuess,
    setVal,
    assessCurrentStep,
    speakNpc,
    resolveGate,
    practiceRevealDone,
    verdictDone,
    togglePause,
    quitStation,
    reset,
  }
})

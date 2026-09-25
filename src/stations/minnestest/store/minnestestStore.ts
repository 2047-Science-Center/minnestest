/**
 * Pinia-store: orkestrering mellan tillståndsmaskinen och adaptrarna. Rollvalet
 * FORKar till ett exempel (metodspecialist→fermi, doktorand→flykt); motorn är
 * gemensam. Siffran räknas deterministiskt i gatewayen; modellen skriver texten.
 *
 * Faser: attract → checkin → roleSelect → vaultOut → [intro (fermi)] → step
 *        → vaultBack → verdict → checkout
 */
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

import { createAdapters, type Adapters } from '@/station-kit/adapters'
import type {
  FinalResult,
  PriorStep,
  StepAssessment,
} from '@/station-kit/adapters/assess/Assess'
import type { ResultPayload, ResultPerson } from '@/station-kit/adapters/result/ResultSink'
import { audio } from '@/station-kit/audio/AudioEngine'

import { config, exampleForRole, ROLES, PILOT_GROUP, type RoleId } from '@/config'
import { t } from '@/station-kit/i18n'

export type Phase =
  | 'attract'
  | 'checkin'
  | 'roleSelect'
  | 'vaultOut'
  | 'intro'
  | 'step'
  | 'vaultBack'
  | 'verdict'
  | 'checkout'

export interface StationGroup {
  id: string
  members: string[]
}

export const useMinnestestStore = defineStore('minnestest', () => {
  const phase = ref<Phase>('attract')
  const group = ref<StationGroup>({ id: PILOT_GROUP.id, members: [...PILOT_GROUP.members] })
  const roleId = ref<RoleId | null>(null)
  const stepIndex = ref(0)

  const transcripts = ref<string[]>(['', '', ''])
  const guesses = ref<(number | null)[]>([null, null, null])
  const assessments = ref<(StepAssessment | null)[]>([null, null, null])
  const final = ref<FinalResult | null>(null)
  const packlista = ref('')

  const assessing = ref(false)
  const composing = ref(false)
  const speaking = ref(false)
  /** Facilitator-paus — fryser tänk-högt-timern och lägger paus-overlay. */
  const paused = ref(false)

  const adapters = shallowRef<Adapters | null>(null)

  // --- Fork: exempel ur rollen ---
  const example = computed(() => exampleForRole(roleId.value ?? 'doktorand'))
  const exampleType = computed(() => example.value.type)
  const steps = computed(() => example.value.steps)
  const currentStep = computed(() => steps.value[stepIndex.value])
  const memberCount = computed(() => group.value.members.length)

  function init(): void {
    if (!adapters.value) adapters.value = createAdapters()
  }

  // --- Övergångar ---
  async function begin(): Promise<void> {
    phase.value = 'checkin'
    try {
      const idn = await adapters.value?.identity.tag(`band-${group.value.id}`)
      if (idn && idn.medlemmar.length >= group.value.members.length) {
        group.value = { id: idn.grupp, members: idn.medlemmar.map((m) => m.name ?? m.band_id) }
      }
    } catch {
      /* pilot: behåll PILOT_GROUP */
    }
  }

  function checkinDone(): void {
    phase.value = 'roleSelect'
  }

  function chooseRole(id: RoleId): void {
    roleId.value = id
    audio.play('confirm')
    phase.value = 'vaultOut'
  }

  function vaultOutDone(): void {
    stepIndex.value = 0
    // Fermi har en intro-skärm (hela frågan) före steg 1; flykt går rakt in.
    phase.value = example.value.introMedia ? 'intro' : 'step'
  }

  function introDone(): void {
    stepIndex.value = 0
    phase.value = 'step'
  }

  // --- Gissning (fermi) ---
  function setGuess(value: number | null): void {
    guesses.value[stepIndex.value] = value
  }

  // --- Steg-cykel ---
  function priorSoFar(upTo: number): PriorStep[] {
    const out: PriorStep[] = []
    for (let i = 0; i < upTo; i++) {
      const a = assessments.value[i]
      if (!a) continue
      out.push({
        step: i + 1,
        band: a.band,
        motiverat: a.motiverat,
        resonemang_niva: a.resonemang_niva,
        traff: a.traff,
        delpoang: a.delpoang,
        guess: guesses.value[i],
        dimensioner: a.dimensioner,
        kvitterat: a.kvitterat,
        miss: a.miss,
      })
    }
    return out
  }

  async function assessCurrentStep(transcript: string): Promise<StepAssessment> {
    const idx = stepIndex.value
    transcripts.value[idx] = transcript
    if (exampleType.value === 'flykt' && idx === 0) packlista.value = transcript
    assessing.value = true
    try {
      const a = await adapters.value!.assess.assessStep(
        example.value.configId,
        {
          step: (idx + 1) as 1 | 2 | 3,
          role: roleId.value ?? 'metodspecialist',
          example: example.value.id,
          transcript,
          guess: exampleType.value === 'fermi' ? guesses.value[idx] : undefined,
          unit: currentStep.value.unit,
          packlista: exampleType.value === 'flykt' && idx >= 2 ? packlista.value : undefined,
          prior: priorSoFar(idx),
        },
        { lang: config.lang },
      )
      assessments.value[idx] = a
      return a
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[minnestest] assessStep misslyckades — fallback', err)
      const fallback: StepAssessment = {
        band: 'Godkänd',
        motiverat: false,
        resonemang_niva: 'Godkänd',
        traff: 'tiopotens',
        delpoang: 5,
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
    if (!sp || !sp.enabled) return
    speaking.value = true
    try {
      await sp.speak(text)
    } finally {
      speaking.value = false
    }
  }

  async function nextStep(): Promise<void> {
    adapters.value?.speak.cancel()
    speaking.value = false
    if (stepIndex.value < steps.value.length - 1) {
      stepIndex.value += 1
      phase.value = 'step'
    } else {
      phase.value = 'vaultBack'
      await composeFinal()
    }
  }

  // --- Final-compose ---
  async function composeFinal(): Promise<void> {
    composing.value = true
    try {
      final.value = await adapters.value!.assess.composeFinal(
        example.value.configId,
        {
          step: 'final',
          role: roleId.value ?? 'metodspecialist',
          example: example.value.id,
          prior: priorSoFar(steps.value.length),
        },
        { lang: config.lang },
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[minnestest] composeFinal misslyckades — klient-fallback', err)
      final.value = fallbackFinal()
    } finally {
      composing.value = false
      sendResult()
    }
  }

  function vaultBackDone(): void {
    phase.value = 'verdict'
  }

  function verdictDone(): void {
    phase.value = 'checkout'
  }

  // --- Facilitator-kontroller (paus / starta om / avsluta) ---
  function togglePause(): void {
    paused.value = !paused.value
  }

  /** Avsluta stationen → stäng kiosk-fönstret (i vanlig flik ofarligt no-op). */
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
    roleId.value = null
    stepIndex.value = 0
    transcripts.value = ['', '', '']
    guesses.value = [null, null, null]
    assessments.value = [null, null, null]
    final.value = null
    packlista.value = ''
    group.value = { id: PILOT_GROUP.id, members: [...PILOT_GROUP.members] }
  }

  // --- Resultat-söm (byte-för-byte-form; AVSTÄNGD i pilot = MockResultSink) ---
  function sendResult(): void {
    const poang = final.value?.poang ?? 0
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
    // TODO(drift): tänd station<N>/result + /done (MockResultSink → MqttResultSink).
    adapters.value?.result.send(payload)
  }

  return {
    phase,
    group,
    roleId,
    stepIndex,
    transcripts,
    guesses,
    assessments,
    final,
    assessing,
    composing,
    speaking,
    paused,
    example,
    exampleType,
    steps,
    currentStep,
    memberCount,
    init,
    begin,
    checkinDone,
    chooseRole,
    vaultOutDone,
    introDone,
    setGuess,
    assessCurrentStep,
    speakNpc,
    nextStep,
    vaultBackDone,
    verdictDone,
    togglePause,
    quitStation,
    reset,
  }
})

// --- Rena hjälpare ---
function fallbackFinal(): FinalResult {
  const store = useMinnestestStore()
  const ds = store.assessments
    .map((a) => a?.delpoang)
    .filter((n): n is number => typeof n === 'number')
  const poang = ds.length ? Math.max(1, Math.min(10, Math.round(ds.reduce((s, n) => s + n, 0) / ds.length))) : 5
  return { poang, profil: '—', markering: '', sammanfattning: t('npc.error') }
}

/**
 * Pinia-store: tunt orkestreringslager mellan tillståndsmaskinen och
 * adaptrarna (identity/assess/speak/result). Håller spelets tillstånd rent och
 * testbart; UI läser store, driver övergångar via dess metoder.
 *
 * Tillståndsmaskin (arkitektur §2):
 *   attract → checkin → roleSelect → vaultOut → scenarioIntro → homeReveal
 *     → step[0..2] → vaultBack → verdict → checkout
 *
 * AI:n byggs på riktigt: per-steg /assess + en final-compose. Slutpoängen
 * beräknas deterministiskt i gatewayen (config `scoring`); klienten har bara en
 * liten fallback om gatewayen är nere så stationen aldrig dör.
 */
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'

import { createAdapters, type Adapters } from '@/station-kit/adapters'
import type {
  Band,
  Dimensioner,
  FinalResult,
  PriorStep,
  StepAssessment,
} from '@/station-kit/adapters/assess/Assess'
import type { ResultPayload, ResultPerson } from '@/station-kit/adapters/result/ResultSink'
import { audio } from '@/station-kit/audio/AudioEngine'

import {
  config,
  activeScenario,
  ROLES,
  SCALE_MARKS,
  PILOT_GROUP,
  type RoleId,
} from '@/config'
import { t } from '@/station-kit/i18n'

export type Phase =
  | 'attract'
  | 'checkin'
  | 'roleSelect'
  | 'vaultOut'
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
  const scenarioId = computed(() => config.scenario)
  const stepIndex = ref(0)

  const transcripts = ref<string[]>(['', '', ''])
  const assessments = ref<(StepAssessment | null)[]>([null, null, null])
  const final = ref<FinalResult | null>(null)
  /** Packlistan från steg 1 (§9) — återanvänds i steg 3 för retroaktiv återkoppling. */
  const packlista = ref('')

  /** Sant medan /assess-anropet för aktuellt steg pågår (delruta C väntar). */
  const assessing = ref(false)
  /** Sant medan final-compose pågår (vaultBack maskerar). */
  const composing = ref(false)
  /** Sant medan NPC-röst (/speak) läses upp (talande-vågform i delruta D). */
  const speaking = ref(false)

  const adapters = shallowRef<Adapters | null>(null)

  const scenario = computed(() => activeScenario())
  const steps = computed(() => scenario.value.steps)
  const currentStep = computed(() => steps.value[stepIndex.value])
  const memberCount = computed(() => group.value.members.length)

  function init(): void {
    if (!adapters.value) adapters.value = createAdapters()
  }

  // --- Övergångar ---

  /** Attract → incheckning (efter första gesten/band-bipp). */
  async function begin(): Promise<void> {
    phase.value = 'checkin'
    // Exercera identitets-sömmen (pilot: MockIdentity). I drift läses gruppen
    // + medlemmar ur svaret; i pilot visar vi PILOT_GROUP för en stabil roster.
    try {
      const idn = await adapters.value?.identity.tag(`band-${group.value.id}`)
      if (idn && idn.medlemmar.length >= group.value.members.length) {
        group.value = {
          id: idn.grupp,
          members: idn.medlemmar.map((m) => m.name ?? m.band_id),
        }
      }
    } catch {
      /* pilot: ignorera, behåll PILOT_GROUP */
    }
  }

  function checkinDone(): void {
    phase.value = 'roleSelect'
  }

  /** Rollval loggas (chosen_role/role_presented_as matar könssiffran). */
  function chooseRole(id: RoleId): void {
    roleId.value = id
    audio.play('confirm')
    phase.value = 'vaultOut'
  }

  function vaultOutDone(): void {
    // Rakt in i uppgift 1; scenariot introduceras av stegets läges-flöde
    // (bild+undertext → pop-up "DET HÄR ÄR LÄGET" → nedräkning → tänk-högt).
    stepIndex.value = 0
    phase.value = 'step'
  }

  // --- Steg-cykel ---

  function priorSoFar(upTo: number): PriorStep[] {
    const out: PriorStep[] = []
    for (let i = 0; i < upTo; i++) {
      const a = assessments.value[i]
      if (a)
        out.push({
          step: i + 1,
          band: a.band,
          dimensioner: a.dimensioner,
          kvitterat: a.kvitterat,
          miss: a.miss,
        })
    }
    return out
  }

  /**
   * Kör /assess för aktuellt steg. Anropas av delruta C; UI väntar på detta
   * OCH på eskaleringsklippets golv-tid innan D visas (latensmask).
   * Kastar aldrig — vid fel returneras ett neutralt fallback-svar så flödet
   * går vidare (texten är alltid grunden).
   */
  async function assessCurrentStep(transcript: string): Promise<StepAssessment> {
    const idx = stepIndex.value
    transcripts.value[idx] = transcript
    // Steg 1 = packningen → spara som packlista för retroaktiv återkoppling i steg 3.
    if (idx === 0) packlista.value = transcript
    assessing.value = true
    try {
      const a = await adapters.value!.assess.assessStep(
        {
          step: (idx + 1) as 1 | 2 | 3,
          role: roleId.value ?? 'metodspecialist',
          scenario: scenarioId.value,
          transcript,
          // Packlistan skickas från och med steg 3 (§9) för korsreferensen.
          packlista: idx >= 2 ? packlista.value : undefined,
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
        dimensioner: emptyDims(),
        motiverat: false,
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

  /** Läs upp NPC-svaret (best-effort; NullSpeak är no-op när röst är av). */
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

  /** Delruta D klar → nästa steg, eller efter steg 3 → final. */
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
      const res = await adapters.value!.assess.composeFinal(
        {
          step: 'final',
          role: roleId.value ?? 'metodspecialist',
          scenario: scenarioId.value,
          prior: priorSoFar(steps.value.length),
        },
        { lang: config.lang },
      )
      final.value = res
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[minnestest] composeFinal misslyckades — klient-fallback', err)
      final.value = fallbackFinal()
    } finally {
      composing.value = false
      sendResult()
    }
  }

  /** vaultBack-animationen klar → visa mönstringsutlåtandet. */
  function vaultBackDone(): void {
    phase.value = 'verdict'
  }

  function verdictDone(): void {
    phase.value = 'checkout'
  }

  /** Bippa ut → tillbaka till attract (ny grupp). */
  function reset(): void {
    phase.value = 'attract'
    roleId.value = null
    stepIndex.value = 0
    transcripts.value = ['', '', '']
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
    // En gruppoäng skrivs som result_value på VARJE persons rad (§7). Individuell
    // delpoäng ryms i datamodellen men aktiveras inte nu.
    const personer: ResultPerson[] = group.value.members.map((name, i) => ({
      band_id: `${group.value.id}-${i + 1}-${name}`,
      chosen_role: resultRole,
      assigned_role: resultRole, // roll-tilldelning sker uppströms i riggen
      role_presented_as: null, // könskodningen sätts uppströms; null i pilot
      result_value: poang,
    }))
    const payload: ResultPayload = {
      grupp: group.value.id,
      rollresultat_A: personer.filter((p) => p.chosen_role === 'A').reduce((s, p) => s + p.result_value, 0),
      rollresultat_B: personer.filter((p) => p.chosen_role === 'B').reduce((s, p) => s + p.result_value, 0),
      personer,
    }
    // TODO(drift): här TÄNDS utskicket station<N>/result + /done (byt MockResultSink
    // → MqttResultSink via config.mode). STATION_N sätts i config. Avstängt i pilot.
    adapters.value?.result.send(payload)
  }

  return {
    // state
    phase,
    group,
    roleId,
    scenarioId,
    stepIndex,
    transcripts,
    assessments,
    final,
    assessing,
    composing,
    speaking,
    // derived
    scenario,
    steps,
    currentStep,
    memberCount,
    // actions
    init,
    begin,
    checkinDone,
    chooseRole,
    vaultOutDone,
    assessCurrentStep,
    speakNpc,
    nextStep,
    vaultBackDone,
    verdictDone,
    reset,
  }
})

// --- Rena hjälpare ---

function emptyDims(): Dimensioner {
  return { system: false, framforhallning: false, prioritering: false, resurs: false, anpassning: false }
}

/** Klient-fallback för slutpoäng om gatewayen är nere (kanonisk beräkning bor
 *  server-side i config `scoring`; detta speglar bara §6.3 så UI aldrig dör). */
function fallbackFinal(): FinalResult {
  const store = useMinnestestStore()
  const bands = store.assessments.map((a) => a?.band ?? 'Godkänd') as Band[]
  const bandPoints: Record<Band, number> = { Svag: 1, Godkänd: 2, Stark: 3 }
  let poang = bands.reduce((s, b) => s + bandPoints[b], 0)
  const anpassningCount = store.assessments.filter((a) => a?.dimensioner.anpassning).length
  if (anpassningCount >= 2) poang += 1
  poang = Math.max(1, Math.min(10, poang))
  const mark = SCALE_MARKS.find((m) => poang >= m.min && poang <= m.max) ?? SCALE_MARKS[0]
  return { poang, profil: '—', markering: t(mark.key), sammanfattning: t('npc.error') }
}

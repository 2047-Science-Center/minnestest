<script setup lang="ts">
/**
 * En NIVÅ i den gatade stegen. Samma motor för båda grenar (flykt / fermi).
 *   situation (nivå + känd tröskel) → countdown → BLOCK 1 svar (30s) → handoff
 *   → BLOCK 2 motivering (30s) → ENHETEN VÄGER (mätaren laddar, spänning)
 *   → GATE (poängen landar mot tröskeln → PASS/FAIL).
 * Modellen poängsätter 0–10; store.resolveGate() avgör nivå-upp / mjukt stopp.
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { config } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useSpeechCapture } from '@/station-kit/capture/useSpeechCapture'
import type { StepAssessment } from '@/station-kit/adapters/assess/Assess'

import { useMinnestestStore } from '../store/minnestestStore'
import MediaSlot from './MediaSlot.vue'
import NpcReply from './NpcReply.vue'
import NumberStepper from './NumberStepper.vue'
import MicIcon from './MicIcon.vue'
import ThresholdMeter from './ThresholdMeter.vue'
import { media } from '../media/manifest'

const { t } = useI18n()
const store = useMinnestestStore()

type Sub = 'situation' | 'countdown' | 'answer' | 'handoff' | 'reason' | 'vager' | 'gate'
const sub = ref<Sub>('situation')

const WINDOW_MS = config.stepSeconds * 1000
const WARN_MS = config.warnAtSeconds * 1000

const capture = useSpeechCapture({ windowMs: WINDOW_MS, lang: config.lang })
const manualText = ref('')
const guessValue = ref(0)

const isFermi = computed(() => store.exampleType === 'fermi')
const step = computed(() => store.currentStep)
const stepKey = computed(() => step.value.key)
const referenceMedia = computed(() => step.value.referenceMedia)

const context = computed(() => t(`${stepKey.value}.context`))
const task = computed(() => t(`${stepKey.value}.task`))
const eyebrow = computed(() => (isFermi.value ? t('skatta.title') : t('lage.title')))
const reasonLine = computed(() => (isFermi.value ? t('step.how_line') : t('step.why_line')))
const unitLabel = computed(() => (step.value.unit ? t(`unit.${step.value.unit}`) : ''))
const guessScale = computed(() => step.value.guess)
const choices = computed(() => step.value.choice ?? null)
const refSrc = computed(() => media(referenceMedia.value).src)

// Nivå-info (tröskeln aviseras på förhand).
const nivaNr = computed(() => store.stepIndex + 1)
const nivaMax = computed(() => store.steps.length)
const threshold = computed(() => store.currentThreshold)
const isPractice = computed(() => store.mode === 'test')

// Levandegör (flykt): ambiens + inlevelse-replik per scen.
const AMBIENCE: Record<string, string> = {
  'flykt.ovning': 'ambience/amb-eld.mp3',
  'flykt.niva1': 'ambience/amb-packa.mp3',
  'flykt.niva2': 'ambience/amb-vagar.mp3',
  'flykt.niva3': 'ambience/amb-skog.mp3',
  'flykt.niva4': 'ambience/amb-vagar.mp3',
  'flykt.niva5': 'ambience/amb-skog.mp3',
}
const VOICE_LINE: Record<string, string> = {
  'flykt.ovning': 'voice/flykt-ovning.mp3',
  'flykt.niva1': 'voice/flykt-1.mp3',
  'flykt.niva2': 'voice/flykt-2.mp3',
  'flykt.niva3': 'voice/flykt-3.mp3',
}
const MEASURE = ['measure1', 'measure2', 'measure3'] as const

// --- SVAR vs MOTIVERING ---
const answerText = ref('')
const reasonText = ref('')
const isAnswer = computed(() => sub.value === 'answer')
const isReason = computed(() => sub.value === 'reason')
// Mik-block: flykt-svar (block 1) + motivering (block 2). Fermi svarar med
// sifferväljare/ja-nej, så fermi-svaret är INTE ett mik-block.
const micPhase = computed(() => isReason.value || (isAnswer.value && !isFermi.value))
const micLine = computed(() => (isReason.value ? reasonLine.value : t(`${stepKey.value}.answer`)))
const micDone = computed(() => (isReason.value ? t('step.we_are_done') : t('step.answer_done')))
const blockBadge = computed(() => (isReason.value ? t('step.block_reason') : t('step.block_answer')))
const reasonQ = computed(() => (isFermi.value ? t('step.reason_q_fermi') : t('step.reason_q')))
const blockQuestion = computed(() => (isReason.value ? reasonQ.value : task.value))

// --- countdown ---
const countdownN = ref(3)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// --- handoff ---
const handoffN = ref(3)
let handoffTimer: ReturnType<typeof setTimeout> | null = null

// --- mik-tid ---
const warned = ref(false)
const remainingMs = computed(() => capture.remainingMs.value ?? WINDOW_MS)
const warn = computed(() => remainingMs.value <= WARN_MS)
const timeUp = computed(() => remainingMs.value <= 0)
const timeLabel = computed(() => {
  const s = Math.max(0, Math.ceil(remainingMs.value / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// --- väger / gate ---
const meterState = ref<'idle' | 'charging' | 'pass' | 'fail'>('idle')
const meterValue = ref(0)
const assessResult = ref<StepAssessment | null>(null)
const npcDone = ref(false)
let vagerTimer: ReturnType<typeof setTimeout> | null = null
let gateTimer: ReturnType<typeof setTimeout> | null = null

const showManualFallback = computed(() => !capture.supported || Boolean(capture.error.value))

function collectedAnswer(): string {
  return [capture.transcript.value.trim(), manualText.value.trim()].filter(Boolean).join(' ').trim()
}

function clearTimers(): void {
  if (countdownTimer) clearInterval(countdownTimer)
  if (handoffTimer) clearTimeout(handoffTimer)
  if (vagerTimer) clearTimeout(vagerTimer)
  if (gateTimer) clearTimeout(gateTimer)
  countdownTimer = handoffTimer = vagerTimer = gateTimer = null
}

// --- Beats ---
function enterSituation(): void {
  clearTimers()
  capture.stop()
  sub.value = 'situation'
  manualText.value = ''
  answerText.value = ''
  reasonText.value = ''
  guessValue.value = guessScale.value?.start ?? 0
  warned.value = false
  meterState.value = 'idle'
  meterValue.value = 0
  assessResult.value = null
  npcDone.value = false
  if (!isFermi.value) {
    const amb = AMBIENCE[stepKey.value]
    if (amb) audio.bed(amb, 0.2, 1200)
    const vo = VOICE_LINE[stepKey.value]
    if (vo) audio.cue(vo, 0.9)
  }
}

function startCountdownTick(): void {
  countdownTimer = setInterval(() => {
    countdownN.value -= 1
    if (countdownN.value > 0) {
      audio.play('blip')
    } else {
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = null
      startAnswer()
    }
  }, 1000)
}

function ready(): void {
  clearTimers()
  sub.value = 'countdown'
  countdownN.value = store.example.countdownFrom
  audio.play('blip')
  startCountdownTick()
}

/** BLOCK 1 — SVARET FÖRST. Fermi: sifferväljare / ja-nej. Flykt: mik. */
function startAnswer(): void {
  sub.value = 'answer'
  warned.value = false
  manualText.value = ''
  if (isFermi.value) {
    if (guessScale.value) {
      guessValue.value = guessScale.value.start
      audio.play(MEASURE[Math.min(store.stepIndex, 2)])
    }
    return
  }
  capture.reset()
  capture.start()
}

/** Fermi sifferväljare låst → handoff. */
function lockGuess(): void {
  store.setGuess(Number.isFinite(guessValue.value) ? guessValue.value : null)
  startHandoff()
}
function skipGuess(): void {
  store.setGuess(null)
  startHandoff()
}
/** Fermi ja/nej-val → handoff. */
function chooseVal(v: string): void {
  store.setVal(v)
  audio.play('confirm')
  startHandoff()
}
/** Flykt mik-svar låst → handoff. */
function lockAnswer(): void {
  capture.stop()
  answerText.value = collectedAnswer()
  startHandoff()
}

/** Mellanskärm: svaret klart → kort 3-2-1 → motiveringen. */
function startHandoff(): void {
  sub.value = 'handoff'
  handoffN.value = 3
  audio.play('confirm')
  const tick = (): void => {
    if (sub.value !== 'handoff') return
    handoffN.value -= 1
    if (handoffN.value > 0) {
      audio.play('blip')
      handoffTimer = setTimeout(tick, 800)
    } else {
      handoffTimer = null
      startReason()
    }
  }
  handoffTimer = setTimeout(tick, 800)
}

/** BLOCK 2 — MOTIVERINGEN (det som vägs). Alltid mik. */
function startReason(): void {
  sub.value = 'reason'
  warned.value = false
  manualText.value = ''
  capture.reset()
  capture.start()
}

watch(
  () => capture.remainingMs.value,
  (ms) => {
    if (!micPhase.value || ms == null) return
    if (!warned.value && ms <= WARN_MS) {
      warned.value = true
      audio.play('deny')
    }
    if (ms <= 0) micDoneAction()
  },
)

function micDoneAction(): void {
  if (isAnswer.value) lockAnswer()
  else finishReason()
}

function finishReason(): void {
  if (sub.value !== 'reason') return
  capture.stop()
  reasonText.value = collectedAnswer()
  enterVager()
}

/** ENHETEN VÄGER — mätaren laddar medan bedömningen hämtas. Spänning. */
function enterVager(): void {
  sub.value = 'vager'
  meterState.value = 'charging'
  meterValue.value = 0
  assessResult.value = null
  audio.play('render') // stigande svep medan enheten väger
  const transcript = isFermi.value
    ? reasonText.value
    : [answerText.value, reasonText.value].filter(Boolean).join('. ').trim()

  let dwellDone = false
  let gotAssess = false
  const tryGate = (): void => {
    if (dwellDone && gotAssess && sub.value === 'vager') enterGate()
  }
  vagerTimer = setTimeout(() => {
    dwellDone = true
    tryGate()
  }, 2600)
  void store.assessCurrentStep(transcript, isFermi.value ? undefined : answerText.value).then((a) => {
    assessResult.value = a
    gotAssess = true
    tryGate()
  })
}

/** GATE — poängen landar mot tröskeln. PASS / FAIL. */
function enterGate(): void {
  sub.value = 'gate'
  const passed = store.lastPassed
  meterState.value = passed ? 'pass' : 'fail'
  // Låt mätaren stå 0 en tick → animera upp mot poängen (width-transition).
  meterValue.value = 0
  gateTimer = setTimeout(() => {
    meterValue.value = store.lastPoang
  }, 80)
  // Resolve-ljud när stapeln landat (~1.1s travel).
  gateTimer = setTimeout(() => {
    audio.play(passed ? 'win' : 'deny')
  }, 1200)
  // NPC läser kommentaren (+ vad som saknades vid fail).
  const a = assessResult.value
  const miss = passed ? '' : a?.saknades ? ` ${a.saknades}` : ''
  void store.speakNpc(`${a?.kommentar ?? ''}${miss}`)
}

function proceed(): void {
  store.resolveGate()
}

watch(
  () => store.stepIndex,
  () => enterSituation(),
)

// Facilitator-paus: frys det aktiva tidsmomentet.
watch(
  () => store.paused,
  (p) => {
    if (p) {
      if (micPhase.value) capture.pause()
      else if (sub.value === 'countdown' && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    } else {
      if (micPhase.value) capture.resume()
      else if (sub.value === 'countdown' && !countdownTimer) startCountdownTick()
    }
  },
)

onMounted(() => enterSituation())
onUnmounted(() => {
  clearTimers()
  capture.stop()
  audio.bedStop(800)
})

const gateNpcText = computed(() => {
  const a = assessResult.value
  if (!a) return ''
  const miss = store.lastPassed ? '' : a.saknades ? ` ${a.saknades}` : ''
  return `${a.kommentar ?? ''}${miss}`.trim()
})
const gateCta = computed(() =>
  store.lastPassed && !store.isLastLevel && !isPractice.value
    ? t('gate.next_level')
    : t('gate.see_result'),
)
</script>

<template>
  <div class="cycle">
    <!-- SITUATION — full-skärms scen + nivå/tröskel aviseras -->
    <section v-if="sub === 'situation'" class="situation">
      <div
        v-if="refSrc"
        :key="referenceMedia"
        class="situation__bg"
        :style="{ backgroundImage: `url(${refSrc})` }"
        aria-hidden="true"
      />
      <div class="situation__scrim" aria-hidden="true" />
      <div class="situation__inner">
        <p class="situation__eyebrow">{{ eyebrow }} · {{ t('gate.level', { n: nivaNr, max: nivaMax }) }}</p>
        <p v-if="context" class="situation__context">{{ context }}</p>
        <h1 class="situation__task ink-strong">{{ task }}</h1>
        <p class="situation__gate">{{ t('gate.need', { th: threshold }) }}</p>
        <button class="crt-button crt-button--strong situation__go" @click="ready()">
          {{ t('lage.ready') }} ▸
        </button>
      </div>
    </section>

    <!-- COUNTDOWN -->
    <section v-else-if="sub === 'countdown'" class="countdown">
      <p class="countdown__label">{{ t('countdown.prefix') }} …</p>
      <div class="countdown__num" :key="countdownN">{{ countdownN }}</div>
      <p class="countdown__cue">{{ task }}</p>
    </section>

    <!-- HANDOFF -->
    <section v-else-if="sub === 'handoff'" class="handoff">
      <p class="handoff__done"><span class="handoff__check">✓</span> {{ t('step.handoff_title') }}</p>
      <p class="handoff__next ink-strong">{{ t('step.handoff_sub') }}</p>
      <div class="handoff__num" :key="handoffN">{{ handoffN }}</div>
    </section>

    <!-- ANSWER (fermi sifferväljare) -->
    <section v-else-if="sub === 'answer' && isFermi && guessScale" class="guess">
      <div class="guess__card amber-frame">
        <p class="guess__title ink-strong">{{ t('guess.title') }}</p>
        <p class="guess__sub">{{ task }}</p>
        <div class="guess__field">
          <NumberStepper
            v-model="guessValue"
            :step="guessScale.step"
            :min="guessScale.min"
            :max="guessScale.max"
            :unit="unitLabel"
          />
        </div>
        <p class="guess__hint">{{ t('guess.hold_hint') }}</p>
        <div class="guess__actions">
          <button class="crt-button guess__skip" @click="skipGuess()">{{ t('guess.skip') }} ▸</button>
          <button class="crt-button crt-button--strong" @click="lockGuess()">{{ t('guess.lock') }} ▸</button>
        </div>
      </div>
    </section>

    <!-- ANSWER (fermi ja/nej) -->
    <section v-else-if="sub === 'answer' && isFermi && choices" class="choice">
      <div class="choice__card amber-frame">
        <p class="choice__q ink-strong">{{ task }}</p>
        <div class="choice__btns">
          <button v-for="c in choices" :key="c" class="crt-button crt-button--strong choice__btn" @click="chooseVal(c)">
            {{ c }}
          </button>
        </div>
      </div>
    </section>

    <!-- MIK-BLOCK — flykt-svar (block 1) + motivering (block 2) -->
    <section v-else-if="micPhase" class="think">
      <div v-if="refSrc" :key="referenceMedia" class="think__ref" aria-hidden="true">
        <MediaSlot :id="referenceMedia" :autoplay="false" />
      </div>
      <header class="think__header">
        <div class="think__q">
          <p class="think__context">{{ context }}</p>
          <h2 class="think__task ink-strong">{{ blockQuestion }}</h2>
        </div>
        <div class="think__timer" :class="{ 'think__timer--warn': warn }">{{ timeLabel }}</div>
      </header>
      <div class="think__live">
        <span class="think__block" :class="{ 'think__block--reason': isReason }">{{ blockBadge }}</span>
        <p class="think__transcript" :class="{ 'think__transcript--empty': !capture.transcript.value }">
          {{ capture.transcript.value || micLine }}
        </p>
      </div>
      <div class="think__foot">
        <span class="think__mic"><MicIcon /> {{ isReason ? t('step.mic_active') : t('step.talk_now') }}</span>
        <span class="think__why">{{ micLine }}</span>
        <span v-if="warn && !timeUp" class="think__warn">{{ t('step.warn') }}</span>
        <span v-if="timeUp" class="think__warn">{{ t('step.time_up') }}</span>
        <button class="crt-button crt-button--strong think__done" @click="micDoneAction()">
          {{ micDone }} ▸
        </button>
      </div>
      <template v-if="showManualFallback">
        <p v-if="!capture.supported" class="frame__nospeech">{{ t('step.no_speech') }}</p>
        <p v-else class="frame__nospeech frame__nospeech--err">{{ t(`step.mic_err.${capture.error.value}`) }}</p>
        <textarea v-model="manualText" class="frame__manual" :placeholder="t('step.manual_placeholder')" rows="2" />
      </template>
    </section>

    <!-- ENHETEN VÄGER -->
    <section v-else-if="sub === 'vager'" class="vager">
      <p class="vager__label">{{ t('gate.weighing') }}</p>
      <ThresholdMeter :value="0" :threshold="threshold" state="charging" />
      <p class="vager__sub">{{ t('gate.level', { n: nivaNr, max: nivaMax }) }} · {{ t('gate.need', { th: threshold }) }}</p>
      <span class="vager__dots"><i /><i /><i /></span>
    </section>

    <!-- GATE -->
    <section v-else class="gate" :class="store.lastPassed ? 'gate--pass' : 'gate--fail'">
      <p class="gate__verdict ink-strong">
        {{ store.lastPassed ? t('gate.cleared', { n: nivaNr }) : t('gate.stopped', { n: nivaNr }) }}
      </p>
      <ThresholdMeter :value="meterValue" :threshold="threshold" :state="meterState" />
      <div class="gate__reply">
        <NpcReply v-if="gateNpcText" :text="gateNpcText" :speaking="store.speaking" @done="npcDone = true" />
      </div>
      <button class="crt-button crt-button--strong gate__next" :disabled="!npcDone" @click="proceed()">
        {{ gateCta }} ▸
      </button>
    </section>
  </div>
</template>

<style scoped>
.cycle {
  height: 100%;
  min-height: 0;
}

/* ---------- SITUATION ---------- */
.situation {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
.situation__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  animation: sit-kenburns 24s ease-in-out both;
}
@keyframes sit-kenburns {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1.12);
  }
}
.situation__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.32) 45%, rgba(0, 0, 0, 0.72) 100%);
}
.situation__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  text-align: center;
  width: min(94%, 48ch);
  padding: 1.2rem;
  margin: auto;
}
.situation__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.28em;
  font-size: 0.9rem;
  color: var(--color-ink-strong);
  opacity: 0.85;
  margin: 0;
}
.situation__context {
  color: var(--color-ink-strong);
  font-family: var(--font-mono);
  font-size: clamp(1.05rem, 2.3vw, 1.45rem);
  line-height: 1.4;
  max-width: 34ch;
  margin: 0;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.8);
}
.situation__task {
  font-family: var(--font-retro);
  font-size: clamp(2.2rem, 6.5vw, 4rem);
  line-height: 1.04;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  text-shadow: var(--glow-soft), 0 2px 18px rgba(0, 0, 0, 0.85);
  margin: 0;
}
.situation__gate {
  font-family: var(--font-mono);
  font-size: 1rem;
  letter-spacing: 0.04em;
  color: var(--mode-accent, var(--color-primary));
  margin: 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.85);
}
.situation__go {
  margin-top: 0.4rem;
}

/* ---------- COUNTDOWN ---------- */
.countdown {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.countdown__label {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  margin: 0;
}
.countdown__cue {
  font-family: var(--font-retro);
  font-size: 1.6rem;
  letter-spacing: 0.06em;
  color: var(--color-ink-strong);
  margin: 0;
  text-align: center;
}
.countdown__num {
  font-family: var(--font-retro);
  font-size: clamp(5rem, 18vw, 10rem);
  line-height: 1;
  color: var(--color-primary);
  text-shadow: var(--glow-strong, 0 0 24px rgba(255, 176, 0, 0.7));
  animation: cd-pop 0.9s ease-out;
}
@keyframes cd-pop {
  from {
    transform: scale(1.35);
    opacity: 0.4;
  }
}

/* ---------- HANDOFF ---------- */
.handoff {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  text-align: center;
}
.handoff__done {
  font-family: var(--font-mono);
  letter-spacing: 0.12em;
  color: var(--color-primary);
  margin: 0;
}
.handoff__check {
  color: var(--color-lag2, #7ad14f);
  font-weight: 700;
}
.handoff__next {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5vw, 3rem);
  letter-spacing: 0.04em;
  margin: 0;
}
.handoff__num {
  font-family: var(--font-retro);
  font-size: clamp(4rem, 14vw, 8rem);
  line-height: 1;
  color: var(--color-primary);
  text-shadow: var(--glow-strong);
  animation: cd-pop 0.7s ease-out;
}

/* ---------- THINK (mik) ---------- */
.think {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.think__ref {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: ref-reveal 0.65s var(--ease-out, ease-out) both, ken-burns 26s ease-in-out 0.65s infinite alternate;
}
@keyframes ref-reveal {
  from {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
}
@keyframes ken-burns {
  from {
    transform: scale(1) translate(0, 0);
  }
  to {
    transform: scale(1.09) translate(-1.5%, -1%);
  }
}
.think__header {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.think__q {
  flex: 1;
}
.think__context {
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  margin: 0 0 0.2rem;
}
.think__task {
  font-family: var(--font-retro);
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  line-height: 1.15;
  letter-spacing: 0.03em;
  color: var(--color-primary);
  margin: 0;
}
.think__timer {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-dim);
  border-radius: 6px;
  padding: 0.1em 0.5em;
  white-space: nowrap;
}
.think__timer--warn {
  color: var(--color-danger, #ff5a5a);
  border-color: var(--color-danger, #ff5a5a);
  animation: blink 0.5s steps(2, start) infinite;
}
.think__live {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}
.think__block {
  font-family: var(--font-mono);
  letter-spacing: 0.22em;
  font-size: 0.72rem;
  color: var(--mode-accent, var(--color-primary));
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 0.18em 0.9em;
  opacity: 0.85;
}
.think__block--reason {
  color: var(--color-primary);
}
.think__transcript {
  font-size: clamp(1.8rem, 3.6vw, 2.8rem);
  line-height: 1.4;
  color: var(--color-ink-strong);
  margin: 0 auto;
  max-width: 24ch;
  text-align: center;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.8);
}
.think__transcript--empty {
  color: var(--color-ink-muted);
  font-style: italic;
  font-size: clamp(1.1rem, 2.4vw, 1.6rem);
}
.think__foot {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.think__mic {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-family: var(--font-mono);
  color: var(--color-primary);
  white-space: nowrap;
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.think__why {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  margin: 0;
  flex: 1;
  min-width: 12ch;
}
.think__warn {
  font-family: var(--font-retro);
  color: var(--color-danger, #ff5a5a);
  white-space: nowrap;
}
.think__done {
  margin-left: auto;
}
.frame__nospeech {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  margin: 0;
  position: relative;
}
.frame__nospeech--err {
  color: var(--color-danger, #ff5a5a);
}
.frame__manual {
  position: relative;
  width: 100%;
  background: #0a0a0a;
  color: var(--color-ink-strong);
  border: 1px solid var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  padding: 0.5rem;
  font-family: var(--font-mono);
  resize: vertical;
}

/* ---------- GUESS (fermi) ---------- */
.guess,
.choice {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guess__card,
.choice__card {
  width: min(92%, 40ch);
  padding: 1.6rem 1.8rem;
  border-radius: var(--radius, 8px);
  background: rgba(0, 0, 0, 0.85);
  text-align: center;
}
.guess__title {
  font-family: var(--font-retro);
  letter-spacing: 0.16em;
  color: var(--color-primary);
  margin: 0 0 0.4rem;
}
.guess__sub {
  color: var(--color-ink-muted);
  margin: 0 0 1.2rem;
}
.guess__field {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.6rem;
}
.guess__hint {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
  margin: 0 0 1.2rem;
}
.guess__actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}
.guess__skip {
  opacity: 0.7;
}

/* ---------- CHOICE (fermi ja/nej) ---------- */
.choice__q {
  font-family: var(--font-retro);
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: var(--color-primary);
  margin: 0 0 1.4rem;
}
.choice__btns {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.choice__btn {
  min-width: 7ch;
  font-size: 1.5rem;
  padding: 0.5em 1.4em;
}

/* ---------- VÄGER ---------- */
.vager {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
}
.vager__label {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5vw, 3rem);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  margin: 0;
  animation: mic-pulse 1.6s ease-in-out infinite;
}
.vager__sub {
  font-family: var(--font-mono);
  color: var(--color-ink-muted);
  margin: 0;
}
.vager__dots {
  display: inline-flex;
  gap: 5px;
}
.vager__dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dot-blink 1s infinite;
}
.vager__dots i:nth-child(2) {
  animation-delay: 0.2s;
}
.vager__dots i:nth-child(3) {
  animation-delay: 0.4s;
}

/* ---------- GATE ---------- */
.gate {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.3rem;
}
.gate__verdict {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 6vw, 3.4rem);
  letter-spacing: 0.06em;
  margin: 0;
  text-align: center;
  animation: sit-in 0.45s var(--ease-out, ease-out) both;
}
.gate--pass .gate__verdict {
  color: var(--color-lag2, #7ad14f);
}
.gate--fail .gate__verdict {
  color: var(--color-danger, #ff5a3c);
}
.gate__reply {
  max-width: 40ch;
}
.gate__next {
  margin-top: 0.3rem;
}
@keyframes sit-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@keyframes mic-pulse {
  50% {
    opacity: 0.4;
  }
}
@keyframes dot-blink {
  50% {
    opacity: 0.2;
  }
}
@keyframes blink {
  50% {
    opacity: 0.4;
  }
}
@media (prefers-reduced-motion: reduce) {
  .think__mic,
  .vager__dots i,
  .vager__label,
  .think__timer--warn,
  .countdown__num,
  .think__ref {
    animation: none;
  }
}
</style>

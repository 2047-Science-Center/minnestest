<script setup lang="ts">
/**
 * En uppgifts-cykel för aktuellt steg. Motorn är gemensam för båda exempel
 * (flykt / fermi); typen styr copy + om ett GISSNINGS-moment (fermi) ligger
 * mellan tänk-högt och analys.
 *   situation → countdown → think (tvåfas) → [guess (fermi)] → analys → reply
 * Uppgiften/frågan står STOR och tydlig hela tiden (liten kontext ovanför).
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
import { media } from '../media/manifest'

const { t } = useI18n()
const store = useMinnestestStore()

type Sub = 'situation' | 'countdown' | 'answer' | 'reason' | 'analys' | 'reply'
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
const analysMedia = computed(() => step.value.analysMedia ?? step.value.referenceMedia)

const context = computed(() => t(`${stepKey.value}.context`))
const task = computed(() => t(`${stepKey.value}.task`))
const timeLine = computed(() => t(`${stepKey.value}.time`))
const eyebrow = computed(() => (isFermi.value ? t('skatta.title') : t('lage.title')))
const reasonLine = computed(() => (isFermi.value ? t('step.how_line') : t('step.why_line')))
const analyzingLine = computed(() => (isFermi.value ? t('step.weighing') : t('step.analyzing')))
const unitLabel = computed(() => (step.value.unit ? t(`unit.${step.value.unit}`) : ''))
const guessScale = computed(() => step.value.guess)
const popupLines = computed(() =>
  ['popup1', 'popup2', 'popup3']
    .map((k) => t(`${stepKey.value}.${k}`))
    .filter((s) => s.trim().length > 0),
)

// --- SVAR vs MOTIVERING: två skilda infångningar. Flykt: mik+mik. Fermi: siffra+mik. ---
const answerText = ref('')
const reasonText = ref('')
const isAnswer = computed(() => sub.value === 'answer')
const isReason = computed(() => sub.value === 'reason')
// Flykt har ett mik-svarsblock; fermi svarar med sifferväljaren i stället.
const micPhase = computed(() => isReason.value || (isAnswer.value && !isFermi.value))
const micLine = computed(() => (isReason.value ? reasonLine.value : t('step.answer_line')))
const micDone = computed(() => (isReason.value ? t('step.we_are_done') : t('step.answer_done')))
const blockBadge = computed(() => (isReason.value ? t('step.block_reason') : t('step.block_answer')))

// --- countdown ---
const countdownN = ref(3)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// --- mik-block (answer/reason) tid ---
const warned = ref(false)
const remainingMs = computed(() => capture.remainingMs.value ?? WINDOW_MS)
const warn = computed(() => remainingMs.value <= WARN_MS)
const timeUp = computed(() => remainingMs.value <= 0)
const timeLabel = computed(() => {
  const s = Math.max(0, Math.ceil(remainingMs.value / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// --- analys ---
const dwellDone = ref(false)
const assessDone = ref(false)
const assessResult = ref<StepAssessment | null>(null)
let dwellTimer: ReturnType<typeof setTimeout> | null = null
let dwellEndsAt = 0
let dwellRemaining = 0

// --- reply ---
const npcDone = ref(false)

// Det transkript vi skickar in — sparas för analys-ekot.
const lastTranscript = ref('')

const showManualFallback = computed(() => !capture.supported || Boolean(capture.error.value))

function collectedAnswer(): string {
  return [capture.finalTranscript.value.trim(), manualText.value.trim()].filter(Boolean).join(' ').trim()
}

function clearTimers(): void {
  if (countdownTimer) clearInterval(countdownTimer)
  if (dwellTimer) clearTimeout(dwellTimer)
  countdownTimer = dwellTimer = null
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

/** BLOCK 1 — SVARET FÖRST. Fermi: sifferväljare (ingen mik). Flykt: mik. */
function startAnswer(): void {
  sub.value = 'answer'
  warned.value = false
  manualText.value = ''
  if (isFermi.value) {
    guessValue.value = guessScale.value?.start ?? 0
    return // sifferväljaren — ingen mik, ingen timer
  }
  capture.reset()
  capture.start()
}

/** Lås svaret → BLOCK 2 (motiveringen). */
function lockAnswer(): void {
  if (isFermi.value) {
    store.setGuess(Number.isFinite(guessValue.value) ? guessValue.value : null)
  } else {
    answerText.value = collectedAnswer()
    capture.stop()
  }
  startReason()
}
function skipGuess(): void {
  store.setGuess(null)
  startReason()
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

/** Done-knapp (eller tiden ut) för aktuellt mik-block. */
function micDoneAction(): void {
  if (isAnswer.value) lockAnswer()
  else finishReason()
}

function finishReason(): void {
  if (sub.value !== 'reason') return
  reasonText.value = collectedAnswer()
  capture.stop()
  enterAnalys()
}

function enterAnalys(): void {
  sub.value = 'analys'
  dwellDone.value = false
  assessDone.value = false
  assessResult.value = null
  // Flykt: svar + motivering (modellen ser beslut + varför). Fermi: motiveringen
  // (siffran skickas separat som guess). Steg-1-svaret blir packlistan (flykt).
  const transcript = isFermi.value
    ? reasonText.value
    : [answerText.value, reasonText.value].filter(Boolean).join('. ').trim()
  lastTranscript.value = transcript
  const dwellMs = media(analysMedia.value).durationMs ?? 6000
  dwellEndsAt = Date.now() + dwellMs
  dwellTimer = setTimeout(() => {
    dwellDone.value = true
    maybeReveal()
  }, dwellMs)
  void store.assessCurrentStep(transcript, isFermi.value ? undefined : answerText.value).then((a) => {
    assessResult.value = a
    assessDone.value = true
    maybeReveal()
  })
}

function maybeReveal(): void {
  if (sub.value === 'analys' && dwellDone.value && assessDone.value && assessResult.value) {
    npcDone.value = false
    sub.value = 'reply'
    void store.speakNpc(assessResult.value.svar_text)
  }
}

function skipDwell(): void {
  if (dwellTimer) clearTimeout(dwellTimer)
  dwellDone.value = true
  maybeReveal()
}

const isPilot = config.mode === 'pilot'

watch(
  () => store.stepIndex,
  () => enterSituation(),
)

// Facilitator-paus: frys det aktiva tidsmomentet, återuppta med kvarvarande tid.
watch(
  () => store.paused,
  (p) => {
    if (p) {
      if (micPhase.value) capture.pause()
      else if (sub.value === 'countdown' && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      } else if (sub.value === 'analys' && dwellTimer) {
        dwellRemaining = Math.max(0, dwellEndsAt - Date.now())
        clearTimeout(dwellTimer)
        dwellTimer = null
      }
    } else {
      if (micPhase.value) capture.resume()
      else if (sub.value === 'countdown' && !countdownTimer) startCountdownTick()
      else if (sub.value === 'analys' && !dwellTimer && !dwellDone.value) {
        dwellEndsAt = Date.now() + dwellRemaining
        dwellTimer = setTimeout(() => {
          dwellDone.value = true
          maybeReveal()
        }, dwellRemaining)
      }
    }
  },
)

onMounted(() => enterSituation())
onUnmounted(() => {
  clearTimers()
  capture.stop()
})
</script>

<template>
  <div class="cycle">
    <!-- SITUATION — full-skärms komposition, ingen bild, ingen regel-ruta -->
    <section v-if="sub === 'situation'" class="situation">
      <div class="situation__inner">
        <p class="situation__eyebrow">{{ eyebrow }}</p>
        <h1 class="situation__task ink-strong">{{ task }}</h1>
        <ul v-if="popupLines.length" class="situation__lines">
          <li v-for="(l, i) in popupLines" :key="i" :style="{ '--i': i }">{{ l }}</li>
        </ul>
        <p class="situation__time">{{ timeLine }}</p>
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

    <!-- ANSWER (fermi) — SVARET FÖRST: sifferväljaren -->
    <section v-else-if="sub === 'answer' && isFermi" class="guess">
      <div class="guess__card amber-frame">
        <p class="guess__title ink-strong">{{ t('guess.title') }}</p>
        <p class="guess__sub">{{ task }}</p>
        <div class="guess__field">
          <NumberStepper
            v-if="guessScale"
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
          <button class="crt-button crt-button--strong" @click="lockAnswer()">{{ t('guess.lock') }} ▸</button>
        </div>
      </div>
    </section>

    <!-- MIK-BLOCK — flykt-svar (block 1) + motivering (block 2), uppgiften stor hela tiden -->
    <section v-else-if="micPhase" class="think" :class="isReason ? 'is-reason' : 'is-answer'">
      <div v-if="store.mode === 'live'" class="think__ref" aria-hidden="true">
        <MediaSlot :id="referenceMedia" :autoplay="false" />
      </div>

      <header class="think__header">
        <div class="think__q">
          <p class="think__context">{{ context }}</p>
          <h2 class="think__task ink-strong">{{ task }}</h2>
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
        <p v-else class="frame__nospeech frame__nospeech--err">
          {{ t(`step.mic_err.${capture.error.value}`) }}
        </p>
        <textarea
          v-model="manualText"
          class="frame__manual"
          :placeholder="t('step.manual_placeholder')"
          rows="2"
        />
      </template>
    </section>

    <!-- ANALYS — ENHETEN "tänker högt" medan bedömningen hämtas -->
    <section v-else-if="sub === 'analys'" class="analys">
      <div v-if="store.mode === 'live'" class="analys__bg" aria-hidden="true">
        <MediaSlot :id="analysMedia" :autoplay="false" />
      </div>
      <div class="analys__strip">
        <span>{{ analyzingLine }}</span>
        <span class="analys__dots"><i /><i /><i /></span>
        <button v-if="isPilot" class="analys__skip" @click="skipDwell()">hoppa över</button>
      </div>
      <p v-if="lastTranscript" class="analys__echo">{{ lastTranscript }}</p>
    </section>

    <!-- REPLY -->
    <section v-else class="reply">
      <NpcReply
        v-if="assessResult"
        :text="assessResult.svar_text"
        :speaking="store.speaking"
        @done="npcDone = true"
      />
      <button
        class="crt-button crt-button--strong reply__next"
        :disabled="!npcDone"
        @click="store.nextStep()"
      >
        {{ t('step.next') }} ▸
      </button>
    </section>
  </div>
</template>

<style scoped>
.cycle {
  height: 100%;
  min-height: 0;
}

/* ---------- SITUATION (full-skärms intro) ---------- */
.situation {
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
.situation__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  text-align: center;
  max-width: 30ch;
  padding: 0.8rem;
  margin: auto;
}
.situation__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.28em;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  margin: 0;
  animation: sit-in 0.5s var(--ease-out, ease-out) both;
}
.situation__task {
  font-family: var(--font-retro);
  font-size: clamp(1.9rem, 5vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: 0.03em;
  color: var(--color-primary);
  text-shadow: var(--glow-soft);
  margin: 0;
  animation: sit-in 0.55s var(--ease-out, ease-out) 0.05s both;
}
.situation__lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.situation__lines li {
  color: var(--color-ink-strong);
  font-size: clamp(1.05rem, 2.4vw, 1.5rem);
  line-height: 1.4;
  animation: sit-in 0.5s var(--ease-out, ease-out) both;
  animation-delay: calc(0.15s + var(--i) * 0.07s);
}
.situation__time {
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin: 0;
  opacity: 0.9;
  animation: sit-in 0.5s var(--ease-out, ease-out) 0.35s both;
}
.situation__go {
  margin-top: 0.5rem;
  animation: sit-in 0.5s var(--ease-out, ease-out) 0.45s both;
}
@keyframes sit-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
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

/* ---------- THINK ---------- */
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
  opacity: 0.16;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
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
.tp1 .think__header {
  padding-top: 8vh;
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
/* Block-pill: SVARA (block 1) vs MOTIVERA (block 2) — lugn signal om vilket steg. */
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
/* Framväxande tänk-högt-text — stor och centrerad (linjerar med Utmana experten). */
.think__transcript {
  font-size: clamp(1.8rem, 3.6vw, 2.8rem);
  line-height: 1.4;
  color: var(--color-ink-strong);
  margin: 0 auto;
  max-width: 24ch;
  text-align: center;
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
.guess {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guess__card {
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

/* ---------- ANALYS ---------- */
.analys {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 0.8rem;
}
.analys__bg {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.analys__strip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}
.analys__dots {
  display: inline-flex;
  gap: 3px;
}
.analys__dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dot-blink 1s infinite;
}
.analys__dots i:nth-child(2) {
  animation-delay: 0.2s;
}
.analys__dots i:nth-child(3) {
  animation-delay: 0.4s;
}
.analys__skip {
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.5;
  margin-left: 1rem;
}
/* Svagt eko av det gruppen sa medan enheten väger (ersätter ThinkingStream). */
.analys__echo {
  position: relative;
  margin: 0 auto;
  max-width: 28ch;
  text-align: center;
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2vw, 1.3rem);
  line-height: 1.5;
  opacity: 0.7;
}

/* ---------- REPLY ---------- */
.reply {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}
.reply__next {
  align-self: center;
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
  .analys__dots i,
  .think__timer--warn,
  .countdown__num {
    animation: none;
  }
}
</style>

<script setup lang="ts">
/**
 * En uppgifts-cykel för aktuellt steg (FLYKT). Förenklat läges-flöde (§3),
 * IDENTISKT för uppgift 1–3:
 *   situation  — referensbilden + undertext (1 mening) + pop-up "DET HÄR ÄR
 *                LÄGET" (2–3 rader) med VI ÄR REDO.
 *   countdown  — "Uppgiften börjar om …10, 9, 8 …".
 *   think      — tänk-högt (tvåfas): fråga hero → transkript hero; referensbilden
 *                kvar centrerad; nedräkningstimer väl synlig; motivering efterfrågas.
 *   analys     — referensbilden dominerar (latensmask) medan /assess körs.
 *   reply      — NPC-svaret hero (+ ev. röst), NÄSTA ▸.
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
import { media } from '../media/manifest'

const { t } = useI18n()
const store = useMinnestestStore()

type Sub = 'situation' | 'countdown' | 'think' | 'analys' | 'reply'
const sub = ref<Sub>('situation')

const WINDOW_MS = config.stepSeconds * 1000
const WARN_MS = config.warnAtSeconds * 1000

const capture = useSpeechCapture({ windowMs: WINDOW_MS, lang: config.lang })
const manualText = ref('')

const step = computed(() => store.currentStep)
const stepKey = computed(() => step.value.key)
const referenceMedia = computed(() => step.value.referenceMedia)

const undertext = computed(() => t(`${stepKey.value}.undertext`))
const promptText = computed(() => t(`${stepKey.value}.fraga`))
const popupLines = computed(() =>
  ['popup1', 'popup2', 'popup3']
    .map((k) => t(`${stepKey.value}.${k}`))
    .filter((s) => s.trim().length > 0),
)

// --- situation (beat 1 + 2) ---
const popupShown = ref(false)
let popupTimer: ReturnType<typeof setTimeout> | null = null

// --- countdown (beat 3) ---
const countdownN = ref(config.startCountdown)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// --- think (beat 4, tvåfas) ---
const bPhase = ref<1 | 2>(1)
const PHASE1_MS = 4500
let phaseTimer: ReturnType<typeof setTimeout> | null = null
const warned = ref(false)
const remainingMs = computed(() => capture.remainingMs.value ?? WINDOW_MS)
const warn = computed(() => remainingMs.value <= WARN_MS)
const timeUp = computed(() => remainingMs.value <= 0)
const timeLabel = computed(() => {
  const s = Math.max(0, Math.ceil(remainingMs.value / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// --- analys (latensmask) ---
const dwellDone = ref(false)
const assessDone = ref(false)
const assessResult = ref<StepAssessment | null>(null)
let dwellTimer: ReturnType<typeof setTimeout> | null = null

// --- reply ---
const npcDone = ref(false)

const showManualFallback = computed(() => !capture.supported || Boolean(capture.error.value))

function collectedTranscript(): string {
  return [capture.finalTranscript.value.trim(), manualText.value.trim()]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function clearTimers(): void {
  if (popupTimer) clearTimeout(popupTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  if (phaseTimer) clearTimeout(phaseTimer)
  if (dwellTimer) clearTimeout(dwellTimer)
  popupTimer = countdownTimer = phaseTimer = dwellTimer = null
}

// --- Beats ---
function enterSituation(): void {
  clearTimers()
  sub.value = 'situation'
  popupShown.value = false
  manualText.value = ''
  bPhase.value = 1
  warned.value = false
  popupTimer = setTimeout(() => (popupShown.value = true), 1500)
}

function ready(): void {
  clearTimers()
  sub.value = 'countdown'
  countdownN.value = config.startCountdown
  audio.play('blip')
  countdownTimer = setInterval(() => {
    countdownN.value -= 1
    if (countdownN.value > 0) {
      audio.play('blip')
    } else {
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = null
      startThink()
    }
  }, 1000)
}

function startThink(): void {
  sub.value = 'think'
  bPhase.value = 1
  warned.value = false
  if (phaseTimer) clearTimeout(phaseTimer)
  phaseTimer = setTimeout(() => toPhase2(), PHASE1_MS)
  capture.reset()
  capture.start()
}

function toPhase2(): void {
  bPhase.value = 2
  if (phaseTimer) {
    clearTimeout(phaseTimer)
    phaseTimer = null
  }
}

watch(
  () => capture.transcript.value,
  (v) => {
    if (sub.value === 'think' && bPhase.value === 1 && v.trim()) toPhase2()
  },
)

watch(
  () => capture.remainingMs.value,
  (ms) => {
    if (sub.value !== 'think' || ms == null) return
    if (!warned.value && ms <= WARN_MS) {
      warned.value = true
      audio.play('deny')
    }
    if (ms <= 0) finishThink()
  },
)

function finishThink(): void {
  if (sub.value !== 'think') return
  if (phaseTimer) {
    clearTimeout(phaseTimer)
    phaseTimer = null
  }
  capture.stop()
  enterAnalys()
}

function enterAnalys(): void {
  sub.value = 'analys'
  dwellDone.value = false
  assessDone.value = false
  assessResult.value = null
  const dwellMs = media(referenceMedia.value).durationMs ?? 6000
  dwellTimer = setTimeout(() => {
    dwellDone.value = true
    maybeReveal()
  }, dwellMs)
  void store.assessCurrentStep(collectedTranscript()).then((a) => {
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

// Nytt steg (stepIndex ändras) → nytt läges-flöde från början.
watch(
  () => store.stepIndex,
  () => enterSituation(),
)

onMounted(() => enterSituation())
onUnmounted(() => {
  clearTimers()
  capture.stop()
})
</script>

<template>
  <div class="cycle">
    <!-- SITUATION (beat 1 + 2) -->
    <section v-if="sub === 'situation'" class="situation">
      <div class="situation__media"><MediaSlot :id="referenceMedia" :autoplay="false" /></div>
      <p class="situation__undertext">{{ undertext }}</p>

      <transition name="pop">
        <div v-if="popupShown" class="popup amber-frame">
          <h3 class="popup__title ink-strong">{{ t('lage.title') }}</h3>
          <ul class="popup__lines">
            <li v-for="(l, i) in popupLines" :key="i">{{ l }}</li>
          </ul>
          <button class="crt-button crt-button--strong popup__go" @click="ready()">
            {{ t('lage.ready') }} ▸
          </button>
        </div>
      </transition>
    </section>

    <!-- COUNTDOWN (beat 3) -->
    <section v-else-if="sub === 'countdown'" class="countdown">
      <p class="countdown__label">{{ t('countdown.prefix') }} …</p>
      <div class="countdown__num" :key="countdownN">{{ countdownN }}</div>
    </section>

    <!-- THINK (beat 4, tvåfas) -->
    <section v-else-if="sub === 'think'" class="think" :class="bPhase === 1 ? 'tp1' : 'tp2'">
      <div class="think__ref" aria-hidden="true"><MediaSlot :id="referenceMedia" :autoplay="false" /></div>

      <div class="think__top">
        <p class="think__q">{{ promptText }}</p>
        <div class="think__timer" :class="{ 'think__timer--warn': warn }">{{ timeLabel }}</div>
      </div>

      <div v-if="bPhase === 2" class="think__live">
        <p class="think__transcript" :class="{ 'think__transcript--empty': !capture.transcript.value }">
          {{ capture.transcript.value || t('step.talk_motiv') }}
        </p>
      </div>

      <div class="think__foot">
        <span class="think__mic">{{ bPhase === 1 ? t('step.talk_now') : t('step.mic_active') }}</span>
        <span class="think__why">{{ t('step.why_line') }}</span>
        <span v-if="warn && !timeUp" class="think__warn">{{ t('step.warn') }}</span>
        <span v-if="timeUp" class="think__warn">{{ t('step.time_up') }}</span>
        <button class="crt-button crt-button--strong think__done" @click="finishThink()">
          {{ t('step.we_are_done') }} ▸
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

    <!-- ANALYS (latensmask) -->
    <section v-else-if="sub === 'analys'" class="analys">
      <div class="analys__media"><MediaSlot :id="referenceMedia" :autoplay="false" /></div>
      <div class="analys__strip">
        <span>{{ t('step.analyzing') }}</span>
        <span class="analys__dots"><i /><i /><i /></span>
        <button v-if="isPilot" class="analys__skip" @click="skipDwell()">hoppa över</button>
      </div>
    </section>

    <!-- REPLY (NPC-svar) -->
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

/* ---------- SITUATION ---------- */
.situation {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.situation__media {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.situation__undertext {
  text-align: center;
  font-size: 1.15rem;
  color: var(--color-ink-strong);
  margin: 0.8rem 0 0;
}
.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90%, 46ch);
  padding: 1.4rem 1.6rem;
  border-radius: var(--radius, 8px);
  background: rgba(0, 0, 0, 0.82);
  text-align: center;
}
.popup__title {
  font-family: var(--font-retro);
  letter-spacing: 0.16em;
  color: var(--color-primary);
  margin: 0 0 1rem;
}
.popup__lines {
  list-style: none;
  margin: 0 0 1.2rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.popup__lines li {
  color: var(--color-ink-strong);
  line-height: 1.4;
}
.pop-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: translate(-50%, -46%);
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
.think__top {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.think__q {
  flex: 1;
  margin: 0;
  color: var(--color-ink-strong);
}
.tp1 .think__q {
  font-size: clamp(1.5rem, 3.4vw, 2.2rem);
  line-height: 1.35;
  text-align: center;
  padding-top: 12vh;
}
.tp2 .think__q {
  font-size: 1.05rem;
  color: var(--color-primary);
}
.think__timer {
  position: relative;
  font-family: var(--font-retro);
  font-size: 1.4rem;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-dim);
  border-radius: 6px;
  padding: 0.1em 0.5em;
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
  align-items: flex-start;
}
.think__transcript {
  font-size: clamp(1.3rem, 2.6vw, 1.9rem);
  line-height: 1.5;
  color: var(--color-ink-strong);
  margin: 0;
}
.think__transcript--empty {
  color: var(--color-ink-muted);
  font-style: italic;
}
.think__foot {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.think__mic {
  font-family: var(--font-mono);
  color: var(--color-primary);
  white-space: nowrap;
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.think__why {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
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

/* ---------- ANALYS ---------- */
.analys {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.analys__media {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.analys__strip {
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

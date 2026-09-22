<script setup lang="ts">
/**
 * En stegcykel A→B→C→D för aktuellt steg; tre varv via StepShell (progress =
 * 3 steg). Latensmask: delruta C går vidare först när BÅDE eskaleringsklippets
 * golv-tid gått OCH /assess-svaret är klart.
 *
 *  A · Läge        — steg 1: lägesklipp; steg 2–3: banner "LÄGE: …".
 *  B · Tänk-högt   — prompt + talfångst (~60 s) + diegetisk mätare + 10-sek-varning.
 *  C · Analys      — eskaleringsklipp (fast längd) medan /assess körs.
 *  D · AI-svar     — strömmande NPC-svar, valfri röst, NÄSTA ▸.
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { config } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useSpeechCapture } from '@/station-kit/capture/useSpeechCapture'
import type { StepAssessment } from '@/station-kit/adapters/assess/Assess'

import { useMinnestestStore } from '../store/minnestestStore'
import StepShell from '@/station-kit/components/StepShell.vue'
import MediaSlot from './MediaSlot.vue'
import DiegeticMeter from './DiegeticMeter.vue'
import NpcReply from './NpcReply.vue'
import { media } from '../media/manifest'

const { t } = useI18n()
const store = useMinnestestStore()

type Sub = 'A' | 'B' | 'C' | 'D'
const sub = ref<Sub>('A')

const WINDOW_MS = config.stepSeconds * 1000
const WARN_MS = config.warnAtSeconds * 1000

const capture = useSpeechCapture({ windowMs: WINDOW_MS, lang: config.lang })
const manualText = ref('')

const step = computed(() => store.currentStep)
const stepKey = computed(() => step.value.key)
const isPilot = config.mode === 'pilot'

// --- Härledd copy ---
const bannerText = computed(() => t(`${stepKey.value}.banner`))
const promptText = computed(() => t(`${stepKey.value}.prompt`))
const meterLabels = computed(() => step.value.meterKeys.map((k) => t(k)))
const meterNote = computed(() => {
  const key = `${stepKey.value}.meter_note`
  const val = t(key)
  return val === key ? '' : val
})

// --- B: talfångst + fönster ---
const warned = ref(false)
const warn = computed(() => (capture.remainingMs.value ?? WINDOW_MS) <= WARN_MS)
const timeUp = computed(() => (capture.remainingMs.value ?? WINDOW_MS) <= 0)

watch(
  () => capture.remainingMs.value,
  (ms) => {
    if (sub.value !== 'B' || ms == null) return
    if (!warned.value && ms <= WARN_MS) {
      warned.value = true
      audio.play('deny')
    }
    if (ms <= 0) finishThink()
  },
)

// --- C: latensmask (klipp-golv + assess) ---
const dwellDone = ref(false)
const assessDone = ref(false)
const assessResult = ref<StepAssessment | null>(null)
let dwellTimer: ReturnType<typeof setTimeout> | null = null

// --- D: npc ---
const npcDone = ref(false)

function collectedTranscript(): string {
  return [capture.finalTranscript.value.trim(), manualText.value.trim()]
    .filter(Boolean)
    .join(' ')
    .trim()
}

// --- Övergångar mellan delrutor ---
function startThink(): void {
  warned.value = false
  manualText.value = ''
  capture.reset()
  capture.start()
  sub.value = 'B'
}

function finishThink(): void {
  if (sub.value !== 'B') return
  capture.stop()
  enterAnalys()
}

function enterAnalys(): void {
  sub.value = 'C'
  dwellDone.value = false
  assessDone.value = false
  assessResult.value = null
  const dwellMs = media(step.value.eskaleringMedia).durationMs ?? 6000
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
  if (sub.value === 'C' && dwellDone.value && assessDone.value && assessResult.value) {
    npcDone.value = false
    sub.value = 'D'
    void store.speakNpc(assessResult.value.svar_text)
  }
}

/** Dold pilot-skip på C: hoppa över klipp-golvet (väntar ändå på assess). */
function skipDwell(): void {
  if (dwellTimer) clearTimeout(dwellTimer)
  dwellDone.value = true
  maybeReveal()
}

// --- StepShell-styrning per delruta ---
const forwardKey = computed(() => {
  switch (sub.value) {
    case 'A':
      return 'common.continue'
    case 'B':
      return 'step.we_are_done'
    case 'D':
      return 'step.next'
    default:
      return 'common.next'
  }
})
const canAdvance = computed(() => {
  switch (sub.value) {
    case 'A':
      return true
    case 'B':
      return true
    case 'C':
      return false
    case 'D':
      return npcDone.value
  }
  return false
})
const showSkip = computed(() => isPilot && sub.value === 'C')

function onAdvance(): void {
  if (sub.value === 'A') startThink()
  else if (sub.value === 'B') finishThink()
  else if (sub.value === 'D') void store.nextStep()
}

// Nytt steg (stepIndex ändras) → börja om på A.
watch(
  () => store.stepIndex,
  () => {
    sub.value = 'A'
    warned.value = false
  },
)

onUnmounted(() => {
  if (dwellTimer) clearTimeout(dwellTimer)
  capture.stop()
})
</script>

<template>
  <StepShell
    :step-index="store.stepIndex"
    :step-count="3"
    :can-advance="canAdvance"
    :forward-key="forwardKey"
    :show-skip="showSkip"
    @advance="onAdvance"
    @skip="skipDwell"
  >
    <!-- A · Läge -->
    <section v-if="sub === 'A'" class="frame frame--a">
      <MediaSlot v-if="step.lagesMedia" :id="step.lagesMedia" />
      <div v-else class="frame__banner">{{ t('step.lage_label', { text: bannerText }) }}</div>
    </section>

    <!-- B · Tänk-högt -->
    <section v-else-if="sub === 'B'" class="frame frame--b">
      <p class="frame__prompt ink-strong">{{ promptText }}</p>
      <p class="frame__hint">{{ t('step.think_together') }}</p>

      <DiegeticMeter
        :labels="meterLabels"
        :note="meterNote"
        :remaining-ms="capture.remainingMs.value ?? WINDOW_MS"
        :total-ms="WINDOW_MS"
        :warn="warn"
      />

      <div class="frame__mic">
        <span class="frame__mic-dot">{{ t('step.mic_active') }}</span>
        <span v-if="warn && !timeUp" class="frame__warn">{{ t('step.warn') }}</span>
        <span v-if="timeUp" class="frame__warn">{{ t('step.time_up') }}</span>
      </div>

      <p v-if="!capture.supported" class="frame__nospeech">{{ t('step.no_speech') }}</p>
      <p v-else-if="capture.error.value" class="frame__nospeech frame__nospeech--err">
        {{ t(`step.mic_err.${capture.error.value}`) }}
      </p>
      <textarea
        v-model="manualText"
        class="frame__manual"
        :placeholder="t('step.manual_placeholder')"
        rows="2"
      />
      <p v-if="capture.transcript.value" class="frame__transcript">{{ capture.transcript.value }}</p>
    </section>

    <!-- C · Analys + eskalering -->
    <section v-else-if="sub === 'C'" class="frame frame--c">
      <div class="frame__analys">
        <span>{{ t('step.analyzing') }}</span>
        <span class="frame__dots"><i /><i /><i /></span>
      </div>
      <MediaSlot :id="step.eskaleringMedia" />
    </section>

    <!-- D · AI-svar -->
    <section v-else class="frame frame--d">
      <NpcReply
        v-if="assessResult"
        :text="assessResult.svar_text"
        :speaking="store.speaking"
        @done="npcDone = true"
      />
    </section>
  </StepShell>
</template>

<style scoped>
.frame {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}
.frame--a {
  justify-content: center;
}
.frame__banner {
  font-family: var(--font-retro);
  letter-spacing: 0.14em;
  color: var(--color-primary);
  font-size: 1.2rem;
  text-align: center;
  border: 1px solid var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  padding: 1.4rem;
}
.frame__prompt {
  font-size: 1.35rem;
  line-height: 1.45;
  margin: 0;
}
.frame__hint {
  color: var(--color-ink-muted);
  margin: 0;
}
.frame__mic {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.frame__mic-dot {
  font-family: var(--font-mono);
  color: var(--color-primary);
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.frame__warn {
  font-family: var(--font-retro);
  letter-spacing: 0.1em;
  color: var(--color-danger, #ff5a5a);
}
.frame__nospeech {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  margin: 0;
}
.frame__nospeech--err {
  color: var(--color-danger, #ff5a5a);
}
.frame__manual {
  width: 100%;
  background: #0a0a0a;
  color: var(--color-ink-strong);
  border: 1px solid var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  padding: 0.5rem;
  font-family: var(--font-mono);
  resize: vertical;
}
.frame__transcript {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
  max-height: 5rem;
  overflow: auto;
}
.frame--c {
  justify-content: center;
}
.frame__analys {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
}
.frame__dots {
  display: inline-flex;
  gap: 3px;
}
.frame__dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dot-blink 1s infinite;
}
.frame__dots i:nth-child(2) {
  animation-delay: 0.2s;
}
.frame__dots i:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes mic-pulse {
  50% {
    opacity: 0.45;
  }
}
@keyframes dot-blink {
  50% {
    opacity: 0.2;
  }
}
@media (prefers-reduced-motion: reduce) {
  .frame__mic-dot,
  .frame__dots i {
    animation: none;
  }
}
</style>

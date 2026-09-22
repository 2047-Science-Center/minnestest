<script setup lang="ts">
/**
 * En stegcykel A→B→C→D för aktuellt steg; tre varv via StepShell (progress =
 * 3 steg). UI-hierarki styr läsordningen (viktigast först), rutorna renodlade.
 *
 *  A · Läge        — steg 1: lägesklipp; steg 2–3: banner "LÄGE: …".
 *  B · Tänk-högt   — TVÅFAS: fas 1 frågan hero; fas 2 live-transkriptet hero med
 *                    frågan dockad överst + referensbilden kvar som sidopanel.
 *  C · Analys      — eskaleringsbilden dominerar (latensmask); tunn analys-strip
 *                    nederst. Denna bild blir REFERENSBILD i nästa stegs B.
 *  D · AI-svar     — svaret hero (stor teletype + ev. röst), NÄSTA ▸.
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

// --- Referensbild i tänk-högt = föregående stegs eskaleringsbild.
//     Steg 1: stegets läge-klipp (eller hem-bilden) — "var är jag". ---
const referenceMedia = computed(() => {
  const idx = store.stepIndex
  if (idx === 0) return step.value.lagesMedia ?? store.scenario.homeMedia
  return store.steps[idx - 1].eskaleringMedia
})

// --- B: tvåfas + talfångst + fönster ---
const bPhase = ref<1 | 2>(1)
const PHASE1_MS = 4500
let phaseTimer: ReturnType<typeof setTimeout> | null = null
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

// Så fort de börjar tala → gå till fas 2 (transkriptet blir hero).
watch(
  () => capture.transcript.value,
  (v) => {
    if (sub.value === 'B' && bPhase.value === 1 && v.trim()) toPhase2()
  },
)

function toPhase2(): void {
  bPhase.value = 2
  if (phaseTimer) {
    clearTimeout(phaseTimer)
    phaseTimer = null
  }
}

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
  bPhase.value = 1
  if (phaseTimer) clearTimeout(phaseTimer)
  phaseTimer = setTimeout(() => toPhase2(), PHASE1_MS)
  capture.reset()
  capture.start()
  sub.value = 'B'
}

function finishThink(): void {
  if (sub.value !== 'B') return
  if (phaseTimer) {
    clearTimeout(phaseTimer)
    phaseTimer = null
  }
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
    bPhase.value = 1
  },
)

const showManualFallback = computed(() => !capture.supported || Boolean(capture.error.value))

onUnmounted(() => {
  if (dwellTimer) clearTimeout(dwellTimer)
  if (phaseTimer) clearTimeout(phaseTimer)
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

    <!-- B · Tänk-högt (tvåfas) -->
    <section v-else-if="sub === 'B'" class="frame">
      <!-- FAS 1: frågan hero -->
      <div v-if="bPhase === 1" class="bp1">
        <div class="bp1__ref" aria-hidden="true">
          <MediaSlot :id="referenceMedia" :autoplay="false" />
        </div>
        <p class="bp1__q ink-strong">{{ promptText }}</p>
        <span class="bp1__mic">{{ t('step.talk_now') }}</span>
        <div class="bp1__meter">
          <DiegeticMeter
            :labels="meterLabels"
            :note="meterNote"
            :remaining-ms="capture.remainingMs.value ?? WINDOW_MS"
            :total-ms="WINDOW_MS"
            :warn="warn"
          />
        </div>
      </div>

      <!-- FAS 2: live-transkriptet hero, frågan dockad, referensbilden kvar -->
      <div v-else class="bp2">
        <p class="bp2__q">{{ promptText }}</p>
        <div class="bp2__body">
          <div class="bp2__ref">
            <MediaSlot :id="referenceMedia" :autoplay="false" />
          </div>
          <div class="bp2__live">
            <p class="bp2__transcript" :class="{ 'bp2__transcript--empty': !capture.transcript.value }">
              {{ capture.transcript.value || t('step.think_together') }}
            </p>
          </div>
        </div>
        <div class="bp2__foot">
          <span class="bp2__mic">{{ t('step.mic_active') }}</span>
          <DiegeticMeter
            class="bp2__meter"
            :labels="meterLabels"
            :note="meterNote"
            :remaining-ms="capture.remainingMs.value ?? WINDOW_MS"
            :total-ms="WINDOW_MS"
            :warn="warn"
          />
          <span v-if="timeUp" class="frame__warn">{{ t('step.time_up') }}</span>
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
      </div>
    </section>

    <!-- C · Analys + eskalering (bilden dominerar, strip nederst) -->
    <section v-else-if="sub === 'C'" class="frame frame--c">
      <div class="c-media">
        <MediaSlot :id="step.eskaleringMedia" />
      </div>
      <div class="c-strip">
        <span>{{ t('step.analyzing') }}</span>
        <span class="c-dots"><i /><i /><i /></span>
      </div>
    </section>

    <!-- D · AI-svar (hero) -->
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

/* ---------- B · fas 1: frågan hero ---------- */
.bp1 {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  text-align: center;
  padding-bottom: 2rem;
}
.bp1__ref {
  position: absolute;
  inset: 0;
  opacity: 0.14;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bp1__q {
  position: relative;
  font-size: clamp(1.5rem, 3.4vw, 2.2rem);
  line-height: 1.35;
  max-width: 26ch;
  margin: 0;
}
.bp1__mic {
  position: relative;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-primary);
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.bp1__meter {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

/* ---------- B · fas 2: transkriptet hero ---------- */
.bp2 {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.bp2__q {
  font-size: 1.05rem;
  line-height: 1.35;
  color: var(--color-primary);
  margin: 0;
  flex: 0 0 auto;
}
.bp2__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 1rem;
}
.bp2__ref {
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.bp2__live {
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: flex-start;
}
.bp2__transcript {
  font-size: clamp(1.2rem, 2.4vw, 1.7rem);
  line-height: 1.5;
  color: var(--color-ink-strong);
  margin: 0;
}
.bp2__transcript--empty {
  color: var(--color-ink-muted);
  font-style: italic;
}
.bp2__foot {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
}
.bp2__mic {
  font-family: var(--font-mono);
  color: var(--color-primary);
  white-space: nowrap;
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.bp2__meter {
  flex: 1;
}
@media (max-width: 760px) {
  .bp2__body {
    grid-template-columns: 1fr;
  }
}

.frame__warn {
  font-family: var(--font-retro);
  letter-spacing: 0.1em;
  color: var(--color-danger, #ff5a5a);
  white-space: nowrap;
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

/* ---------- C · analys ---------- */
.frame--c {
  justify-content: flex-start;
}
.c-media {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
}
.c-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  flex: 0 0 auto;
}
.c-dots {
  display: inline-flex;
  gap: 3px;
}
.c-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dot-blink 1s infinite;
}
.c-dots i:nth-child(2) {
  animation-delay: 0.2s;
}
.c-dots i:nth-child(3) {
  animation-delay: 0.4s;
}

/* ---------- D · AI-svar ---------- */
.frame--d {
  justify-content: center;
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
@media (prefers-reduced-motion: reduce) {
  .bp1__mic,
  .bp2__mic,
  .c-dots i {
    animation: none;
  }
  .bp1__mic,
  .bp2__mic {
    opacity: 0.75;
  }
}
</style>

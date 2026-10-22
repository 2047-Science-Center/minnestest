<script setup lang="ts">
/**
 * Slutresultat för den gatade stegen. Två lägen:
 *   mode="test" (övning, cyan) → visar poängen man fick + om tröskeln nåddes,
 *     och leder in i det skarpa ("nu på riktigt").
 *   mode="live" (skarpt, bärnsten) → NIVÅ X / 5 som hjälte + kort kommentar
 *     (+ vad som saknades om man stannade). Poängen = hur långt resonemanget bar.
 */
import { computed, onMounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useMinnestestStore } from '../store/minnestestStore'
import ThresholdMeter from './ThresholdMeter.vue'

const props = withDefaults(defineProps<{ mode?: 'test' | 'live' }>(), { mode: 'live' })
const emit = defineEmits<{ finish: [] }>()

const { t } = useI18n()
const store = useMinnestestStore()

const isTest = computed(() => props.mode === 'test')

// Live: slutresultatet (nivå nådd). Test: den enda övningsnivåns utfall.
const outcome = computed(() => store.levelOutcome)
const reached = computed(() => outcome.value?.nivaReached ?? 0)
const maxNiva = computed(() => outcome.value?.maxNiva ?? store.steps.length)
const passedAll = computed(() => outcome.value?.passedAll ?? false)
const kommentar = computed(() => outcome.value?.kommentar ?? store.currentAssessment?.kommentar ?? '')
const saknades = computed(() => outcome.value?.saknades ?? '')

// Test-läge: visa poängen + tröskeln som en lärande-beat.
const poang = computed(() => store.lastPoang)
const threshold = computed(() => store.currentThreshold)
const passed = computed(() => store.lastPassed)

const cta = computed(() => (isTest.value ? t('result.to_live') : t('result.to_checkout')))

onMounted(() => {
  if (isTest.value) {
    audio.play(passed.value ? 'positive' : 'confirm')
  } else {
    audio.play(passedAll.value ? 'win' : 'positive')
    if (kommentar.value) void store.speakNpc(kommentar.value)
  }
})
</script>

<template>
  <div class="res" :class="isTest ? 'res--test' : 'res--live'">
    <template v-if="isTest">
      <p class="res__eyebrow">{{ t('result.practice_done') }}</p>
      <p class="res__big ink-strong">{{ poang }}<span class="res__slash">/10</span></p>
      <ThresholdMeter :value="poang" :threshold="threshold" :state="passed ? 'pass' : 'fail'" />
      <p class="res__note">
        {{ passed ? t('result.practice_pass') : t('result.practice_near', { th: threshold }) }}
      </p>
      <p v-if="kommentar" class="res__kommentar">{{ kommentar }}</p>
    </template>

    <template v-else>
      <p class="res__eyebrow">{{ t('result.level_label') }}</p>
      <p class="res__hero ink-strong">
        <span class="res__num">{{ reached }}</span><span class="res__of">/ {{ maxNiva }}</span>
      </p>
      <p class="res__mark">{{ passedAll ? t('result.all_cleared') : t('result.got_to', { n: reached }) }}</p>
      <p v-if="kommentar" class="res__kommentar ink-strong">{{ kommentar }}</p>
      <p v-if="saknades" class="res__saknades">{{ t('result.missing') }}: {{ saknades }}</p>
    </template>

    <button class="crt-button crt-button--strong res__next" @click="emit('finish')">{{ cta }} ▸</button>
  </div>
</template>

<style scoped>
.res {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 1rem;
  overflow-y: auto;
}
.res__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.28em;
  font-size: 0.9rem;
  color: var(--color-ink-muted);
  margin: 0;
}
.res__big {
  font-family: var(--font-retro);
  font-size: clamp(3.5rem, 12vw, 6rem);
  line-height: 0.9;
  color: var(--color-primary);
  margin: 0;
}
.res__slash {
  font-size: 0.4em;
  color: var(--color-ink-muted);
}
.res__hero {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin: 0;
}
.res__num {
  font-family: var(--font-retro);
  font-size: clamp(5rem, 20vw, 10rem);
  line-height: 0.85;
  color: var(--color-primary);
  text-shadow: var(--glow-strong, 0 0 24px rgba(255, 176, 0, 0.6));
}
.res__of {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 7vw, 3.5rem);
  color: var(--color-ink-muted);
}
.res__mark,
.res__note {
  font-family: var(--font-retro);
  font-size: clamp(1.3rem, 3.5vw, 2rem);
  letter-spacing: 0.04em;
  color: var(--color-ink-strong);
  margin: 0;
}
.res__kommentar {
  max-width: 42ch;
  font-family: var(--font-mono);
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  line-height: 1.5;
  color: var(--color-ink-strong);
  margin: 0;
}
.res__saknades {
  max-width: 40ch;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  margin: 0;
}
.res__next {
  margin-top: 0.4rem;
}
</style>

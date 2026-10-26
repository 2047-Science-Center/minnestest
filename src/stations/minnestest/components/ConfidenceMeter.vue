<script setup lang="ts">
/**
 * FÖRTROENDEMÄTAREN — en horisontell 0–100-list med tre zoner (INGET FÖRTROENDE
 * 0–30 / TVEKSAM 30–65 / HÖGT FÖRTROENDE 65–100) och en nål som glider till
 * gruppens värde. Driven av en dold 0–10 per svar (aldrig synlig); här ser man
 * bara nålen. LED-list-vänlig så den kan speglas fysiskt sen. Emil-rörelse:
 * stark ease-out, nålen "landar".
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { METER } from '@/config'

const props = withDefaults(
  defineProps<{
    /** Gruppens värde 0–100 (animeras när det ändras). */
    value: number
    /** 'weighing' = Valdi väger (scan), 'landed' = utslaget klart, 'idle'. */
    state?: 'idle' | 'weighing' | 'landed'
  }>(),
  { state: 'idle' },
)

const { t } = useI18n()

const LOSE = METER.loseAt
const HIGH = METER.highAt
const pct = computed(() => Math.max(0, Math.min(100, props.value)))
const zoneClass = computed(() =>
  pct.value <= LOSE ? 'is-lose' : pct.value >= HIGH ? 'is-hog' : 'is-tveksam',
)
</script>

<template>
  <div class="cmeter" :class="[zoneClass, `cmeter--${state}`]">
    <div class="cmeter__track">
      <!-- Tre zoner -->
      <div class="cmeter__zone cmeter__zone--lose" :style="{ width: LOSE + '%' }" />
      <div class="cmeter__zone cmeter__zone--tveksam" :style="{ left: LOSE + '%', width: HIGH - LOSE + '%' }" />
      <div class="cmeter__zone cmeter__zone--hog" :style="{ left: HIGH + '%', width: 100 - HIGH + '%' }" />
      <!-- Scan medan Valdi väger -->
      <div v-if="state === 'weighing'" class="cmeter__scan" />
      <!-- Nål -->
      <div class="cmeter__needle" :style="{ left: pct + '%' }">
        <span class="cmeter__dot" />
      </div>
    </div>
    <div class="cmeter__labels">
      <span class="cmeter__label cmeter__label--lose">{{ t('meter.lose') }}</span>
      <span class="cmeter__label cmeter__label--tveksam">{{ t('meter.tveksam') }}</span>
      <span class="cmeter__label cmeter__label--hog">{{ t('meter.hog') }}</span>
    </div>
  </div>
</template>

<style scoped>
.cmeter {
  width: min(94%, 60ch);
  margin: 0 auto;
}
.cmeter__track {
  position: relative;
  height: 2.6rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.cmeter__zone {
  position: absolute;
  top: 0;
  bottom: 0;
}
.cmeter__zone--lose {
  left: 0;
  background: linear-gradient(90deg, rgba(255, 90, 60, 0.3), rgba(255, 90, 60, 0.12));
}
.cmeter__zone--tveksam {
  background: rgba(255, 207, 58, 0.12);
}
.cmeter__zone--hog {
  background: linear-gradient(90deg, rgba(122, 209, 79, 0.12), rgba(122, 209, 79, 0.32));
}
.cmeter__scan {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
  animation: cm-scan 1.1s ease-in-out infinite;
}
@keyframes cm-scan {
  0% {
    left: -16%;
  }
  100% {
    left: 100%;
  }
}
.cmeter__needle {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 0;
  z-index: 3;
  border-left: 3px solid var(--color-ink-strong);
  box-shadow: 0 0 10px rgba(245, 245, 240, 0.6);
  transform: translateX(-1.5px);
  /* Emil: stark ease-out, nålen landar. */
  transition: left 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.cmeter__dot {
  position: absolute;
  top: -0.55rem;
  left: 50%;
  width: 0.8rem;
  height: 0.8rem;
  transform: translateX(-50%) rotate(45deg);
  background: var(--color-ink-strong);
  box-shadow: 0 0 10px rgba(245, 245, 240, 0.7);
}
.cmeter--landed.is-lose .cmeter__needle,
.cmeter--landed.is-lose .cmeter__dot {
  border-color: var(--color-danger, #ff5a3c);
  background: var(--color-danger, #ff5a3c);
  color: var(--color-danger, #ff5a3c);
}
.cmeter--landed.is-hog .cmeter__needle,
.cmeter--landed.is-hog .cmeter__dot {
  border-color: var(--color-lag2, #7ad14f);
  background: var(--color-lag2, #7ad14f);
}
.cmeter__labels {
  display: flex;
  margin-top: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}
.cmeter__label {
  text-align: center;
}
.cmeter__label--lose {
  width: 30%;
}
.cmeter__label--tveksam {
  width: 35%;
}
.cmeter__label--hog {
  width: 35%;
}
@media (prefers-reduced-motion: reduce) {
  .cmeter__scan {
    animation: none;
  }
  .cmeter__needle {
    transition: none;
  }
}
</style>

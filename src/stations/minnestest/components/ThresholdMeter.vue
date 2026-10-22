<script setup lang="ts">
/**
 * Gate-mätaren: en horisontell LED-list 0–10 med en MARKERAD tröskel. Efter att
 * "enheten vägt" animeras ifyllnaden upp mot poängen och man SER om den passerar
 * tröskeln. Byggd segment-vänligt (10 celler) så den kan speglas på en fysisk
 * LED-list sen. Emil-rörelse: ease-out, ingen scale(0).
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Poäng 0–10 (animeras när state blir pass/fail). */
    value: number
    /** Tröskel 0–10 (markören man måste nå över). */
    threshold: number
    /** 'charging' = enheten väger (pulsar), 'pass'/'fail' = resolve, 'idle'. */
    state?: 'idle' | 'charging' | 'pass' | 'fail'
  }>(),
  { state: 'idle' },
)

const MAX = 10
const cells = Array.from({ length: MAX }, (_, i) => i + 1)
const fillPct = computed(() => (props.state === 'charging' ? 0 : Math.max(0, Math.min(MAX, props.value)) * 10))
const threshPct = computed(() => Math.max(0, Math.min(MAX, props.threshold)) * 10)
const accent = computed(() =>
  props.state === 'pass' ? 'var(--color-lag2, #7ad14f)' : props.state === 'fail' ? 'var(--color-danger, #ff5a3c)' : 'var(--mode-accent, var(--color-primary))',
)
function cellLit(i: number): boolean {
  if (props.state === 'charging') return false
  return i <= Math.round(props.value)
}
</script>

<template>
  <div class="meter" :class="`meter--${state}`" :style="{ '--acc': accent }">
    <div class="meter__track">
      <!-- LED-celler -->
      <div class="meter__cells">
        <span v-for="i in cells" :key="i" class="meter__cell" :class="{ 'is-lit': cellLit(i) }" />
      </div>
      <!-- Mjuk ifyllnad ovanpå (animeras mot poängen) -->
      <div class="meter__fill" :class="{ 'is-charging': state === 'charging' }" :style="{ width: fillPct + '%' }" />
      <!-- Tröskelmarkör -->
      <div class="meter__thresh" :style="{ left: threshPct + '%' }">
        <span class="meter__flag">{{ threshold }}</span>
      </div>
    </div>
    <div class="meter__scale">
      <span>0</span><span>5</span><span>10</span>
    </div>
  </div>
</template>

<style scoped>
.meter {
  width: min(92%, 52ch);
  margin: 0 auto;
}
.meter__track {
  position: relative;
  height: 2.4rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
.meter__cells {
  position: absolute;
  inset: 3px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  z-index: 1;
}
.meter__cell {
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.18s ease-out, box-shadow 0.18s ease-out;
}
.meter__cell.is-lit {
  background: color-mix(in srgb, var(--acc) 55%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--acc) 50%, transparent);
}
.meter__fill {
  position: absolute;
  inset: 3px auto 3px 3px;
  z-index: 2;
  border-radius: 4px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--acc) 30%, transparent), var(--acc));
  box-shadow: 0 0 14px color-mix(in srgb, var(--acc) 55%, transparent);
  /* Emil: stark ease-out, poängen "landar". */
  transition: width 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}
.meter__fill.is-charging {
  animation: meter-charge 1s ease-in-out infinite;
  width: 18% !important;
  opacity: 0.6;
}
@keyframes meter-charge {
  0%,
  100% {
    transform: translateX(-6%);
    opacity: 0.35;
  }
  50% {
    transform: translateX(260%);
    opacity: 0.7;
  }
}
.meter__thresh {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 0;
  z-index: 3;
  border-left: 2px dashed var(--color-ink-strong);
  transform: translateX(-1px);
}
.meter__flag {
  position: absolute;
  top: -1.25rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-retro);
  font-size: 0.95rem;
  color: var(--color-ink-strong);
  background: rgba(0, 0, 0, 0.7);
  padding: 0 0.3em;
  border-radius: 3px;
}
.meter__scale {
  display: flex;
  justify-content: space-between;
  margin-top: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-muted);
}
@media (prefers-reduced-motion: reduce) {
  .meter__fill.is-charging {
    animation: none;
  }
}
</style>

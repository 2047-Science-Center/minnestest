<script setup lang="ts">
/**
 * Diegetisk tidspress: en full-bredds mätare som töms över fönstret med sitt
 * BERÄTTELSE-namn (DAGSLJUS, MOBIL 15%, TILL NÄSTA NATT) — ingen naken klocka.
 * Presentationslös: föräldern (StepCycle) äger klockan (samma som talfångstens
 * fönster) och matar remainingMs/totalMs. Respekterar prefers-reduced-motion.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    labels: string[]
    note?: string
    remainingMs: number
    totalMs: number
    /** ≤ varningsgränsen → blinkar. */
    warn?: boolean
  }>(),
  { note: '', warn: false },
)

const fraction = computed(() => {
  if (props.totalMs <= 0) return 0
  return Math.max(0, Math.min(1, props.remainingMs / props.totalMs))
})

const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
</script>

<template>
  <div class="meter" :class="{ 'meter--warn': warn }">
    <div class="meter__head">
      <span v-for="(l, i) in labels" :key="i" class="meter__label">{{ l }}</span>
      <span v-if="note" class="meter__note">{{ note }}</span>
    </div>
    <div class="meter__track" role="progressbar" :aria-valuenow="Math.round(fraction * 100)">
      <div
        class="meter__fill"
        :class="{ 'meter__fill--smooth': !reduced }"
        :style="{ width: fraction * 100 + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.meter {
  width: 100%;
}
.meter__head {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.meter__label {
  font-family: var(--font-retro);
  letter-spacing: 0.12em;
  color: var(--color-primary);
  font-size: 0.95rem;
}
.meter__note {
  margin-left: auto;
  color: var(--color-ink-muted);
  font-size: 0.8rem;
}
.meter__track {
  width: 100%;
  height: 0.8rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 6px;
  overflow: hidden;
  background: #0a0a0a;
}
.meter__fill {
  height: 100%;
  background: var(--color-primary);
  box-shadow: var(--glow-soft, 0 0 8px currentColor);
}
.meter__fill--smooth {
  transition: width 0.12s linear;
}
.meter--warn .meter__label,
.meter--warn .meter__note {
  color: var(--color-danger, #ff5a5a);
}
.meter--warn .meter__fill {
  background: var(--color-danger, #ff5a5a);
  animation: meter-blink 0.5s steps(2, start) infinite;
}
@keyframes meter-blink {
  50% {
    opacity: 0.35;
  }
}
@media (prefers-reduced-motion: reduce) {
  .meter--warn .meter__fill {
    animation: none;
  }
}
</style>

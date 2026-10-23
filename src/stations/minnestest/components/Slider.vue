<script setup lang="ts">
/**
 * Touch-vänlig slider för Fermi-gissningen (ersätter sifferväljaren). Stort
 * värde-readout + enhet, stor greppyta. Startar på min (0) enligt config.
 */
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  step: number
  min: number
  max: number
  unit?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()

const pct = computed(() => {
  const span = props.max - props.min || 1
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100))
})
const display = computed(() => Math.round(props.modelValue).toLocaleString('sv-SE'))

function onInput(e: Event): void {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="slider">
    <div class="slider__readout">
      <span class="slider__value ink-strong">{{ display }}</span>
      <span v-if="unit" class="slider__unit">{{ unit }}</span>
    </div>
    <input
      class="slider__range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :style="{ '--pct': pct + '%' }"
      @input="onInput"
    />
    <div class="slider__ends">
      <span>{{ min.toLocaleString('sv-SE') }}</span>
      <span>{{ max.toLocaleString('sv-SE') }}</span>
    </div>
  </div>
</template>

<style scoped>
.slider {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.slider__readout {
  text-align: center;
}
.slider__value {
  font-family: var(--font-retro);
  font-size: clamp(2.6rem, 8vw, 4.2rem);
  line-height: 1;
  color: var(--color-primary);
  text-shadow: var(--glow-soft);
}
.slider__unit {
  font-family: var(--font-mono);
  color: var(--color-ink-muted);
  margin-left: 0.45em;
  font-size: 1.2rem;
  letter-spacing: 0.04em;
}
.slider__range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    var(--color-primary) var(--pct),
    rgba(255, 255, 255, 0.12) var(--pct)
  );
  border: 1px solid var(--color-primary-dim);
}
.slider__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-ink-strong);
  border: 3px solid var(--color-primary);
  box-shadow: var(--glow-soft);
  cursor: grab;
}
.slider__range::-moz-range-thumb {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-ink-strong);
  border: 3px solid var(--color-primary);
  box-shadow: var(--glow-soft);
  cursor: grab;
}
.slider__ends {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  color: var(--color-ink-muted);
  font-size: 0.85rem;
}
</style>

<script setup lang="ts">
/**
 * Touch-vänlig sifferväljare för Fermi-gissningen: stora −/+ -knappar i stället
 * för tangentbord. Ett tryck ändrar med `step`; håller man in knappen bläddrar
 * den och ACCELERERAR (så man når 300 000 utan hundratals tryck). Skalan (step/
 * min/max/start) sätts per steg i config → olika för kg, antal och ton.
 */
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: number
  step: number
  min: number
  max: number
  unit: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const val = ref(clamp(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    if (v !== val.value) val.value = clamp(v)
  },
)

function clamp(v: number): number {
  return Math.min(props.max, Math.max(props.min, Math.round(v)))
}

// Svensk tusentalsavgränsning (1 700 / 300 000).
const fmt = (v: number): string => v.toLocaleString('sv-SE')

function apply(dir: 1 | -1, accel = 1): void {
  const next = clamp(val.value + dir * props.step * accel)
  if (next !== val.value) {
    val.value = next
    emit('update:modelValue', next)
  }
  return
}

// --- Håll-in: bläddra med accelererande fart ---
let holdTimer: ReturnType<typeof setTimeout> | null = null
let ticks = 0

// Hur mycket farten växer ju längre man håller (multipel av step).
function accelFor(t: number): number {
  if (t < 6) return 1
  if (t < 14) return 2
  if (t < 22) return 5
  if (t < 30) return 10
  if (t < 40) return 25
  return 50
}

function stopHold(): void {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  ticks = 0
}

function startHold(dir: 1 | -1): void {
  stopHold()
  apply(dir) // första trycket direkt
  const first = 350 // paus innan bläddring startar
  const repeat = 90 // intervall vid bläddring
  const tick = (): void => {
    ticks += 1
    apply(dir, accelFor(ticks))
    // Stanna om vi nått gränsen.
    const atBound = (dir === 1 && val.value >= props.max) || (dir === -1 && val.value <= props.min)
    if (!atBound) holdTimer = setTimeout(tick, repeat)
    else stopHold()
  }
  holdTimer = setTimeout(tick, first)
}

onUnmounted(stopHold)
</script>

<template>
  <div class="stepper">
    <button
      type="button"
      class="stepper__btn"
      aria-label="Minska"
      @pointerdown.prevent="startHold(-1)"
      @pointerup="stopHold"
      @pointerleave="stopHold"
      @pointercancel="stopHold"
    >
      −
    </button>

    <div class="stepper__readout">
      <span class="stepper__value ink-strong">{{ fmt(val) }}</span>
      <span class="stepper__unit">{{ unit }}</span>
    </div>

    <button
      type="button"
      class="stepper__btn"
      aria-label="Öka"
      @pointerdown.prevent="startHold(1)"
      @pointerup="stopHold"
      @pointerleave="stopHold"
      @pointercancel="stopHold"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
}
.stepper__btn {
  flex: 0 0 auto;
  min-width: 4.2rem;
  min-height: 4.2rem;
  font-family: var(--font-retro);
  font-size: 3rem;
  line-height: 1;
  color: var(--color-ink-strong);
  background: var(--color-background-2);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius, 12px);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  box-shadow: var(--glow-soft);
  transition: background 0.1s ease, transform 0.05s ease;
}
.stepper__btn:hover {
  background: rgba(255, 149, 0, 0.14);
}
.stepper__btn:active {
  transform: scale(0.94);
  background: rgba(255, 149, 0, 0.22);
}
.stepper__readout {
  flex: 1 1 auto;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.4rem;
  min-width: 8ch;
  padding: 0 0.6rem;
}
.stepper__value {
  font-family: var(--font-retro);
  font-size: clamp(2.4rem, 7vw, 3.6rem);
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
  letter-spacing: 0.02em;
}
.stepper__unit {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  white-space: nowrap;
}
</style>

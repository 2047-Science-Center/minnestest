<script setup lang="ts">
/**
 * Valv-övergång (ruta 4 / ruta 16): svart, centrerad Teletype rad för rad,
 * scanline-glitch. `hold` håller kvar sista raden (t.ex. medan final-compose
 * körs) tills den släpps — då emit:as `done`.
 */
import { ref, watch } from 'vue'
import Teletype from '@/station-kit/components/Teletype.vue'

const props = withDefaults(defineProps<{ lines: string[]; hold?: boolean }>(), {
  hold: false,
})
const emit = defineEmits<{ done: [] }>()

const visible = ref(1)
const allDone = ref(false)
let finished = false

function lineDone(i: number): void {
  if (i < props.lines.length - 1) {
    setTimeout(() => (visible.value = i + 2), 400)
  } else {
    allDone.value = true
    maybeFinish()
  }
}

function maybeFinish(): void {
  if (finished || !allDone.value || props.hold) return
  finished = true
  setTimeout(() => emit('done'), 650)
}

watch(
  () => props.hold,
  () => maybeFinish(),
)
</script>

<template>
  <div class="vault crt-scanlines">
    <div class="vault__lines">
      <Teletype
        v-for="(line, i) in lines.slice(0, visible)"
        :key="i"
        class="vault__line"
        :text="line"
        :speed="30"
        @done="lineDone(i)"
      />
    </div>
    <div class="vault__glitch" aria-hidden="true" />
  </div>
</template>

<style scoped>
.vault {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
.vault__lines {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;
  z-index: 1;
}
.vault__line {
  font-family: var(--font-retro);
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  color: var(--color-primary);
}
.vault__glitch {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(255, 176, 0, 0.04) 4px
  );
  animation: vault-roll 6s linear infinite;
}
@keyframes vault-roll {
  from {
    background-position-y: 0;
  }
  to {
    background-position-y: 100px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .vault__glitch {
    animation: none;
  }
}
</style>

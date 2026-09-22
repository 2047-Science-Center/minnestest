<script setup lang="ts">
/**
 * Slutpoängens stigande skala 1–10 (innehållsspec §4 ruta 17). Animeras uppåt
 * från 0 mot slutvärdet; namngivna markeringar tänds en efter en med retro-blip
 * (AudioEngine), stapeln decelererar nära slutvärdet, landar med flash + fanfar
 * och emit:ar `landed`. prefers-reduced-motion → slutvärde + tända markeringar
 * direkt, ingen klätteranimation.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useI18n } from '@/station-kit/i18n'
import { SCALE_MARKS } from '@/config'

const props = defineProps<{ poang: number }>()
const emit = defineEmits<{ landed: [] }>()
const { t } = useI18n()

const marks = SCALE_MARKS.map((m) => ({ ...m, label: t(m.key) }))
const value = ref(0)
const lit = ref<Set<number>>(new Set())
const landed = ref(false)

let raf = 0
const DURATION = 2600

const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function litFor(v: number): void {
  for (let i = 0; i < marks.length; i++) {
    if (v >= marks[i].min && !lit.value.has(i)) {
      lit.value.add(i)
      lit.value = new Set(lit.value)
      audio.play('hatch')
    }
  }
}

function land(): void {
  landed.value = true
  audio.play('win')
  emit('landed')
}

onMounted(() => {
  const target = Math.max(1, Math.min(10, props.poang))
  if (reduced) {
    value.value = target
    litFor(target)
    land()
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / DURATION)
    // easeOutCubic → deceleration nära slutvärdet.
    const eased = 1 - Math.pow(1 - p, 3)
    value.value = eased * target
    litFor(value.value)
    if (p < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      value.value = target
      litFor(target)
      land()
    }
  }
  raf = requestAnimationFrame(tick)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="scale" :class="{ 'scale--landed': landed }">
    <div class="scale__track">
      <div class="scale__fill" :style="{ width: (value / 10) * 100 + '%' }" />
      <span class="scale__value" :style="{ left: (value / 10) * 100 + '%' }">
        {{ Math.round(value) }}
      </span>
    </div>
    <ol class="scale__marks">
      <li
        v-for="(m, i) in marks"
        :key="i"
        class="scale__mark"
        :class="{ 'scale__mark--lit': lit.has(i) }"
        :style="{ left: ((m.max / 10) * 100) + '%' }"
      >
        <span class="scale__dot" />
        <span class="scale__label">{{ m.label }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.scale {
  width: 100%;
  padding-top: 0.5rem;
}
.scale__track {
  position: relative;
  height: 1.1rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: 8px;
  background: #0a0a0a;
  overflow: visible;
}
.scale__fill {
  height: 100%;
  background: var(--color-primary);
  box-shadow: var(--glow-soft, 0 0 10px currentColor);
  border-radius: 8px 0 0 8px;
}
.scale--landed .scale__fill {
  animation: scale-flash 0.5s ease-out;
}
@keyframes scale-flash {
  0% {
    filter: brightness(2.4);
  }
  100% {
    filter: brightness(1);
  }
}
.scale__value {
  position: absolute;
  top: -1.6rem;
  transform: translateX(-50%);
  font-family: var(--font-retro);
  font-size: 1.2rem;
  color: var(--color-primary);
}
.scale__marks {
  position: relative;
  list-style: none;
  margin: 0.6rem 0 0;
  padding: 0;
  height: 4.5rem;
}
.scale__mark {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  width: 8rem;
  text-align: center;
  opacity: 0.35;
  transition: opacity 0.25s ease;
}
.scale__mark--lit {
  opacity: 1;
}
.scale__dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  border: 1px solid var(--color-primary-dim);
  background: transparent;
}
.scale__mark--lit .scale__dot {
  background: var(--color-primary);
  box-shadow: var(--glow-soft, 0 0 8px currentColor);
}
.scale__label {
  font-size: 0.78rem;
  line-height: 1.15;
  color: var(--color-ink-strong);
}
@media (prefers-reduced-motion: reduce) {
  .scale--landed .scale__fill {
    animation: none;
  }
  .scale__mark {
    transition: none;
  }
}
</style>

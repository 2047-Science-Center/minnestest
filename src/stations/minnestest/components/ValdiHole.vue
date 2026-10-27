<script setup lang="ts">
/**
 * VALDI-HÅLET — lögndetektorns reveal/interaktions-visual. Spelar de riktiga
 * polygraf-pult-klippen (LED-ringen inne i hålet):
 *   pulse / overvager / idle → valdi_pulse (ringen andas grönt, loop)
 *   granted                  → valdi_gron  (ringen solid grön, loop)
 *   deactivate               → valdi_vit   (ringen blinkar vitt → släcks, en gång)
 *   denied                   → valdi_pulse + röd färgskiftning (ringen röd)
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset } from '@/config'

const props = defineProps<{
  state: 'idle' | 'pulse' | 'overvager' | 'granted' | 'deactivate' | 'denied' | 'talking'
  accent: string
  accentRgb: string
}>()

const { t } = useI18n()

const src = computed(() => {
  switch (props.state) {
    case 'granted':
      return asset('video/valdi_gron.mp4')
    case 'deactivate':
      return asset('video/valdi_vit.mp4')
    case 'denied':
      return asset('video/valdi_rod.mp4')
    case 'talking':
      return asset('video/valdi_talar.mp4') // ringen still, oscilloskopet rör sig
    default:
      return asset('video/valdi_pulse.mp4') // pulse / overvager / idle (amber vilo)
  }
})
const loop = computed(() => props.state !== 'deactivate')
</script>

<template>
  <div class="hole" :class="`hole--${state}`" :style="{ '--acc': accent, '--acc-rgb': accentRgb }">
    <video
      :key="src"
      class="hole__video"
      :src="src"
      autoplay
      :loop="loop"
      muted
      playsinline
    />
    <div class="hole__tint" aria-hidden="true" />

    <div class="hole__overlay">
      <p v-if="state === 'overvager'" class="hole__status hole__status--work">
        {{ t('door.overvager') }}<span class="hole__ell"><i>.</i><i>.</i><i>.</i></span>
      </p>
      <p v-else-if="state === 'granted'" class="hole__status hole__status--granted">
        {{ t('hole.granted') }}
      </p>
      <p v-else-if="state === 'denied'" class="hole__status hole__status--denied">
        {{ t('hole.denied') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.hole {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-background);
}
.hole__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Nekad: eget rött klipp (valdi_rod) — ingen färgskiftning behövs. */
.hole__tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%);
}
.hole__overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 3%;
  pointer-events: none;
}
.hole__status {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5.5vw, 3rem);
  letter-spacing: 0.08em;
  margin: 0;
  text-align: center;
  padding: 0.3em 0.7em;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}
.hole__status--work {
  color: var(--acc);
  text-shadow: 0 0 18px rgba(var(--acc-rgb), 0.7);
  animation: hole-workpulse 1.5s ease-in-out infinite;
}
.hole__status--granted {
  color: var(--color-lag2, #7ad14f);
  text-shadow: 0 0 22px rgba(122, 209, 79, 0.8);
  animation: hole-pop 0.5s var(--ease-out, ease-out) both;
}
.hole__status--denied {
  color: var(--color-danger, #ff5a3c);
  text-shadow: 0 0 22px rgba(255, 90, 60, 0.8);
  animation: hole-pop 0.5s var(--ease-out, ease-out) both;
}
.hole__ell {
  display: inline-flex;
}
.hole__ell i {
  animation: hole-ell 1.2s infinite;
}
.hole__ell i:nth-child(2) {
  animation-delay: 0.2s;
}
.hole__ell i:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes hole-workpulse {
  50% {
    opacity: 0.55;
  }
}
@keyframes hole-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes hole-ell {
  50% {
    opacity: 0.2;
  }
}
@keyframes hole-deny {
  50% {
    opacity: 0.55;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hole__status--work,
  .hole__ell i,
  .hole--denied .hole__video {
    animation: none;
  }
}
</style>

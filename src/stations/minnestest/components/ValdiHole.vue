<script setup lang="ts">
/**
 * VALDI-HÅLET — lögndetektorns reveal/interaktions-visual. Ett hand-hål med en
 * ring som speglar en riktig LED-ring (rena primitiv: solid färg, puls, grön/röd).
 *   idle      — vilande (svag ring).
 *   pulse     — aktiv under taltiden (ringen andas grönt).
 *   overvager — "VALDI ÖVERVÄGER" (ringen scannar i accentfärg).
 *   granted   — grön, Valdi släpper in (klarade lögnen).
 *   denied    — röd, Valdi köpte det inte.
 *
 * CSS-platshållare tills den riktiga polygraf-pulten + klippen genereras — då
 * droppas de in via filnamn (valdi_base.jpg + valdi_activate/pulse/deactivate.mp4).
 */
import { useI18n } from '@/station-kit/i18n'

defineProps<{
  state: 'idle' | 'pulse' | 'overvager' | 'granted' | 'denied'
  accent: string
  accentRgb: string
}>()

const { t } = useI18n()
const GREEN = '122, 209, 79'
const RED = '255, 90, 60'
</script>

<template>
  <div
    class="hole"
    :class="`hole--${state}`"
    :style="{ '--acc': accent, '--acc-rgb': accentRgb, '--green': GREEN, '--red': RED }"
  >
    <div class="hole__ambient" aria-hidden="true" />

    <!-- Pulten / konsolen -->
    <div class="hole__desk" aria-hidden="true">
      <!-- Hand-hålet + ringen -->
      <div class="hole__port">
        <span class="hole__ring hole__ring--outer" />
        <span class="hole__ring hole__ring--inner" />
        <span class="hole__bore" />
        <span v-if="state === 'overvager'" class="hole__scan" />
      </div>
      <p class="hole__label">LÖGNDETEKTOR</p>
    </div>

    <!-- Overlay-texter -->
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
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}
.hole__ambient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(var(--acc-rgb), 0.16), rgba(0, 0, 0, 0.9) 72%);
}
.hole--pulse .hole__ambient {
  background: radial-gradient(ellipse at center, rgba(var(--green), 0.14), rgba(0, 0, 0, 0.9) 72%);
}
.hole--granted .hole__ambient {
  background: radial-gradient(ellipse at center, rgba(var(--green), 0.28), rgba(0, 0, 0, 0.88) 70%);
}
.hole--denied .hole__ambient {
  background: radial-gradient(ellipse at center, rgba(var(--red), 0.26), rgba(0, 0, 0, 0.9) 70%);
  animation: hole-deny 0.6s steps(2) 3;
}
.hole__desk {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2.2rem 3rem 1.4rem;
  border-radius: 14px;
  background: linear-gradient(180deg, #1a1d20, #0c0e10);
  border: 1px solid rgba(var(--acc-rgb), 0.3);
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.8), 0 10px 40px rgba(0, 0, 0, 0.6);
}
.hole__port {
  position: relative;
  width: clamp(7rem, 22vw, 12rem);
  height: clamp(7rem, 22vw, 12rem);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hole__bore {
  position: absolute;
  inset: 26%;
  border-radius: 50%;
  background: radial-gradient(circle at center, #000 55%, #0a0a0a 100%);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.95);
}
.hole__ring {
  position: absolute;
  border-radius: 50%;
}
.hole__ring--outer {
  inset: 0;
  border: 4px solid var(--ring, rgba(var(--acc-rgb), 0.35));
  box-shadow: 0 0 20px var(--glow, rgba(var(--acc-rgb), 0.25));
}
.hole__ring--inner {
  inset: 13%;
  border: 2px solid var(--ring, rgba(var(--acc-rgb), 0.4));
  opacity: 0.8;
}
/* --- Tillstånd: ringfärg (LED-primitiv) --- */
.hole--idle {
  --ring: rgba(var(--acc-rgb), 0.3);
  --glow: rgba(var(--acc-rgb), 0.18);
}
.hole--pulse {
  --ring: rgba(var(--green), 0.9);
  --glow: rgba(var(--green), 0.6);
}
.hole--pulse .hole__ring {
  animation: hole-breathe 1.6s ease-in-out infinite;
}
.hole--overvager {
  --ring: var(--acc);
  --glow: rgba(var(--acc-rgb), 0.6);
}
.hole--granted {
  --ring: rgba(var(--green), 1);
  --glow: rgba(var(--green), 0.8);
}
.hole--granted .hole__ring {
  animation: hole-breathe 1.4s ease-in-out infinite;
}
.hole--denied {
  --ring: rgba(var(--red), 1);
  --glow: rgba(var(--red), 0.8);
}
.hole--denied .hole__ring {
  animation: hole-blink 0.4s steps(2) infinite;
}
.hole__scan {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border-top: 4px solid #fff;
  opacity: 0.8;
  animation: hole-spin 1s linear infinite;
}
.hole__label {
  font-family: var(--font-mono);
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: var(--acc);
  margin: 0;
}
.hole__overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8%;
  pointer-events: none;
}
.hole__status {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5.5vw, 3rem);
  letter-spacing: 0.08em;
  margin: 0;
  text-align: center;
  padding: 0.3em 0.7em;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 10px;
}
.hole__status--work {
  color: var(--acc);
  text-shadow: 0 0 18px rgba(var(--acc-rgb), 0.7);
  animation: hole-workpulse 1.5s ease-in-out infinite;
}
.hole__status--granted {
  color: rgb(var(--green));
  text-shadow: 0 0 22px rgba(var(--green), 0.8);
  animation: hole-pop 0.5s var(--ease-out, ease-out) both;
}
.hole__status--denied {
  color: rgb(var(--red));
  text-shadow: 0 0 22px rgba(var(--red), 0.8);
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
@keyframes hole-breathe {
  50% {
    opacity: 0.45;
  }
}
@keyframes hole-blink {
  50% {
    opacity: 0.3;
  }
}
@keyframes hole-spin {
  to {
    transform: rotate(360deg);
  }
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
    opacity: 0.4;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hole__ring,
  .hole__scan,
  .hole__status--work,
  .hole__ell i,
  .hole--denied .hole__ambient {
    animation: none;
  }
}
</style>

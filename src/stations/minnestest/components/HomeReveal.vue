<script setup lang="ts">
/**
 * Hem- & resurs-reveal (ruta 6): genomskärning av hemmet + pulsande
 * etikett-markörer för resurserna. De etiketterade resurserna = exakt vad AI:n
 * får veta finns (skickas som `resources` till /assess). Markörerna ligger
 * OVANPÅ bilden (utbytbara, inte inbakade).
 */
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'
import MediaSlot from './MediaSlot.vue'

const { t } = useI18n()
const store = useMinnestestStore()
</script>

<template>
  <div class="home">
    <div class="home__stage">
      <MediaSlot :id="store.scenario.homeMedia" />
      <ul class="home__markers">
        <li v-for="r in store.scenario.resources" :key="r" class="home__marker">
          {{ t(`resurs.${r}`) }}
        </li>
      </ul>
    </div>
    <div class="home__foot">
      <p class="home__title ink-strong">{{ t('home.title') }}</p>
      <p class="home__sub">{{ t('home.sub') }}</p>
      <button class="crt-button crt-button--strong" @click="store.homeRevealDone()">
        {{ t('home.begin') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.home__stage {
  position: relative;
  flex: 1;
  min-height: 0;
  /* Klipp ev. överflöd så scenen aldrig ritar över foten (BÖRJA-knappen). */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.home__markers {
  position: absolute;
  inset: auto 0 0.6rem 0;
  list-style: none;
  margin: 0;
  padding: 0 0.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.home__marker {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  padding: 0.15em 0.7em;
  background: rgba(0, 0, 0, 0.55);
  animation: marker-pulse 2.2s ease-in-out infinite;
}
@keyframes marker-pulse {
  50% {
    box-shadow: var(--glow-soft, 0 0 10px rgba(255, 176, 0, 0.6));
  }
}
.home__foot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}
.home__title {
  font-size: 1.15rem;
  margin: 0;
}
.home__sub {
  color: var(--color-ink-muted);
  margin: 0;
}
@media (prefers-reduced-motion: reduce) {
  .home__marker {
    animation: none;
  }
}
</style>

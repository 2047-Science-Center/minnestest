<script setup lang="ts">
/**
 * Titelskärm: MÄNNISKOTESTET + STARTA, med en loopande attract-video i
 * bakgrunden (video/mt-attract.mp4 om den finns; annars mörk botten). STARTA →
 * story-introt (cybersäkerhet/Valvet).
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset } from '@/config'
import { useMinnestestStore } from '../store/minnestestStore'

const emit = defineEmits<{ start: [] }>()
const { t } = useI18n()
const store = useMinnestestStore()
const videoSrc = asset('video/valv_intro_loop.mp4')
const isLd = computed(() => store.game === 'logndetektor')
const title = computed(() => (isLd.value ? t('ld.title') : t('branch.title')))
const sub = computed(() => (isLd.value ? t('ld.sub') : t('branch.sub')))
</script>

<template>
  <div class="branch">
    <video
      :key="videoSrc"
      class="branch__bg"
      :src="videoSrc"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    />
    <div class="branch__scrim" aria-hidden="true" />
    <div class="branch__inner">
      <p class="branch__eyebrow">{{ t('app.subtitle') }}</p>
      <h1 class="branch__title ink-strong">{{ title }}</h1>
      <p class="branch__sub">{{ sub }}</p>
      <button class="crt-button crt-button--strong branch__start" @click="emit('start')">
        {{ t('branch.start') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.branch {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.branch__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.branch__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.5) 55%,
    rgba(0, 0, 0, 0.82) 100%
  );
}
.branch__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 1.5rem;
}
.branch__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.3em;
  color: var(--color-ink-muted);
  margin: 0;
  animation: branch-in 0.5s var(--ease-out, ease-out) both;
}
.branch__title {
  font-family: var(--font-retro);
  font-size: clamp(2.6rem, 9vw, 6rem);
  line-height: 1;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  text-shadow: var(--glow-soft), 0 2px 20px rgba(0, 0, 0, 0.85);
  margin: 0;
  animation: branch-in 0.6s var(--ease-out, ease-out) 0.1s both;
}
.branch__sub {
  color: var(--color-ink-strong);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2.4vw, 1.3rem);
  max-width: 40ch;
  margin: 0;
  animation: branch-in 0.5s var(--ease-out, ease-out) 0.25s both;
}
.branch__start {
  font-size: 1.6rem;
  padding: 0.5em 1.6em;
  margin-top: 0.6rem;
  animation: branch-in 0.5s var(--ease-out, ease-out) 0.4s both;
}
@keyframes branch-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .branch__eyebrow,
  .branch__title,
  .branch__sub,
  .branch__start {
    animation: none;
  }
}
</style>

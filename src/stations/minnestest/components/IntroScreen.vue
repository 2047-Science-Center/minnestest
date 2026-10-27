<script setup lang="ts">
/**
 * Story-intro: Valvets innersta släpper bara in människor. Raderna visas EN i
 * taget — tonar in, hålls, tonar ut (ingen scroll) — framför en valvport som
 * öppnas och stängs, med kontrollrums-ljudbild. Sist dyker knappen upp.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'

const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()

const lines = [t('intro.l1'), t('intro.l2'), t('intro.l3'), t('intro.l4')].filter(Boolean)
const videoSrc = asset('video/valv_intro_loop.mp4')

const idx = ref(0)
const showButton = ref(false)
const LINE_MS = 3600
let timer: ReturnType<typeof setTimeout> | null = null

function advance(): void {
  if (idx.value < lines.length - 1) {
    idx.value += 1
    timer = setTimeout(advance, LINE_MS)
  } else {
    // sista raden visas + tonar ut, sedan dyker knappen upp
    timer = setTimeout(() => {
      showButton.value = true
    }, LINE_MS)
  }
}

onMounted(() => {
  audio.bed('ambience/mt_intro.mp3', 0.16, 1200)
  timer = setTimeout(advance, LINE_MS)
})
onUnmounted(() => {
  if (timer) clearTimeout(timer)
  audio.bedStop(800)
})
</script>

<template>
  <div class="intro">
    <video
      :key="videoSrc"
      class="intro__bg"
      :src="videoSrc"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    />
    <div class="intro__scrim" aria-hidden="true" />

    <div class="intro__fg">
      <p class="intro__eyebrow">{{ t('intro.eyebrow') }}</p>

      <div class="intro__stage">
        <p v-if="!showButton" :key="idx" class="intro__line">{{ lines[idx] }}</p>
        <button v-else class="crt-button crt-button--strong intro__go" @click="emit('done')">
          {{ t('intro.ready') }} ▸
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.intro__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.intro__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 30%, rgba(0, 0, 0, 0.82) 100%);
}
.intro__fg {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  text-align: center;
  width: min(92%, 54ch);
  padding: 1.5rem;
}
.intro__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.28em;
  font-size: 0.85rem;
  color: var(--color-primary);
  margin: 0;
  animation: intro-eyebrow 0.6s var(--ease-out, ease-out) both;
}
@keyframes intro-eyebrow {
  from {
    opacity: 0;
  }
}
/* Scenen där raderna byts — fast höjd så inget hoppar/scrollar. */
.intro__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 7.5rem;
}
.intro__line {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4.5vw, 2.8rem);
  line-height: 1.2;
  color: var(--color-ink-strong);
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.9);
  margin: 0;
  max-width: 24ch;
  animation: intro-line 3.6s ease both;
}
@keyframes intro-line {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  14% {
    opacity: 1;
    transform: translateY(0);
  }
  82% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
.intro__go {
  font-size: 1.5rem;
  padding: 0.5em 1.5em;
  animation: intro-btn 0.5s var(--ease-out, ease-out) both;
}
@keyframes intro-btn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .intro__line {
    animation: none;
  }
}
</style>

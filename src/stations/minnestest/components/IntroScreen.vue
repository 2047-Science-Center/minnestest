<script setup lang="ts">
/**
 * Story-intro: Valvet släpper bara in människor. Raderna visas EN i taget —
 * Valdi läser upp meningen (ElevenLabs), den tonar in, och när uppläsningen är
 * klar tonar den ut och nästa kommer. Allt framför en valvport som öppnas och
 * stängs, med kontrollrums-ljudbild. Faller tillbaka på tajming om rösten är av.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useMinnestestStore } from '../store/minnestestStore'

const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
const store = useMinnestestStore()

const lines = [t('intro.l1'), t('intro.l2'), t('intro.l3'), t('intro.l4')].filter(Boolean)
const videoSrc = asset('video/valv_intro_loop.mp4')

const idx = ref(0)
const showButton = ref(false)
const MIN_MS = 2600
let timer: ReturnType<typeof setTimeout> | null = null
let cancelled = false

async function run(i: number): Promise<void> {
  idx.value = i
  const t0 = Date.now()
  await store.speakNpc(lines[i]).catch(() => {})
  if (cancelled) return
  const wait = Math.max(300, MIN_MS - (Date.now() - t0))
  timer = setTimeout(() => {
    if (cancelled) return
    if (i < lines.length - 1) void run(i + 1)
    else showButton.value = true
  }, wait)
}

onMounted(() => {
  audio.bed('ambience/mt_intro.mp3', 0.16, 1200)
  void run(0)
})
onUnmounted(() => {
  cancelled = true
  if (timer) clearTimeout(timer)
  store.stopSpeak()
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
        <Transition name="iline" mode="out-in">
          <p v-if="!showButton" :key="idx" class="intro__line">{{ lines[idx] }}</p>
          <button v-else key="btn" class="crt-button crt-button--strong intro__go" @click="emit('done')">
            {{ t('intro.ready') }} ▸
          </button>
        </Transition>
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
}
.intro__go {
  font-size: 1.5rem;
  padding: 0.5em 1.5em;
}
/* Fade in/ut mellan rader (och till knappen). */
.iline-enter-active,
.iline-leave-active {
  transition: opacity 0.5s ease, transform 0.5s var(--ease-out, ease-out);
}
.iline-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.iline-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
@media (prefers-reduced-motion: reduce) {
  .iline-enter-active,
  .iline-leave-active {
    transition: opacity 0.2s linear;
  }
}
</style>

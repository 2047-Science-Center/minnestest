<script setup lang="ts">
/**
 * Gren-intro efter rollvalet: en titel-skärm per gren (doktorand → FLYKTEN,
 * metodspecialist → TANKETESTET) med STARTA och en loopande attract-video i
 * bakgrunden (ett av scenklippen). STARTA → in i pilot-läget (blått).
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset } from '@/config'
import { useMinnestestStore } from '../store/minnestestStore'

const emit = defineEmits<{ start: [] }>()
const { t } = useI18n()
const store = useMinnestestStore()

const isFermi = computed(() => store.roleId === 'metodspecialist')
const title = computed(() => (isFermi.value ? t('branch.fermi.title') : t('branch.flykt.title')))
const videoSrc = computed(() =>
  asset(isFermi.value ? 'video/fermi-attract.mp4' : 'video/flykt-attract.mp4'),
)
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
      <h1 class="branch__title ink-strong">{{ title }}</h1>
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
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0.45) 55%,
    rgba(0, 0, 0, 0.78) 100%
  );
}
.branch__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
  text-align: center;
  padding: 1.5rem;
}
.branch__title {
  font-family: var(--font-retro);
  font-size: clamp(3rem, 11vw, 7rem);
  line-height: 1;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  text-shadow:
    var(--glow-soft),
    0 2px 20px rgba(0, 0, 0, 0.85);
  margin: 0;
  animation: branch-in 0.6s var(--ease-out, ease-out) both;
}
.branch__start {
  font-size: 1.6rem;
  padding: 0.5em 1.6em;
  animation: branch-in 0.5s var(--ease-out, ease-out) 0.15s both;
}
@keyframes branch-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .branch__title,
  .branch__start {
    animation: none;
  }
}
</style>

<script setup lang="ts">
/**
 * Story-intro: Valvets innersta släpper bara in människor (cybersäkerhet, går
 * inte att hacka). Raderna dyker upp bit för bit; sedan in i ÖVNINGEN.
 */
import { useI18n } from '@/station-kit/i18n'

const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
const lines = [t('intro.l1'), t('intro.l2'), t('intro.l3'), t('intro.l4')].filter(Boolean)
</script>

<template>
  <div class="intro">
    <div class="intro__inner">
      <p class="intro__eyebrow">{{ t('intro.eyebrow') }}</p>
      <p
        v-for="(line, i) in lines"
        :key="i"
        class="intro__line"
        :class="{ 'intro__line--lead': i === lines.length - 1 }"
        :style="{ animationDelay: 0.3 + i * 0.9 + 's' }"
      >
        {{ line }}
      </p>
      <button
        class="crt-button crt-button--strong intro__go"
        :style="{ animationDelay: 0.3 + lines.length * 0.9 + 's' }"
        @click="emit('done')"
      >
        {{ t('intro.ready') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.intro {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
.intro__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  width: min(94%, 56ch);
  padding: 1.5rem;
  margin: auto;
}
.intro__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.26em;
  font-size: 0.85rem;
  color: var(--color-primary);
  margin: 0;
  animation: i-in 0.5s var(--ease-out, ease-out) both;
}
.intro__line {
  color: var(--color-ink-strong);
  font-size: clamp(1.15rem, 2.6vw, 1.6rem);
  line-height: 1.5;
  margin: 0;
  animation: i-in 0.6s var(--ease-out, ease-out) both;
}
.intro__line--lead {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4.5vw, 2.6rem);
  color: var(--color-primary);
  text-shadow: var(--glow-soft);
}
.intro__go {
  margin-top: 0.6rem;
  animation: i-in 0.5s var(--ease-out, ease-out) both;
}
@keyframes i-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .intro__eyebrow,
  .intro__line,
  .intro__go {
    animation: none;
  }
}
</style>

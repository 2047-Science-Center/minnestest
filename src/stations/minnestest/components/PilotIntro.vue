<script setup lang="ts">
/**
 * Pilot-intro (ruta före övningen): det FÖRSTA gruppen möter när allt blivit
 * blått. Lär ut signalen — BLÅTT = vi övar, ORANGE = på riktigt — via den
 * återanvändbara ModeLegend:en (speglar Förhandlingen). Ingen förklaringsvägg:
 * en rubrik, legenden, en rad, en knapp → in i övningen (lär genom att göra).
 */
import { useI18n } from '@/station-kit/i18n'
import ModeLegend from '@/station-kit/components/ModeLegend.vue'

const { t } = useI18n()
const emit = defineEmits<{ done: [] }>()
</script>

<template>
  <div class="pi">
    <p class="pi__badge">{{ t('mode.testomgang') }}</p>
    <h1 class="pi__title ink-strong">{{ t('mode.practice_title') }}</h1>
    <ModeLegend class="pi__legend" />
    <p class="pi__sub">{{ t('mode.practice_sub') }}</p>
    <button class="crt-button crt-button--strong pi__go" @click="emit('done')">
      {{ t('mode.practice_go') }} ▸
    </button>
  </div>
</template>

<style scoped>
.pi {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
  padding: 1rem;
}
.pi__badge {
  font-family: var(--font-mono);
  letter-spacing: 0.28em;
  font-size: 0.9rem;
  color: var(--color-primary);
  margin: 0;
}
.pi__title {
  font-family: var(--font-retro);
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin: 0;
  max-width: 22ch;
}
.pi__legend {
  margin: 0.4rem 0;
}
.pi__sub {
  color: var(--color-ink-strong);
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  line-height: 1.4;
  margin: 0;
  max-width: 26ch;
}
.pi__go {
  margin-top: 0.6rem;
}
</style>

<script setup lang="ts">
/** Statusrad överst (innehållsspec §4): BORTFALLET · GRUPP {dyn} · MOMENT {n}/3
 *  · // tiden före valvet. MOMENT visas bara under steg-cykeln. */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'

const { t } = useI18n()
const store = useMinnestestStore()
const showMoment = computed(() => store.phase === 'step')
</script>

<template>
  <div class="statusbar">
    <span class="statusbar__seg statusbar__seg--strong">{{ t('status.station') }}</span>
    <span class="statusbar__dot">·</span>
    <span class="statusbar__seg">{{ t('status.group', { grupp: store.group.id }) }}</span>
    <template v-if="showMoment">
      <span class="statusbar__dot">·</span>
      <span class="statusbar__seg">{{ t('status.moment', { n: store.stepIndex + 1 }) }}</span>
    </template>
    <span class="statusbar__pre">{{ t('status.pretext') }}</span>
  </div>
</template>

<style scoped>
.statusbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  padding: 0.2rem 0.2rem;
}
.statusbar__seg--strong {
  color: var(--color-primary);
  font-family: var(--font-retro);
  letter-spacing: 0.14em;
}
.statusbar__dot {
  opacity: 0.5;
}
.statusbar__pre {
  margin-left: auto;
  font-style: italic;
  opacity: 0.7;
}
</style>

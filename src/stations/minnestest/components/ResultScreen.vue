<script setup lang="ts">
/**
 * Slutskärm: hur långt gruppen nådde (vilket rum / färg), slutzon och Valdis
 * sista utlåtande. ÖPPNAD HELA VÄGEN → välkomna in; TVEKSAM → nätt och jämnt;
 * ACCESS DENIED → porten förblev stängd.
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { ROOMS } from '@/config'
import { useMinnestestStore } from '../store/minnestestStore'

const { t } = useI18n()
const store = useMinnestestStore()

const isLd = computed(() => store.game === 'logndetektor')
const o = computed(() => store.outcome)
const reached = computed(() => {
  const n = o.value?.roomsCleared ?? 0
  const max = o.value?.maxRooms ?? store.roomMax
  if (isLd.value) return t('result.reached_plain', { n, max })
  const idx = Math.max(0, Math.min(n - 1, ROOMS.length - 1))
  return t('result.reached', { n, max, color: t(`room.name.${ROOMS[idx].color ?? 'bla'}`) })
})
const headline = computed(() =>
  !o.value ? '' : o.value.granted ? t('result.granted_title') : t('result.denied_title'),
)
const body = computed(() => {
  if (!o.value) return ''
  const p = isLd.value ? 'ld.result' : 'result'
  if (o.value.granted) return t(`${p}.granted_body`)
  if (o.value.zone === 'tveksam') return t(`${p}.tveksam_body`)
  return t(`${p}.denied_body`)
})
</script>

<template>
  <div class="result" :class="o?.granted ? 'result--ok' : 'result--no'">
    <div class="result__inner">
      <p class="result__eyebrow">{{ t('result.eyebrow') }}</p>
      <h1 class="result__headline">{{ headline }}</h1>
      <p class="result__reached">{{ reached }}</p>
      <p v-if="body" class="result__body ink-strong">{{ body }}</p>
      <p v-if="o?.lastUtlatande" class="result__utlatande">"{{ o.lastUtlatande }}"</p>
      <button class="crt-button crt-button--strong result__go" @click="store.resultDone()">
        {{ t('result.to_checkout') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.result {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
.result__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  text-align: center;
  width: min(94%, 56ch);
  padding: 1.5rem;
  margin: auto;
}
.result__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.24em;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  margin: 0;
}
.result__headline {
  font-family: var(--font-retro);
  font-size: clamp(2.4rem, 8vw, 4.2rem);
  line-height: 1;
  margin: 0;
  animation: res-in 0.5s var(--ease-out, ease-out) both;
}
.result--ok .result__headline {
  color: var(--color-lag2, #7ad14f);
  text-shadow: 0 0 22px rgba(122, 209, 79, 0.6);
}
.result--no .result__headline {
  color: var(--color-danger, #ff5a3c);
  text-shadow: 0 0 22px rgba(255, 90, 60, 0.6);
}
.result__reached {
  font-family: var(--font-mono);
  color: var(--color-primary);
  margin: 0;
}
.result__body {
  font-size: clamp(1.1rem, 2.6vw, 1.5rem);
  line-height: 1.45;
  margin: 0;
}
.result__utlatande {
  max-width: 50ch;
  color: var(--color-ink-muted);
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}
.result__go {
  margin-top: 0.5rem;
}
@keyframes res-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .result__headline {
    animation: none;
  }
}
</style>

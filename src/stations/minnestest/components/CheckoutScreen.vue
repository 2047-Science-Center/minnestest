<script setup lang="ts">
/** Utcheckning (ruta 18): bekräftelse + RFID-prompt. Bipp → ny grupp (reset). */
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'

const { t } = useI18n()
const store = useMinnestestStore()
</script>

<template>
  <div class="checkout" @click="store.reset()">
    <h2 class="checkout__title ink-strong">{{ t('checkout.title') }}</h2>
    <p class="checkout__body">{{ t('checkout.body') }}</p>
    <p class="checkout__next">{{ t('checkout.next', { dyn: t('checkout.next_unknown') }) }}</p>
    <p class="checkout__cta crt-caret">{{ t('common.press_to_start') }}</p>
  </div>
</template>

<style scoped>
.checkout {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  text-align: center;
  cursor: pointer;
}
.checkout__title {
  font-family: var(--font-retro);
  letter-spacing: 0.16em;
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0;
}
.checkout__body {
  color: var(--color-ink-strong);
  margin: 0;
}
.checkout__next {
  color: var(--color-ink-muted);
  margin: 0;
}
.checkout__cta {
  margin-top: 1rem;
  color: var(--color-primary);
}
</style>

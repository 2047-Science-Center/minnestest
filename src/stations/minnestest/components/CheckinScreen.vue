<script setup lang="ts">
/** Incheckning (ruta 2): kort bekräftelse, auto-vidare (~2 s). Pilot: MockIdentity. */
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { config } from '@/config'
import { useMinnestestStore } from '../store/minnestestStore'
import Teletype from '@/station-kit/components/Teletype.vue'

const { t } = useI18n()
const store = useMinnestestStore()
let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => store.checkinDone(), config.checkinAutoMs)
})
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="checkin">
    <Teletype
      class="checkin__line ink-strong"
      :text="t('checkin.read', { grupp: store.group.id, n: store.memberCount })"
      :speed="28"
    />
  </div>
</template>

<style scoped>
.checkin {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.checkin__line {
  font-family: var(--font-retro);
  font-size: 1.3rem;
  letter-spacing: 0.1em;
  color: var(--color-primary);
}
</style>

<script setup lang="ts">
/** Scenario-intro (ruta 5): helbild + copy i nedre tredjedel, FORTSÄTT ▸. */
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'
import MediaSlot from './MediaSlot.vue'
import Teletype from '@/station-kit/components/Teletype.vue'

const { t } = useI18n()
const store = useMinnestestStore()
</script>

<template>
  <div class="intro">
    <div class="intro__media">
      <MediaSlot :id="store.scenario.introMedia" />
    </div>
    <div class="intro__copy">
      <Teletype :text="t(`${store.scenarioId}.intro`)" :speed="22" />
      <button class="crt-button crt-button--strong intro__go" @click="store.scenarioIntroDone()">
        {{ t('common.continue') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.intro__media {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
}
.intro__copy {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--color-ink-strong);
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5));
  padding: 0.8rem;
  border-radius: var(--radius, 8px);
}
.intro__go {
  align-self: flex-end;
}
</style>

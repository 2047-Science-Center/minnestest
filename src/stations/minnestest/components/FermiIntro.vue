<script setup lang="ts">
/**
 * Fermi-intro (metodspecialist-grenen) — ersätter scenario-intro + hem-reveal.
 * Ställer HELA frågan innan de tre stegen: bild + copy i nedre tredjedel, BÖRJA ▸.
 */
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
      <MediaSlot :id="store.example.introMedia || 'intro_fermi'" :autoplay="false" />
    </div>
    <div class="intro__copy">
      <Teletype :text="t('fermi.intro.l1')" :speed="20" />
      <p class="intro__q ink-strong">{{ t('fermi.intro.l2') }}</p>
      <p class="intro__how">{{ t('fermi.intro.l3') }}</p>
      <button class="crt-button crt-button--strong intro__go" @click="store.introDone()">
        {{ t('fermi.intro.begin') }} ▸
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
  min-height: 0;
}
.intro__media {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.intro__copy {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
  padding: 0.9rem;
  border-radius: var(--radius, 8px);
}
.intro__q {
  font-family: var(--font-retro);
  font-size: clamp(1.2rem, 2.6vw, 1.8rem);
  color: var(--color-primary);
  margin: 0;
}
.intro__how {
  color: var(--color-ink-strong);
  margin: 0;
}
.intro__go {
  align-self: flex-end;
}
</style>

<script setup lang="ts">
/**
 * Mönstringsutlåtande (ruta 17): stigande slutpoäng-skala → landar på profil +
 * poäng → brödtext (final-compose) → "Er poäng registreras." Poängen visas
 * ALDRIG som en naken siffra — den klättrar fram via RisingScale.
 */
import { ref, computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'
import RisingScale from './RisingScale.vue'
import MediaSlot from './MediaSlot.vue'
import Teletype from '@/station-kit/components/Teletype.vue'

const { t } = useI18n()
const store = useMinnestestStore()
const landed = ref(false)

const rollUpper = computed(() =>
  store.roleId ? t(`role.${store.roleId}.upper`) : '',
)
const profileLabel = computed(() =>
  t('verdict.profile_label', { roll: rollUpper.value, profil: store.final?.profil ?? '' }),
)
</script>

<template>
  <div class="verdict">
    <div class="verdict__bg" aria-hidden="true">
      <MediaSlot id="sorteringshatt_bg" :autoplay="false" />
    </div>

    <div class="verdict__fg">
      <h2 class="verdict__title ink-strong">{{ t('verdict.title') }}</h2>

      <RisingScale v-if="store.final" :poang="store.final.poang" @landed="landed = true" />

      <transition name="fade">
        <div v-if="landed && store.final" class="verdict__reveal">
          <div class="verdict__hero">
            <span class="verdict__poang">{{ store.final.poang }}</span>
            <span class="verdict__poang-max">/10</span>
          </div>
          <p class="verdict__profile ink-strong">{{ profileLabel }}</p>
          <Teletype class="verdict__summary" :text="store.final.sammanfattning" :speed="22" />
          <p class="verdict__registered">{{ t('verdict.score_registered') }}</p>
          <button class="crt-button crt-button--strong" @click="store.verdictDone()">
            {{ t('verdict.checkout_hint') }} ▸
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.verdict {
  position: relative;
  height: 100%;
  min-height: 0;
}
.verdict__bg {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  pointer-events: none;
  display: flex;
  align-items: center;
}
.verdict__fg {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  padding: 0.5rem;
  overflow: auto;
}
.verdict__title {
  font-family: var(--font-retro);
  letter-spacing: 0.16em;
  text-align: center;
  margin: 0;
}
.verdict__reveal {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
  margin-top: 1rem;
}
.verdict__hero {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}
.verdict__poang {
  font-family: var(--font-retro);
  font-size: clamp(3rem, 9vw, 5rem);
  line-height: 1;
  color: var(--color-primary);
  text-shadow: var(--glow-strong, 0 0 20px rgba(255, 176, 0, 0.7));
}
.verdict__poang-max {
  font-family: var(--font-retro);
  font-size: 1.4rem;
  color: var(--color-ink-muted);
}
.verdict__profile {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  text-shadow: var(--glow-strong, 0 0 14px rgba(255, 176, 0, 0.6));
  margin: 0;
}
.verdict__summary {
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--color-ink-strong);
}
.verdict__registered {
  color: var(--color-ink-muted);
  margin: 0;
}
.fade-enter-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>

<script setup lang="ts">
/**
 * Spelväljare: MÄNNISKOTESTET eller VALDIS LÖGNDETEKTOR. Visas efter attract
 * om NUC:en inte är låst till ett spel (PINNED_GAME). chooseGame → branchIntro.
 */
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'

const { t } = useI18n()
const store = useMinnestestStore()
</script>

<template>
  <div class="gsel">
    <p class="gsel__eyebrow">{{ t('gameselect.title') }}</p>
    <div class="gsel__cards">
      <button class="gsel__card amber-frame" @click="store.chooseGame('manniskotest')">
        <h2 class="gsel__name ink-strong">{{ t('gameselect.manniskotest') }}</h2>
        <p class="gsel__sub">{{ t('gameselect.manniskotest_sub') }}</p>
      </button>
      <button class="gsel__card amber-frame" @click="store.chooseGame('logndetektor')">
        <h2 class="gsel__name ink-strong">{{ t('gameselect.logndetektor') }}</h2>
        <p class="gsel__sub">{{ t('gameselect.logndetektor_sub') }}</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.gsel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  padding: 1.5rem;
}
.gsel__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.3em;
  color: var(--color-ink-muted);
  margin: 0;
}
.gsel__cards {
  display: flex;
  gap: 1.4rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.gsel__card {
  flex: 1 1 22ch;
  max-width: 34ch;
  min-height: 11rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 1.8rem 1.4rem;
  text-align: center;
  cursor: pointer;
  background: var(--color-background-2);
  transition: transform 0.15s var(--ease-out, ease-out), box-shadow 0.15s ease;
}
.gsel__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--glow-strong);
}
.gsel__card:active {
  transform: scale(0.98);
}
.gsel__name {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4.5vw, 2.6rem);
  line-height: 1.05;
  color: var(--color-primary);
  margin: 0;
}
.gsel__sub {
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  margin: 0;
  max-width: 26ch;
}
</style>

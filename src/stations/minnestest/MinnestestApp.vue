<script setup lang="ts">
/**
 * Toppnivå för MÄNNISKOTESTET. Attract → tillståndsmaskin. Kiosk = en skärm,
 * CRT-tema från kitet (rummen sätter sin egen accentfärg lokalt). Store äger
 * faserna; denna komponent mappar fas → vy.
 *
 * attract → branchIntro (titel) → intro (story) → room (ÖVNING) → goLive
 *          → room ×5 → result → checkout
 */
import { onMounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'

import CrtScreen from '@/station-kit/components/CrtScreen.vue'
import AttractScreen from '@/station-kit/components/AttractScreen.vue'
import ModeCountdown from '@/station-kit/components/ModeCountdown.vue'
import MediaSlot from './components/MediaSlot.vue'

import { useMinnestestStore } from './store/minnestestStore'
import BranchIntro from './components/BranchIntro.vue'
import IntroScreen from './components/IntroScreen.vue'
import RoomCycle from './components/RoomCycle.vue'
import ResultScreen from './components/ResultScreen.vue'
import FacilitatorControls from './components/FacilitatorControls.vue'
import PauseOverlay from './components/PauseOverlay.vue'
import CheckoutScreen from './components/CheckoutScreen.vue'

const { t } = useI18n()
const store = useMinnestestStore()

onMounted(() => store.init())
</script>

<template>
  <div class="app" :data-mode="store.isTutorial ? 'test' : 'live'">
    <!-- Attract tills första gesten -->
    <div v-if="store.phase === 'attract'" class="app__single">
      <CrtScreen>
        <div class="attract-wrap">
          <div class="attract-wrap__bg" aria-hidden="true">
            <MediaSlot id="attract_loop" :autoplay="false" />
          </div>
          <div class="attract-wrap__fg">
            <AttractScreen @start="store.begin()" />
          </div>
        </div>
      </CrtScreen>
    </div>

    <template v-else>
      <div class="app__single">
        <CrtScreen>
          <BranchIntro v-if="store.phase === 'branchIntro'" @start="store.startBranch()" />
          <IntroScreen v-else-if="store.phase === 'intro'" @done="store.introDone()" />
          <ModeCountdown
            v-else-if="store.phase === 'goLive'"
            :from="5"
            :title="t('room.golive_title')"
            @done="store.goLiveDone()"
          />
          <RoomCycle
            v-else-if="store.phase === 'room'"
            :key="store.isTutorial ? 'tutorial' : 'room-' + store.roomIndex"
          />
          <ResultScreen v-else-if="store.phase === 'result'" />
          <CheckoutScreen v-else-if="store.phase === 'checkout'" />
        </CrtScreen>
      </div>
    </template>

    <!-- Facilitator-kontroller (paus/starta om/avsluta) + paus-overlay -->
    <FacilitatorControls v-if="store.phase !== 'attract'" />
    <PauseOverlay v-if="store.paused" />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  gap: 0.5rem;
}
.app__single {
  position: relative;
  flex: 1;
  min-height: 0;
}
.attract-wrap {
  position: relative;
  height: 100%;
}
.attract-wrap__bg {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  z-index: 0;
  display: flex;
  align-items: center;
}
.attract-wrap__fg {
  position: relative;
  z-index: 1;
  height: 100%;
}
</style>

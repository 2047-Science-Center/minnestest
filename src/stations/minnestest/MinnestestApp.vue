<script setup lang="ts">
/**
 * Toppnivå för stationen Minnestestet. Attract → tillståndsmaskin. Kiosk = en
 * skärm, fast bärnstens-CRT-tema från kitet. Store äger faserna; denna komponent
 * mappar fas → vy.
 */
import { onMounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'

import CrtScreen from '@/station-kit/components/CrtScreen.vue'
import AttractScreen from '@/station-kit/components/AttractScreen.vue'
import ModeCountdown from '@/station-kit/components/ModeCountdown.vue'
import MediaSlot from './components/MediaSlot.vue'

import { useMinnestestStore } from './store/minnestestStore'
import CheckinScreen from './components/CheckinScreen.vue'
import RoleSelect from './components/RoleSelect.vue'
import BranchIntro from './components/BranchIntro.vue'
import PilotIntro from './components/PilotIntro.vue'
import StepCycle from './components/StepCycle.vue'
import ResultWalkthrough from './components/ResultWalkthrough.vue'
import FacilitatorControls from './components/FacilitatorControls.vue'
import PauseOverlay from './components/PauseOverlay.vue'
import VerdictScreen from './components/VerdictScreen.vue'
import CheckoutScreen from './components/CheckoutScreen.vue'

const { t } = useI18n()
const store = useMinnestestStore()

onMounted(() => store.init())
</script>

<template>
  <div class="app" :data-mode="store.mode">
    <!-- Attract tills första gesten/band-bipp -->
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
          <CheckinScreen v-if="store.phase === 'checkin'" />
          <RoleSelect v-else-if="store.phase === 'roleSelect'" />
          <BranchIntro v-else-if="store.phase === 'branchIntro'" @start="store.startBranch()" />
          <PilotIntro v-else-if="store.phase === 'pilotIntro'" @done="store.pilotIntroDone()" />
          <ModeCountdown
            v-else-if="store.phase === 'goLive'"
            :title="t('mode.golive_title')"
            @done="store.goLiveDone()"
          />
          <StepCycle v-else-if="store.phase === 'step'" />
          <ResultWalkthrough
            v-else-if="store.phase === 'practiceReveal'"
            mode="test"
            @finish="store.practiceRevealDone()"
          />
          <VerdictScreen v-else-if="store.phase === 'verdict'" />
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

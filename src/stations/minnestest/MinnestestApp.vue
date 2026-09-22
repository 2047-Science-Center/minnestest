<script setup lang="ts">
/**
 * Toppnivå för stationen Minnestestet. Attract → tillståndsmaskin. Kiosk = en
 * skärm, fast bärnstens-CRT-tema från kitet. Store äger faserna; denna komponent
 * mappar fas → vy.
 */
import { computed, onMounted } from 'vue'
import { useI18n } from '@/station-kit/i18n'

import CrtScreen from '@/station-kit/components/CrtScreen.vue'
import AttractScreen from '@/station-kit/components/AttractScreen.vue'
import MuteButton from '@/station-kit/components/MuteButton.vue'

import { useMinnestestStore } from './store/minnestestStore'
import StatusBar from './components/StatusBar.vue'
import CheckinScreen from './components/CheckinScreen.vue'
import RoleSelect from './components/RoleSelect.vue'
import VaultTransition from './components/VaultTransition.vue'
import ScenarioIntro from './components/ScenarioIntro.vue'
import HomeReveal from './components/HomeReveal.vue'
import StepCycle from './components/StepCycle.vue'
import VerdictScreen from './components/VerdictScreen.vue'
import CheckoutScreen from './components/CheckoutScreen.vue'

const { t } = useI18n()
const store = useMinnestestStore()

const vaultOutLines = computed(() => [
  t('vaultout.l1'),
  t('vaultout.l2'),
  t('vaultout.l3'),
  t('vaultout.l4'),
])
const vaultBackLines = computed(() => [t('vaultback.l1'), t('vaultback.l2'), t('vaultback.l3')])

onMounted(() => store.init())
</script>

<template>
  <div class="app">
    <!-- Attract tills första gesten/band-bipp -->
    <div v-if="store.phase === 'attract'" class="app__single">
      <CrtScreen><AttractScreen @start="store.begin()" /></CrtScreen>
    </div>

    <template v-else>
      <div class="app__chrome">
        <StatusBar />
        <MuteButton />
      </div>

      <div class="app__single">
        <CrtScreen>
          <CheckinScreen v-if="store.phase === 'checkin'" />
          <RoleSelect v-else-if="store.phase === 'roleSelect'" />
          <VaultTransition
            v-else-if="store.phase === 'vaultOut'"
            :lines="vaultOutLines"
            @done="store.vaultOutDone()"
          />
          <ScenarioIntro v-else-if="store.phase === 'scenarioIntro'" />
          <HomeReveal v-else-if="store.phase === 'homeReveal'" />
          <StepCycle v-else-if="store.phase === 'step'" />
          <VaultTransition
            v-else-if="store.phase === 'vaultBack'"
            :lines="vaultBackLines"
            :hold="store.composing"
            @done="store.vaultBackDone()"
          />
          <VerdictScreen v-else-if="store.phase === 'verdict'" />
          <CheckoutScreen v-else-if="store.phase === 'checkout'" />
        </CrtScreen>
      </div>
    </template>
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
.app__chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0 0.2rem;
}
.app__single {
  flex: 1;
  min-height: 0;
}
</style>

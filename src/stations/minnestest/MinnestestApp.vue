<script setup lang="ts">
/**
 * Toppnivå för MÄNNISKOTESTET. Attract → tillståndsmaskin. Kiosk = en skärm,
 * CRT-tema från kitet (rummen sätter sin egen accentfärg lokalt). Store äger
 * faserna; denna komponent mappar fas → vy.
 *
 * attract → branchIntro (titel) → intro (story) → room (ÖVNING) → goLive
 *          → room ×5 → result → checkout
 */
import { onMounted, computed, watch } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { ROLLVAL, ROTATION, ENTRE, SIDE_GAME, thisSide, type Game } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import RotationScreens from '@/station-kit/rotation/RotationScreens.vue'
import { initRotation, rotationOptions } from '@/station-kit/rotation/rotation'
import LekStandalone from '@/station-kit/lek/LekStandalone.vue'
import { lekPreviewFromUrl } from '@/station-kit/lek/lekSync'
import MinnestestLek from './lek/MinnestestLek.vue'

import CrtScreen from '@/station-kit/components/CrtScreen.vue'
import AttractScreen from '@/station-kit/components/AttractScreen.vue'
import Entre from '@/station-kit/entre/Entre.vue'
import { initEntre } from '@/station-kit/entre/entre'
import ModeCountdown from '@/station-kit/components/ModeCountdown.vue'
import MediaSlot from './components/MediaSlot.vue'

import { useMinnestestStore } from './store/minnestestStore'
import GameSelect from './components/GameSelect.vue'
import BranchIntro from './components/BranchIntro.vue'
import IntroScreen from './components/IntroScreen.vue'
import RoomCycle from './components/RoomCycle.vue'
import ResultScreen from './components/ResultScreen.vue'
import FacilitatorControls from './components/FacilitatorControls.vue'
import PauseOverlay from './components/PauseOverlay.vue'
import CheckoutScreen from './components/CheckoutScreen.vue'

const { t } = useI18n()
const store = useMinnestestStore()

/** Rollen bestämmer spelet (ersätter den gamla spelväljaren GameSelect):
 *  Äkthetsgranskare → människotestet, Sanningsanalytiker → lögndetektorn. */
const ROLE_TO_GAME: Record<string, Game> = {
  akthetsgranskare: 'manniskotest',
  sanningsanalytiker: 'logndetektor',
}

// --- Rotationen + entrén (station-kit): entréns attract visar "Testgrupp X — tryck"
//     + sidindelningen, sedan rollval-klipp → valet → ombalansering → "gå till sida A/B".
//     TVÅ NUC:ar: sida A = Människotestet, sida B = Lögndetektorn (config ENTRE/SIDE_GAME);
//     NUC:ens sida ur ?sida= / VITE_GAME. Skarpt börjar vid goLive; resultatskärmen klar
//     (→ checkout) = done + lek; lämnar gruppen 'running' → stationen återställs. ---
const rotation = initRotation(rotationOptions(ROTATION))
const entre = initEntre({ stationN: ROTATION.stationN, config: ENTRE, mqttUrl: rotationOptions(ROTATION).mqttUrl })
const mySide = thisSide()
entre.setScreen({ side: mySide, leader: mySide !== 'B' })
const entreDone = computed(() => entre.state.step === 'klar')

// --- Lek-läget (lila, efter done): en lek per sida — XY-VANTUPPGIFTER.md 2A/2C.
//     Namnen = den här sidans personer ur entrén. ?lek=1 visar leken direkt. ---
const lekPreview = lekPreviewFromUrl()
const lekNames = computed(() =>
  entre.personer.value.filter((p) => mySide == null || p.side === mySide).map((p) => p.name),
)

function onEntreStart(): void {
  audio.unlock()
  store.begin()
}
/** Entrén klar → den här sidans spel + gruppens namn/roller på den här sidan. */
function onEntreDone(): void {
  const side = mySide ?? 'A'
  const role = ENTRE.roles.find((r) => r.letter === side)!
  const persons = entre.personer.value
    .filter((p) => mySide == null || p.side === side)
    .map((p) => ({
      band_id: p.band_id,
      name: p.name,
      // DB: chosen_role är NOT NULL — den som inte hann välja (facilitatorns "Lotta nu") loggas som sin tilldelade roll.
      chosen_role: p.chosen_role ?? p.assigned_role,
      assigned_role: p.assigned_role,
    }))
  const g = rotation.state.group
  store.setRoster(g != null ? `testgrupp-${g}` : store.group.id, persons)
  const game = ROLE_TO_GAME[role.rollvalRoleId] ?? SIDE_GAME[side]
  store.chooseGame(game)
}

onMounted(() => {
  store.init()
  entre.attachTransport(store.transport())
})

watch(
  () => rotation.state.phase,
  (p, old) => {
    if (p === 'running') audio.unlock()
    else if (old === 'running') store.reset()
  },
)
// Appen tillbaka på attract (reset/idle/ny grupp) → entrén också.
watch(
  () => store.phase,
  (p) => {
    if (p === 'attract') entre.reset()
  },
)
watch(
  () => store.phase,
  (p) => {
    if (p === 'goLive') rotation.markSkarp()
    if (p === 'checkout') rotation.finishSkarp()
  },
)
</script>

<template>
  <div class="app" :data-mode="!entreDone ? 'live' : store.isTutorial ? 'test' : 'live'">
    <!-- Entrén: attract (testgrupp + sidindelning) → rollval → valet → utfall -->
    <div v-if="!entreDone" class="app__single">
      <CrtScreen>
        <Entre :rollval="ROLLVAL" @start="onEntreStart" @done="onEntreDone">
          <template #attract="{ start }">
            <div class="attract-wrap">
              <div class="attract-wrap__bg" aria-hidden="true">
                <MediaSlot id="attract_loop" :autoplay="false" />
              </div>
              <div class="attract-wrap__fg">
                <AttractScreen @start="start" />
              </div>
            </div>
          </template>
        </Entre>
      </CrtScreen>
    </div>

    <template v-else>
      <div class="app__single">
        <CrtScreen>
          <GameSelect v-if="store.phase === 'gameSelect'" />
          <BranchIntro v-else-if="store.phase === 'branchIntro'" @start="store.startBranch()" />
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

    <!-- Rotationen: väntar / lek (overlay; "Testgrupp X — tryck" visas av entrén) -->
    <RotationScreens station-title="Människotestet">
      <template #lek><MinnestestLek :side="mySide" :names="lekNames" /></template>
    </RotationScreens>
    <LekStandalone v-if="lekPreview"><MinnestestLek :side="mySide" :names="lekNames" /></LekStandalone>
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

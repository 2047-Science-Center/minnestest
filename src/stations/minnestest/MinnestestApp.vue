<script setup lang="ts">
/**
 * Toppnivå för MÄNNISKOTESTET. Attract → tillståndsmaskin. Kiosk = en skärm,
 * CRT-tema från kitet (rummen sätter sin egen accentfärg lokalt). Store äger
 * faserna; denna komponent mappar fas → vy.
 *
 * attract → branchIntro (titel) → intro (story) → room (ÖVNING) → goLive
 *          → room ×5 → result → checkout
 */
import { onMounted, computed, ref, watch } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { config, ROLLVAL, ROLLVAL_OVERLAY_SETS, ROLLVAL_PORTRATT_SETS, ROTATION, ENTRE, STATION_TITLE, BANDLOST, LJUS, SIDE_GAME, STATION_N, thisSide, type Game } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import RotationScreens from '@/station-kit/rotation/RotationScreens.vue'
import { initRotation, rotationOptions, DEFAULT_ORDER } from '@/station-kit/rotation/rotation'
import { kortFil } from '@/station-kit/spellage/spellage'
import { pilotUi } from '@/station-kit/kiosk/kioskSkip'
import SpellageKort from '@/station-kit/spellage/SpellageKort.vue'
import { initResultat, resultatOptions } from '@/station-kit/resultat'
import LekStandalone from '@/station-kit/lek/LekStandalone.vue'
import { lekPreviewFromUrl } from '@/station-kit/lek/lekSync'
import MinnestestLek from './lek/MinnestestLek.vue'
import { initLjus, ljusOptions, LjusRemsa } from '@/station-kit/ljus'
import { initFilm, filmOptions, FilmOverlay } from '@/station-kit/film'
import { initIncheckning, incheckningOptions } from '@/station-kit/incheckning/incheckning'
import IncheckningScreen from '@/station-kit/incheckning/IncheckningScreen.vue'
import { spela, egnaSegment, segmentFor, basLage } from './ljus'

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
import ExternSpel from './components/ExternSpel.vue'
import { externSpelUrl } from './externSpel'

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
//     DELAD station (SOM.md 2026-11-18): varje sida (NUC) har en egen done-nyckel → sidan går
//     till lek när DESS spel är klart; regi väntar in båda (rotation.done_nycklar). Delad vy
//     (pilot, ingen sida) = hela stationen som förut.
const mySide = thisSide()
/** Facilitatorns paus/nollställ/avsluta syns bara med ?pilot=1 (Josef 2026-11-26, som st1/st3); annars hörngesterna. */
const visaPilot = pilotUi()
// --- Station 2:s nya spel (Josef 2026-11-24, SOM.md "Station 2 från 2026-11-24"): efter entrén öppnas sidans
//     spel-app i helskärm — sida A Människa eller maskin, sida B Lögndetektorn — på samma dator. Skalet (den här
//     appen) behåller entrén, rotationen, resultatet, ljuset, filmerna och leken. ?spel=gammalt = rumsspelen. ---
const externUrl = typeof window !== 'undefined' ? externSpelUrl(mySide, window.location) : null
const externNamn = ref<string[]>([])
// Fönstertiteln följer sidan (två stationer på två NUC:ar): "Lögndetektorn — X&Y" / "Människotestet — X&Y".
if (typeof document !== 'undefined') document.title = `${STATION_TITLE} — X&Y`
const rotation = initRotation(rotationOptions({ ...ROTATION, side: mySide }))
// Resultatet ut (station-kit/resultat): på när rotationen är på, överstyrs med ?result=1|0 / VITE_RESULT.
{
  const rot = rotationOptions(ROTATION)
  initResultat(resultatOptions({ stationN: ROTATION.stationN, enabled: rot.enabled, mqttUrl: rot.mqttUrl }))
}
const entre = initEntre({
  stationN: ROTATION.stationN,
  config: ENTRE,
  mqttUrl: rotationOptions(ROTATION).mqttUrl,
  bandlost: BANDLOST,
})
entre.setScreen({ side: mySide, leader: mySide !== 'B' })
const entreDone = computed(() => entre.state.step === 'klar')

// --- Ljuset (station-kit/ljus, XY-FEEDBACK-LJUS-LJUD §5.2). DELAD station: varje sidas NUC
//     skriver bara SINA segment (A | B + valdi) med {ersatt:false}; delad vy = alla segment.
//     Sidans bas följer rotationen (eller appens faser när rotationen är av); done → 'klar'. ---
const ljus = initLjus(
  ljusOptions({
    stationN: STATION_N,
    enabled: config.mode === 'production',
    mqttUrl: rotationOptions(ROTATION).mqttUrl,
    valv: LJUS.valv,
    segment: LJUS.segment,
    skrivare: true,
    egna: egnaSegment(mySide),
    delad: mySide != null,
    spela,
  }),
)

// --- Regis filmer (station-kit/film, SOM.md "Filmer i riggen"): trailern helskärm i båda
//     fönstren medan regi står i trailerfasen, sedan tillbaka till stationen. ---
//     I reveal/syv visar overlayen broker-NUC:ens appar (SOM.md "Appar i riggen").
initFilm(
  filmOptions({
    enabled: config.mode === 'production',
    mqttUrl: rotationOptions(ROTATION).mqttUrl,
    stationN: STATION_N,
    sida: mySide,
  }),
)
// --- Incheckningen (station-kit/incheckning, SOM.md "Incheckningen vid stationerna"): medan regi står i
//     incheckningen visar stationen gruppen som börjar här ("Ta ditt band") → "Alla har sina band på sig"
//     → station<N>/incheckad. Regi går till trailern när alla stationer kvitterat. ---
initIncheckning(
  incheckningOptions({
    stationN: ROTATION.stationN,
    enabled: config.mode === 'production',
    mqttUrl: rotationOptions(ROTATION).mqttUrl,
    bandlost: BANDLOST,
    side: mySide,
  }),
)

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
/* Spellägeskortet (MOT VALDI, xy-produktion/spellage §9): efter rollvalets utfall, innan sidans spel öppnas.
 * Sidorna spelar var för sig (delad station), så ingen väntan och ingen synk mellan NUC:arna: varje sida
 * spelar sitt eget kort (`<fran>-st2A.mp4` / `-st2B.mp4`) med rösten i sin egen högtalare. Saknas filen → direkt vidare. */
const kortAt = ref<number | null>(null)
const kortSrc = computed(
  () =>
    `${import.meta.env.BASE_URL}media/spellage/${kortFil(ROTATION.stationN, rotation.state.round, DEFAULT_ORDER).replace('.mp4', `${mySide ?? 'A'}.mp4`)}`,
)
let efterKort: (() => void) | null = null
function kortKlart(): void {
  kortAt.value = null
  const f = efterKort
  efterKort = null
  f?.()
}

/** Entrén klar → spellägeskortet → den här sidans spel + gruppens namn/roller på den här sidan. */
function onEntreDone(): void {
  efterKort = startaSidansSpel
  kortAt.value = Date.now()
}
function startaSidansSpel(): void {
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
      // Klippsetet ur DB (station<N>/group set_id + female_role) → hur den valda rollen presenterades.
      role_presented_as: entre.presentedAs(p),
    }))
  const g = rotation.state.group
  store.setRoster(g != null ? `testgrupp-${g}` : store.group.id, persons)
  if (externUrl) {
    externNamn.value = persons.map((p) => p.name)
    store.startExtern()
    return
  }
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
    if (p === 'attract') {
      entre.reset()
      kortAt.value = null
      efterKort = null
    }
  },
)
watch(
  () => store.phase,
  (p) => {
    if (p === 'goLive') rotation.markSkarp()
    if (p === 'checkout') rotation.finishSkarp()
  },
)
// Externt spel: spelet säger när skarpa delen börjar (isTutorial → false) → station<N>/mode skarp.
watch(
  () => store.phase === 'extern' && !store.isTutorial,
  (skarp) => {
    if (skarp) rotation.markSkarp()
  },
)
// Sidans bas (bara egen sida). Skarpt klart → lek: 'klar'-gesten (sätter själv lila bas).
watch(
  [() => basLage(rotation.state, store.phase, store.isTutorial), () => rotation.state.phase],
  ([lage, rp], old) => {
    const seg = segmentFor(store.game, mySide)
    if (rp === 'lek' && old?.[1] === 'running') ljus.gest('klar', [seg])
    else ljus.lage(lage, [seg])
  },
  { immediate: true },
)
</script>

<template>
  <div class="app" :data-mode="!entreDone ? 'live' : store.isTutorial ? 'test' : 'live'">
    <!-- Entrén: attract (testgrupp + sidindelning) → rollval → valet → utfall -->
    <div v-if="!entreDone" class="app__single">
      <CrtScreen>
        <Entre :rollval="ROLLVAL" :overlay-sets="ROLLVAL_OVERLAY_SETS" :portratt-sets="ROLLVAL_PORTRATT_SETS" @start="onEntreStart" @done="onEntreDone">
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

    <!-- Spellägeskortet (MOT VALDI), före sidans spel -->
    <div v-else-if="kortAt != null" class="app__single">
      <CrtScreen>
        <SpellageKort :src="kortSrc" :start-at="kortAt" :leader="true" @done="kortKlart" @skip="kortKlart" />
      </CrtScreen>
    </div>

    <!-- Station 2:s nya spel (helskärm): resultatet tillbaka via postMessage → result + checkout -->
    <ExternSpel
      v-else-if="store.phase === 'extern' && externUrl"
      :url="externUrl"
      :egna="egnaSegment(mySide)"
      :namn="externNamn"
      :grupp="store.group.id"
      :mqtt-url="rotationOptions(ROTATION).mqttUrl || null"
      @skarp="store.externSkarp()"
      @klar="store.externKlar($event)"
    />

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
    <FacilitatorControls v-if="visaPilot && store.phase !== 'attract'" />
    <PauseOverlay v-if="store.paused" />

    <!-- Rotationen: väntar / lek (overlay; "Testgrupp X — tryck" visas av entrén) -->
    <RotationScreens :station-title="STATION_TITLE">
      <template #lek><MinnestestLek :side="mySide" :names="lekNames" /></template>
    </RotationScreens>
    <LekStandalone v-if="lekPreview"><MinnestestLek :side="mySide" :names="lekNames" /></LekStandalone>
    <!-- Ljusets förhandsvisning (bara med ?ljus=visa) -->
    <LjusRemsa />
    <!-- Regis filmer (trailern) över allt, bara i filmens fas -->
    <!-- Incheckningen: "Ta ditt band" medan regi står i incheckningen -->
    <IncheckningScreen :station-title="STATION_TITLE" :side-labels="{ A: ENTRE.sides?.A?.label, B: ENTRE.sides?.B?.label }" />
    <FilmOverlay />
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

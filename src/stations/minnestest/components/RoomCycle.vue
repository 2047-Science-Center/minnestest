<script setup lang="ts">
/**
 * ETT VALVRUM. Flödet, ett rum:
 *   scenario (rummets scen + dilemma-text bit för bit + öppen fråga)
 *   → countdown → talk ×3 (en deltagare i taget, ~25 s, countdown emellan,
 *     /assess pipelinas direkt när var och en är klar)
 *   → reveal: scenario-rutan försvinner → PORTEN → "VALDI ÖVERVÄGER" på dörren
 *     → per-deltagare ✓/✗ + förtroendemätaren rör sig + Valdis utlåtande
 *     → dörren ÖPPNAS (nästa rum) eller ACCESS DENIED (slut).
 * Övningsrummet kör exakt samma maskineri men räknas inte (porten öppnas alltid).
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { config, asset, MODE_COLORS } from '@/config'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useSpeechCapture } from '@/station-kit/capture/useSpeechCapture'

import { useMinnestestStore } from '../store/minnestestStore'
import MicIcon from './MicIcon.vue'
import ConfidenceMeter from './ConfidenceMeter.vue'
import VaultDoor from './VaultDoor.vue'
import ValdiHole from './ValdiHole.vue'

const { t } = useI18n()
const store = useMinnestestStore()

type Sub = 'scenario' | 'countdown' | 'talk' | 'handoff' | 'reveal'
const sub = ref<Sub>('scenario')
const revealPhase = ref<'overvager' | 'landed'>('overvager')

const WINDOW_MS = store.talkSeconds * 1000
const WARN_MS = config.warnAtSeconds * 1000

const capture = useSpeechCapture({ windowMs: WINDOW_MS, lang: config.lang })
const manualText = ref('')

// --- Scenario / rum ---
const scenarioId = computed(() => store.room.id)
const sceneBase = computed(() => store.room.sceneBase)
const clipSrc = computed(() => (sceneBase.value ? asset(`video/${sceneBase.value}.mp4`) : ''))
const posterSrc = computed(() => (sceneBase.value ? asset(`video/${sceneBase.value}.jpg`) : ''))
const context = computed(() => t(`scenario.${scenarioId.value}.context`))
const story = computed(() => t(`scenario.${scenarioId.value}.story`))
const question = computed(() => t(`scenario.${scenarioId.value}.question`))
// Kort ingress i tal-steget som påminner om scenariot ("Max ställde in …").
const recap = computed(() => t(`scenario.${scenarioId.value}.recap`))
const timeHint = computed(() =>
  isHole.value
    ? t('room.time_warning_ld', { s: store.talkSeconds })
    : t('room.time_warning', { s: store.talkSeconds }),
)
const roomName = computed(() => (store.room.color ? t(`room.name.${store.room.color}`) : ''))
const isHole = computed(() => store.reveal === 'hole')

// UI-chrome följer LÄGET (mint i övning, bärnsten i skarpt) — inte rumsfärgen.
// Rummets egen färg bärs av dörr-arten (VaultDoor väljer art via store.room.color).
const modeKey = computed(() => (store.isTutorial ? 'test' : 'live'))
const acc = computed(() => MODE_COLORS[modeKey.value].hex)
const accRgb = computed(() => MODE_COLORS[modeKey.value].rgb)

// --- Deltagare ---
const pIndex = computed(() => store.activeParticipant)
const pName = computed(() => store.participants[pIndex.value] ?? '')
const pNr = computed(() => pIndex.value + 1)
const pTotal = computed(() => config.participants)

// --- countdown / handoff ---
const countdownN = ref(config.countdownFrom)
const handoffN = ref(config.handoffSeconds)
let tickTimer: ReturnType<typeof setInterval> | null = null
// Lögndetektorn: Valdi-hålet bippar lågt medan man talar.
let pulseTimer: ReturnType<typeof setInterval> | null = null
function stopPulse(): void {
  if (pulseTimer) clearInterval(pulseTimer)
  pulseTimer = null
}

// --- talk-tid ---
const warned = ref(false)
const remainingMs = computed(() => capture.remainingMs.value ?? WINDOW_MS)
const warn = computed(() => remainingMs.value <= WARN_MS)
const timeUp = computed(() => remainingMs.value <= 0)
const timeLabel = computed(() => {
  const s = Math.max(0, Math.ceil(remainingMs.value / 1000))
  return `0:${String(s % 60).padStart(2, '0')}`
})
const showManualFallback = computed(() => !capture.supported || Boolean(capture.error.value))

// --- reveal ---
const pending: Promise<void>[] = []
const meterVal = ref<number>(store.confidence)
const meterState = ref<'idle' | 'weighing' | 'landed'>('idle')
const doorState = ref<'closed' | 'overvager' | 'open' | 'denied'>('closed')
// Valdi-hålets tillstånd speglar dörr-tillståndet (open→grön, denied→röd).
const holeState = computed<'idle' | 'overvager' | 'granted' | 'denied'>(() =>
  doorState.value === 'open'
    ? 'granted'
    : doorState.value === 'closed'
      ? 'idle'
      : doorState.value,
)
// Kort "koppla ifrån"-beat (vit-klippet) när revealen börjar, innan övervägandet.
const holeIntro = ref(false)
// "Valdi pratar"-läge: oscilloskopet rör sig medan utlåtandet läses upp.
const holeTalking = ref(false)
const holeRevealState = computed<
  'idle' | 'overvager' | 'granted' | 'deactivate' | 'denied' | 'talking'
>(() => (holeIntro.value ? 'deactivate' : holeTalking.value ? 'talking' : holeState.value))
const showChecks = ref(false)
const showUtlatande = ref(false)
const canProceed = ref(false)
const revealTimers: ReturnType<typeof setTimeout>[] = []
const verdict = computed(() => store.verdict)

// "VALDI ÖVERVÄGER" — en ström av begrepp Valdi "tänker på" (som en AI:s tankeström).
const THINK_TERMS = [
  'empati', 'perspektiv', 'det osagda', 'tonfall', 'ärlighet', 'lojalitet', 'skam',
  'rättvisa', 'omtanke', 'avvägning', 'känsla', 'konsekvens', 'medkänsla', 'tvekan',
  'ansvar', 'relation', 'förlåtelse', 'mod', 'grupptryck', 'sårbarhet', 'hänsyn',
  'orättvisa', 'vänskap', 'plikt', 'osäkerhet', 'mänsklighet',
]
const thinkStream = ref<string[]>([])
let thinkTimer: ReturnType<typeof setInterval> | null = null
function startThinkStream(): void {
  thinkStream.value = []
  let i = Math.floor(Math.random() * THINK_TERMS.length)
  thinkTimer = setInterval(() => {
    i = (i + 1 + Math.floor(Math.random() * 3)) % THINK_TERMS.length
    thinkStream.value.push(THINK_TERMS[i])
    if (thinkStream.value.length > 5) thinkStream.value.shift()
  }, 430)
}
function stopThinkStream(): void {
  if (thinkTimer) clearInterval(thinkTimer)
  thinkTimer = null
}

function collectedAnswer(): string {
  return [capture.transcript.value.trim(), manualText.value.trim()].filter(Boolean).join(' ').trim()
}

function clearTick(): void {
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = null
}
function clearRevealTimers(): void {
  revealTimers.forEach((t) => clearTimeout(t))
  revealTimers.length = 0
}
function later(fn: () => void, ms: number): void {
  revealTimers.push(setTimeout(fn, ms))
}

// --- Beats ---
function enterScenario(): void {
  clearTick()
  clearRevealTimers()
  capture.stop()
  store.activeParticipant = 0
  sub.value = 'scenario'
  manualText.value = ''
  warned.value = false
  meterVal.value = store.confidence
  meterState.value = 'idle'
  doorState.value = 'closed'
  holeIntro.value = false
  holeTalking.value = false
  revealPhase.value = 'overvager'
  showChecks.value = false
  showUtlatande.value = false
  canProceed.value = false
  pending.length = 0
  if (sceneBase.value) audio.bed(`ambience/${sceneBase.value}.mp3`, 0.18, 1200)
  else audio.bedStop(600)
  // Valdi läser upp scenariot (ElevenLabs) medan texten dyker upp.
  void store.speakNpc(`${story.value} ${question.value}`.trim())
}

function ready(): void {
  clearTick()
  store.stopSpeak()
  // Lögndetektorn: "AKTIVERA VALDI" — hålet tänds (ljud) innan nedräkningen.
  if (isHole.value) audio.cue('sfx/sfx-valdi-activate.mp3', 0.9)
  sub.value = 'countdown'
  countdownN.value = config.countdownFrom
  audio.play('blip')
  tickTimer = setInterval(() => {
    countdownN.value -= 1
    if (countdownN.value > 0) audio.play('blip')
    else {
      clearTick()
      startTalk()
    }
  }, 1000)
}

function startTalk(): void {
  sub.value = 'talk'
  warned.value = false
  manualText.value = ''
  capture.reset()
  capture.start()
  // Lögndetektorn: lågt puls-bipp medan man talar (Valdi är aktiv).
  stopPulse()
  if (isHole.value) {
    audio.cue('sfx/sfx-valdi-pulse.mp3', 0.5)
    pulseTimer = setInterval(() => audio.cue('sfx/sfx-valdi-pulse.mp3', 0.5), 3000)
  }
}

function startHandoff(): void {
  sub.value = 'handoff'
  handoffN.value = config.handoffSeconds
  audio.play('confirm')
  tickTimer = setInterval(() => {
    handoffN.value -= 1
    if (handoffN.value > 0) audio.play('blip')
    else {
      clearTick()
      startTalk()
    }
  }, 1000)
}

function lockTalk(): void {
  if (sub.value !== 'talk') return
  capture.stop()
  stopPulse()
  // Lögndetektorn: Valdi avaktiveras (vitt sken-ljud) när man släpper.
  if (isHole.value) audio.cue('sfx/sfx-valdi-deactivate.mp3', 0.9)
  const text = collectedAnswer()
  // Pipelina bedömningen direkt (medan nästa pratar / medan Valdi väger).
  pending.push(store.assessParticipant(pIndex.value, text))
  if (pIndex.value < pTotal.value - 1) {
    store.activeParticipant = pIndex.value + 1
    startHandoff()
  } else {
    void enterReveal()
  }
}

watch(
  () => capture.remainingMs.value,
  (ms) => {
    if (sub.value !== 'talk' || ms == null) return
    if (!warned.value && ms <= WARN_MS) {
      warned.value = true
      audio.play('deny')
    }
    if (ms <= 0) lockTalk()
  },
)

async function enterReveal(): Promise<void> {
  sub.value = 'reveal'
  revealPhase.value = 'overvager'
  doorState.value = 'overvager'
  if (isHole.value) {
    holeIntro.value = true
    later(() => (holeIntro.value = false), 1600)
  }
  startThinkStream()
  meterState.value = 'weighing'
  meterVal.value = store.confidence
  // Scenens ljudbild → lågt valvbrum under porten.
  audio.bed('ambience/mt_valv_hum.mp3', 0.12, 800)
  audio.play('render')

  const dwell = new Promise<void>((res) => later(() => res(), 2600))
  await Promise.allSettled(pending)
  await store.computeVerdict()
  await dwell
  if (sub.value !== 'reveal') return
  land()
}

function land(): void {
  revealPhase.value = 'landed'
  stopThinkStream()
  const v = verdict.value
  if (!v) return
  // Spänningsriser byggs mot portens utslag (toppar när dörren börjar röra sig).
  audio.play('vaultriser')
  const doorAt = 300 + v.perChecks.length * 450 + 1500
  // 1) Per-deltagare ✓/✗ (pling per spelare).
  showChecks.value = true
  v.perChecks.forEach((ok, i) => {
    later(() => audio.play(ok ? 'confirm' : 'deny'), 300 + i * 450)
  })
  // 2) Förtroendemätaren rör sig (en gång) på gruppens snitt.
  later(() => {
    meterState.value = 'landed'
    meterVal.value = v.confAfter
  }, 300 + v.perChecks.length * 450 + 300)
  // 3) Valvlåset frigörs strax före (bara människotestets dörr, inte Valdi-hålet).
  if (!isHole.value && v.granted) later(() => audio.play('unlock'), doorAt - 250)
  // 4) Utslaget: människotest = tung valvdörr; lögndetektor = eget verdikt-ljud.
  later(() => {
    doorState.value = v.granted ? 'open' : 'denied'
    if (isHole.value) {
      audio.cue(v.granted ? 'sfx/sfx-ld-granted.mp3' : 'sfx/sfx-ld-denied.mp3', 1.0)
    } else {
      audio.play(v.granted ? 'vaultopen' : 'vaultdenied')
    }
  }, doorAt)
  // 5) Låt utslaget ("MÄNSKLIGT NOG" / ACCESS DENIED) stå ~3 s innan texten.
  later(() => {
    showUtlatande.value = true
    // Lögndetektorn: ringen stillnar, oscilloskopet "pratar" medan rösten läser.
    if (isHole.value) holeTalking.value = true
    // Valdi läser upp sitt korta utlåtande (ElevenLabs) — kul för gruppen.
    void store.speakNpc(verdict.value?.utlatande ?? '').finally(() => {
      canProceed.value = true
    })
  }, doorAt + 3000)
  // Fallback: knappen går alltid att klicka även om rösten är av/fallerar.
  later(() => {
    canProceed.value = true
  }, doorAt + 3000 + 6000)
}

function proceed(): void {
  store.proceedRoom()
}

const proceedCta = computed(() => {
  const v = verdict.value
  if (store.isTutorial) return t('room.to_live')
  if (v && v.granted) return store.isLastRoom ? t('room.see_result') : t('room.next_room')
  return t('room.see_result')
})

// Facilitator-paus: frys aktivt tidsmoment.
watch(
  () => store.paused,
  (p) => {
    if (p) {
      if (sub.value === 'talk') capture.pause()
      else clearTick()
    } else {
      if (sub.value === 'talk') capture.resume()
      else if ((sub.value === 'countdown' || sub.value === 'handoff') && !tickTimer) {
        if (sub.value === 'countdown') ready()
        else startHandoff()
      }
    }
  },
)

// Dilemma-texten bit för bit: en mening per rad, staggrad in.
const storyLines = computed(() =>
  story.value
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean),
)

onMounted(() => enterScenario())
onUnmounted(() => {
  clearTick()
  stopPulse()
  clearRevealTimers()
  stopThinkStream()
  store.stopSpeak()
  capture.stop()
  audio.bedStop(800)
})
</script>

<template>
  <div class="room">
    <!-- BACKDROP: rummets scen (scenario/talk) — porten/hålet tar över i reveal -->
    <template v-if="sub !== 'reveal'">
      <!-- Lögndetektorn: Valdi-hålet pulsar som bakgrund medan man talar -->
      <div v-if="isHole && sub === 'talk'" class="room__hole" aria-hidden="true">
        <ValdiHole state="pulse" :accent="acc" :accent-rgb="accRgb" />
      </div>
      <template v-else>
        <div class="room__bg" aria-hidden="true" />
        <video
          v-if="clipSrc"
          :key="clipSrc"
          class="room__video"
          :src="clipSrc"
          :poster="posterSrc"
          autoplay
          loop
          muted
          playsinline
          aria-hidden="true"
        />
      </template>
      <div class="room__scrim" aria-hidden="true" />
    </template>

    <!-- SCENARIO — dilemma-text bit för bit + öppen fråga -->
    <section v-if="sub === 'scenario'" class="scenario">
      <div class="scenario__card">
        <p class="scenario__eyebrow">
          {{ store.isTutorial ? t('room.tutorial_tag') : t('room.plate', { n: store.roomNr }) + (roomName ? ' · ' + roomName : '') }}
        </p>
        <p v-if="context" class="scenario__context">{{ context }}</p>
        <p
          v-for="(line, i) in storyLines"
          :key="i"
          class="scenario__line"
          :style="{ animationDelay: 0.3 + i * 0.7 + 's' }"
        >
          {{ line }}
        </p>
        <h1
          class="scenario__question ink-strong"
          :style="{ animationDelay: 0.3 + storyLines.length * 0.7 + 's' }"
        >
          {{ question }}
        </h1>
        <button
          class="crt-button crt-button--strong scenario__go"
          :style="{ animationDelay: 0.3 + (storyLines.length + 1) * 0.7 + 's' }"
          @click="ready()"
        >
          {{ isHole ? t('hole.activate') : t('room.ready') }} ▸
        </button>
      </div>
    </section>

    <!-- COUNTDOWN (inför en deltagare) -->
    <section v-else-if="sub === 'countdown'" class="cd">
      <p class="cd__who">{{ t('room.up_next', { name: pName, nr: pNr, total: pTotal }) }}</p>
      <p class="cd__hint">{{ timeHint }}</p>
      <div class="cd__num" :key="countdownN">{{ countdownN }}</div>
    </section>

    <!-- HANDOFF (nästa deltagare) -->
    <section v-else-if="sub === 'handoff'" class="cd">
      <p class="cd__done">✓ {{ t('room.handoff_done') }}</p>
      <p class="cd__who">{{ t('room.up_next', { name: pName, nr: pNr, total: pTotal }) }}</p>
      <p class="cd__hint">{{ timeHint }}</p>
      <div class="cd__num" :key="handoffN">{{ handoffN }}</div>
    </section>

    <!-- TALK — en deltagare, mik -->
    <section v-else-if="sub === 'talk'" class="talk">
      <header class="talk__top">
        <div class="talk__who">
          <span class="talk__badge">{{ t('room.participant', { nr: pNr, total: pTotal }) }}</span>
          <span class="talk__name ink-strong">{{ pName }}</span>
        </div>
        <div class="talk__timer" :class="{ 'talk__timer--warn': warn }">{{ timeLabel }}</div>
      </header>
      <p v-if="recap" class="talk__recap">{{ recap }}</p>
      <div class="talk__live">
        <p class="talk__transcript" :class="{ 'talk__transcript--empty': !capture.transcript.value }">
          {{ capture.transcript.value || question }}
        </p>
      </div>
      <div class="talk__foot">
        <span class="talk__mic"><MicIcon /> {{ t('step.mic_active') }}</span>
        <span v-if="warn && !timeUp" class="talk__warn">{{ t('step.warn') }}</span>
        <span v-if="timeUp" class="talk__warn">{{ t('step.time_up') }}</span>
        <button class="crt-button crt-button--strong talk__done" @click="lockTalk()">
          {{ t('room.talk_done') }} ▸
        </button>
      </div>
      <template v-if="showManualFallback">
        <p v-if="!capture.supported" class="talk__nospeech">{{ t('step.no_speech') }}</p>
        <p v-else class="talk__nospeech talk__nospeech--err">{{ t(`step.mic_err.${capture.error.value}`) }}</p>
        <textarea v-model="manualText" class="talk__manual" :placeholder="t('step.manual_placeholder')" rows="2" />
      </template>
    </section>

    <!-- REVEAL — porten + Valdi överväger → utslag -->
    <section v-else class="reveal">
      <div class="reveal__door">
        <ValdiHole v-if="isHole" :state="holeRevealState" :accent="acc" :accent-rgb="accRgb" />
        <VaultDoor
          v-else
          :state="doorState"
          :accent="acc"
          :accent-rgb="accRgb"
          :color="store.room.color ?? 'bla'"
          :room-nr="store.roomNr"
          :room-name="roomName"
          :tutorial="store.isTutorial"
        />
      </div>

      <!-- Valdis tankeström (begrepp dyker upp medan den överväger) -->
      <div v-if="revealPhase === 'overvager'" class="reveal__think" aria-hidden="true">
        <span v-for="(w, i) in thinkStream" :key="w + '-' + i" class="reveal__think-term">{{ w }}</span>
      </div>

      <div class="reveal__panel">
        <!-- Per-deltagare ✓/✗ -->
        <div v-if="showChecks && verdict" class="reveal__checks">
          <span
            v-for="(ok, i) in verdict.perChecks"
            :key="i"
            class="reveal__chk"
            :class="ok ? 'is-ok' : 'is-no'"
            :style="{ animationDelay: i * 0.45 + 's' }"
          >
            {{ store.participants[i] }} {{ ok ? '✓' : '✗' }}
          </span>
        </div>

        <!-- Förtroendemätaren -->
        <ConfidenceMeter :value="meterVal" :state="meterState" />

        <!-- Valdis utlåtande (stagger-ramp) -->
        <p v-if="showUtlatande && verdict" class="reveal__utlatande">{{ verdict.utlatande }}</p>

        <button
          v-if="canProceed"
          class="crt-button crt-button--strong reveal__go"
          @click="proceed()"
        >
          {{ proceedCta }} ▸
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.room {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.room__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at center, rgba(var(--mode-accent-rgb), 0.22), var(--color-background) 72%);
}
.room__video {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}
.room__hole {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.room__scrim {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.38) 45%, rgba(0, 0, 0, 0.78) 100%);
}

/* ---------- SCENARIO ---------- */
.scenario {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
.scenario__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  width: min(94%, 60ch);
  padding: 1.4rem;
  margin: auto;
}
.scenario__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: 0.22em;
  font-size: 0.85rem;
  color: var(--color-primary);
  margin: 0;
  animation: r-in 0.5s var(--ease-out, ease-out) both;
}
.scenario__context {
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  font-size: 1rem;
  margin: 0;
  animation: r-in 0.5s var(--ease-out, ease-out) 0.15s both;
}
.scenario__line {
  color: var(--color-ink-strong);
  font-size: clamp(1.1rem, 2.4vw, 1.55rem);
  line-height: 1.45;
  max-width: 48ch;
  margin: 0;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.85);
  animation: r-in 0.6s var(--ease-out, ease-out) both;
}
.scenario__question {
  font-family: var(--font-retro);
  font-size: clamp(1.8rem, 5vw, 3rem);
  line-height: 1.1;
  color: var(--color-primary);
  text-shadow: var(--glow-soft), 0 2px 16px rgba(0, 0, 0, 0.85);
  margin: 0.3rem 0 0;
  animation: r-in 0.6s var(--ease-out, ease-out) both;
}
.scenario__go {
  margin-top: 0.5rem;
  animation: r-in 0.5s var(--ease-out, ease-out) both;
}

/* ---------- COUNTDOWN / HANDOFF ---------- */
.cd {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  text-align: center;
}
.cd__done {
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  color: var(--color-lag2, #7ad14f);
  margin: 0;
}
.cd__who {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4.5vw, 2.6rem);
  color: var(--color-ink-strong);
  margin: 0;
}
.cd__hint {
  font-family: var(--font-mono);
  color: var(--color-ink-muted);
  margin: 0;
}
.cd__num {
  font-family: var(--font-retro);
  font-size: clamp(4.5rem, 16vw, 9rem);
  line-height: 1;
  color: var(--color-primary);
  text-shadow: var(--glow-strong);
  animation: cd-pop 0.9s ease-out;
}
@keyframes cd-pop {
  from {
    transform: scale(1.35);
    opacity: 0.4;
  }
}

/* ---------- TALK ---------- */
.talk {
  position: relative;
  z-index: 3;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.4rem 0.2rem;
}
.talk__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.talk__who {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.talk__badge {
  font-family: var(--font-mono);
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: var(--color-primary);
}
.talk__name {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  line-height: 1;
}
.talk__timer {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-dim);
  border-radius: 6px;
  padding: 0.1em 0.5em;
  white-space: nowrap;
}
.talk__timer--warn {
  color: var(--color-danger, #ff5a5a);
  border-color: var(--color-danger, #ff5a5a);
  animation: blink 0.5s steps(2, start) infinite;
}
.talk__recap {
  text-align: center;
  color: var(--color-ink-muted);
  font-size: 1rem;
  font-style: italic;
  margin: 0;
}
.talk__live {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.talk__transcript {
  font-size: clamp(1.7rem, 3.4vw, 2.6rem);
  line-height: 1.4;
  color: var(--color-ink-strong);
  max-width: 26ch;
  text-align: center;
  margin: 0;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.8);
}
.talk__transcript--empty {
  color: var(--color-ink-muted);
  font-style: italic;
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
}
.talk__foot {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.talk__mic {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-family: var(--font-mono);
  color: var(--color-primary);
  white-space: nowrap;
  animation: mic-pulse 1.3s ease-in-out infinite;
}
.talk__warn {
  font-family: var(--font-retro);
  color: var(--color-danger, #ff5a5a);
  white-space: nowrap;
}
.talk__done {
  margin-left: auto;
}
.talk__nospeech {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  margin: 0;
}
.talk__nospeech--err {
  color: var(--color-danger, #ff5a5a);
}
.talk__manual {
  width: 100%;
  background: #0a0a0a;
  color: var(--color-ink-strong);
  border: 1px solid var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  padding: 0.5rem;
  font-family: var(--font-mono);
  resize: vertical;
}

/* ---------- REVEAL ---------- */
.reveal {
  position: relative;
  z-index: 3;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
/* Porten är full-bleed (klimaxet syns) — panelen overlay:ar nederkanten. */
.reveal__door {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.reveal__panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 2.5rem 0.8rem 0.9rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 55%, rgba(0, 0, 0, 0.55) 80%, transparent 100%);
}
/* Valdis tankeström under övervägandet */
.reveal__think {
  position: absolute;
  left: 0;
  right: 0;
  top: 56%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  pointer-events: none;
}
.reveal__think-term {
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 1.9vw, 1.05rem);
  letter-spacing: 0.1em;
  color: var(--color-primary);
  opacity: 0.22;
  text-shadow: 0 0 10px rgba(var(--mode-accent-rgb), 0.5);
  animation: think-in 0.45s var(--ease-out, ease-out) both;
}
.reveal__think-term:last-child {
  opacity: 1;
  font-size: clamp(1.1rem, 2.6vw, 1.5rem);
}
@keyframes think-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
.reveal__checks {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.reveal__chk {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.2em 0.7em;
  border-radius: 999px;
  border: 1px solid currentColor;
  animation: r-in 0.4s var(--ease-out, ease-out) both;
}
.reveal__chk.is-ok {
  color: var(--color-lag2, #7ad14f);
}
.reveal__chk.is-no {
  color: var(--color-danger, #ff5a3c);
}
.reveal__utlatande {
  max-width: 54ch;
  text-align: center;
  color: var(--color-ink-strong);
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  line-height: 1.5;
  margin: 0;
  animation: r-in 0.6s var(--ease-out, ease-out) both;
}
.reveal__go {
  margin-top: 0.2rem;
}

@keyframes r-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@keyframes mic-pulse {
  50% {
    opacity: 0.4;
  }
}
@keyframes blink {
  50% {
    opacity: 0.4;
  }
}
@media (prefers-reduced-motion: reduce) {
  .scenario__eyebrow,
  .scenario__context,
  .scenario__line,
  .scenario__question,
  .scenario__go,
  .cd__num,
  .talk__mic,
  .talk__timer--warn,
  .reveal__chk,
  .reveal__think-term,
  .reveal__utlatande {
    animation: none;
  }
}
</style>


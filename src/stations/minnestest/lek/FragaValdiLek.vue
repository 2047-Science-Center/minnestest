<script setup lang="ts">
/**
 * 2A "Fråga VALdi" — telefonsidans lek (lila). En person i taget:
 *   välj fråga → lyft luren och berätta om dig själv (15 s) → VALdi tänker →
 *   VALdi svarar PERSONLIGT i luren (eget /lek-anrop + /speak) → nästa person.
 * Offline-reserv (ingen AI/STT): tre snabbval → förskrivet svar (lokal röst, annars text).
 * Avmontering (ny grupp/byte) avbryter anrop + ljud; transkriptet lever bara i RAM.
 * XY-VANTUPPGIFTER.md 2A.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LekPanel from '@/station-kit/lek/LekPanel.vue'
import { useSpeechCapture } from '@/station-kit/capture/useSpeechCapture'
import { audio } from '@/station-kit/audio/AudioEngine'
import { aiAvailable, lekPost, lekSpeak, speakLocal } from './lekAi'
import { BERATTA, BERATTA_MS, SNABBVAL, offlineSvar, threeQuestions } from './lekBank'

type Step = 'valj' | 'prata' | 'snabbval' | 'tanker' | 'svarar' | 'klar'

const step = ref<Step>('valj')
const fragor = ref(threeQuestions())
const fraga = ref('')
const online = ref<boolean | null>(null)
/** Gatewayen nåbar (för VALdi-rösten även när taligenkänningen inte funkar). */
const gateway = ref(false)
const svarText = ref('')
/** Svaret kunde inte spelas upp → visa det som text i stället. */
const visaText = ref(false)
const val = ref<number[]>([])
const count = ref(0)

let ctl = new AbortController()
const cap = useSpeechCapture({ windowMs: BERATTA_MS })
const leftSec = computed(() => Math.ceil((cap.remainingMs.value ?? BERATTA_MS) / 1000))

onMounted(async () => {
  gateway.value = await aiAvailable(ctl.signal)
  online.value = gateway.value && cap.supported
})
onUnmounted(() => {
  ctl.abort()
  cap.reset()
})

function pick(q: string): void {
  audio.play('confirm')
  fraga.value = q
  if (!online.value) {
    val.value = []
    step.value = 'snabbval'
    return
  }
  cap.reset()
  step.value = 'prata'
  cap.start()
}

// Talfönstret slut (eller fel) → skicka.
watch(
  () => cap.isListening.value,
  (on, was) => {
    if (step.value === 'prata' && was && !on) void ask()
  },
)
watch(
  () => cap.error.value,
  (e) => {
    if (step.value !== 'prata' || !e) return
    // Taligenkänningen nådde inte nätet → offline-reserven.
    if (/network|internet|not-allowed|unsupported|service/.test(e)) {
      cap.reset()
      online.value = false
      val.value = []
      step.value = 'snabbval'
    }
  },
)

function stopTalking(): void {
  cap.stop()
}

async function ask(): Promise<void> {
  step.value = 'tanker'
  audio.play('waitping')
  const transcript = cap.transcript.value.trim()
  cap.reset()
  try {
    const r = await lekPost<{ svar: string }>({ kind: 'fraga', question: fraga.value, transcript }, 12_000, ctl.signal)
    await answer(r.svar, true)
  } catch {
    if (ctl.signal.aborted) return
    online.value = false
    gateway.value = false
    val.value = []
    step.value = 'snabbval'
  }
}

function choose(i: number, v: number): void {
  audio.play('blip')
  val.value = [...val.value.slice(0, i), v]
  if (val.value.length >= SNABBVAL.length) void answer(offlineSvar(val.value), gateway.value)
}

async function answer(text: string, viaVoice: boolean): Promise<void> {
  if (ctl.signal.aborted) return
  svarText.value = text
  visaText.value = false
  step.value = 'svarar'
  let ok = viaVoice ? await lekSpeak(text, ctl.signal) : false
  if (!ok && !ctl.signal.aborted) ok = await speakLocal(text, ctl.signal)
  if (ctl.signal.aborted) return
  visaText.value = !ok
  count.value += 1
  step.value = 'klar'
}

function nextPerson(): void {
  svarText.value = ''
  visaText.value = false
  val.value = []
  fragor.value = threeQuestions()
  step.value = 'valj'
}

const hint = computed(() => {
  switch (step.value) {
    case 'valj':
      return 'Lyft luren och välj vad du vill fråga VALdi.'
    case 'prata':
      return BERATTA
    case 'snabbval':
      return 'Svara snabbt — VALdi läser av dig.'
    case 'tanker':
      return 'VALdi tänker …'
    case 'svarar':
      return 'Lyssna i luren.'
    default:
      return 'Lägg på luren — nästa person!'
  }
})
</script>

<template>
  <LekPanel title="FRÅGA VALDI" :hint="hint">
    <!-- 1. VÄLJ FRÅGA -->
    <div v-if="step === 'valj'" class="fv__qs">
      <button v-for="q in fragor" :key="q" class="lek-btn lek-btn--big fv__q" @click="pick(q)">{{ q }}</button>
    </div>

    <!-- 2. PRATA I LUREN -->
    <div v-else-if="step === 'prata'" class="fv__center">
      <p class="fv__q-chosen">”{{ fraga }}”</p>
      <p class="fv__big">☎</p>
      <p class="fv__clock">{{ leftSec }} s</p>
      <button class="lek-btn" @click="stopTalking">Klar ▸</button>
    </div>

    <!-- 2b. OFFLINE: SNABBVAL -->
    <div v-else-if="step === 'snabbval'" class="fv__center">
      <p class="fv__q-chosen">”{{ fraga }}”</p>
      <div v-for="(par, i) in SNABBVAL" :key="i" class="fv__pair" :class="{ 'fv__pair--hidden': i > val.length }">
        <button
          v-for="(lbl, v) in par"
          :key="lbl"
          class="lek-btn"
          :class="{ 'lek-btn--on': val[i] === v }"
          :disabled="i !== val.length"
          @click="choose(i, v)"
        >
          {{ lbl }}
        </button>
      </div>
    </div>

    <!-- 3. VALDI TÄNKER / SVARAR -->
    <div v-else-if="step === 'tanker' || step === 'svarar'" class="fv__center">
      <div class="fv__orb" :class="{ 'fv__orb--talk': step === 'svarar' }" aria-hidden="true" />
      <p class="fv__big-txt">{{ step === 'tanker' ? 'VALdi tänker …' : 'VALdi svarar i luren …' }}</p>
    </div>

    <!-- 4. KLAR -->
    <div v-else class="fv__center">
      <p v-if="visaText" class="fv__answer">{{ svarText }}</p>
      <p v-else class="fv__big-txt">Det var VALdis svar till dig.</p>
      <button class="lek-btn lek-btn--big" @click="nextPerson">Nästa person ▸</button>
    </div>

    <template #foot>
      <span v-if="online === false">VALdi är offline — snabbläge</span>
      <span v-if="count">{{ count }} {{ count === 1 ? 'fråga' : 'frågor' }} besvarade</span>
    </template>
  </LekPanel>
</template>

<style scoped>
.fv__qs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
  max-width: 44rem;
  margin: 0 auto;
  width: 100%;
}
.fv__q {
  text-align: center;
}
.fv__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}
.fv__q-chosen {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  color: #b48cff;
}
.fv__big {
  margin: 0;
  font-size: 5rem;
  animation: fv-ring 1.2s ease-in-out infinite;
}
.fv__clock {
  margin: 0;
  font-family: var(--font-retro, monospace);
  font-size: 3rem;
  color: #b48cff;
}
.fv__pair {
  display: flex;
  gap: 1rem;
}
.fv__pair--hidden {
  visibility: hidden;
}
.fv__orb {
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  background: radial-gradient(circle, #e2d2ff 0%, #b48cff 40%, rgba(180, 140, 255, 0) 72%);
  animation: fv-think 1.4s ease-in-out infinite;
}
.fv__orb--talk {
  animation-duration: 0.45s;
}
.fv__big-txt {
  margin: 0;
  font-size: clamp(1.6rem, 3.4vw, 2.4rem);
}
.fv__answer {
  margin: 0;
  max-width: 40ch;
  font-size: clamp(1.4rem, 3vw, 2rem);
  line-height: 1.35;
}
@keyframes fv-think {
  0%, 100% { transform: scale(0.85); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
}
@keyframes fv-ring {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fv__orb, .fv__big { animation: none; }
}
</style>

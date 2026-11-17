<script setup lang="ts">
/**
 * 2C "Håll tråden" — lögnsidans lek (lila). En i taget pratar om ett ämne så länge
 * som möjligt. VALdi surrar vid TYSTNAD (lokalt, ljudnivån — funkar offline) och när
 * man GLIDER IVÄG från ämnet (online: kort /lek-koll var 5:e sekund på transkriptet).
 * Offline = bara tystnadsregeln ("Tysta inte!"). Topplistan finns bara i RAM.
 * XY-VANTUPPGIFTER.md 2C.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import LekPanel from '@/station-kit/lek/LekPanel.vue'
import { pickIndex } from '@/station-kit/lek/lekSync'
import { useSpeechCapture } from '@/station-kit/capture/useSpeechCapture'
import { audio } from '@/station-kit/audio/AudioEngine'
import { aiAvailable, lekPost } from './lekAi'
import { AMNEN, TRAD, feedLevel, silenceThreshold, topplista, type SilenceState, type TradResultat } from './lekBank'

defineProps<{
  /** Namn på den här sidans deltagare (tom → "Spelare N"). */
  names: string[]
}>()

type Step = 'redo' | 'nedrakning' | 'prata' | 'surr'

const step = ref<Step>('redo')
const amne = ref(pickIndex(AMNEN.length))
const vem = ref<string>('')
const count = ref(3)
const elapsed = ref(0)
const level = ref(0)
const online = ref<boolean | null>(null)
const resultat = ref<TradResultat[]>([])
const senaste = ref<TradResultat | null>(null)
const valdiRad = ref('')
const micFel = ref(false)

const lista = computed(() => topplista(resultat.value))
const sek = (ms: number) => (ms / 1000).toFixed(1).replace('.', ',')

let ctl = new AbortController()
const cap = useSpeechCapture()

// --- Ljudnivå (lokalt, ingen nätberoende) ---
let stream: MediaStream | null = null
let actx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let buf: Float32Array | null = null
let loopTimer: ReturnType<typeof setInterval> | null = null
let sil: SilenceState = { floor: 0.005, lastVoiceAt: 0, startedAt: 0 }
let floorSamples: number[] = []
let startedAt = 0
let lastDriftAt = 0
let driftBusy = false
let sentChars = 0
let timers: ReturnType<typeof setTimeout>[] = []

async function openMic(): Promise<boolean> {
  if (analyser) return true
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } })
    actx = new AudioContext()
    const src = actx.createMediaStreamSource(stream)
    analyser = actx.createAnalyser()
    analyser.fftSize = 1024
    buf = new Float32Array(analyser.fftSize)
    src.connect(analyser)
    return true
  } catch {
    micFel.value = true
    return false
  }
}
function rms(): number {
  if (!analyser || !buf) return 0
  analyser.getFloatTimeDomainData(buf as Float32Array<ArrayBuffer>)
  let s = 0
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / buf.length)
}
function closeMic(): void {
  if (loopTimer) clearInterval(loopTimer)
  loopTimer = null
  stream?.getTracks().forEach((t) => t.stop())
  void actx?.close().catch(() => undefined)
  stream = null
  actx = null
  analyser = null
}

onMounted(async () => {
  online.value = (await aiAvailable(ctl.signal)) && cap.supported
})
onUnmounted(() => {
  ctl.abort()
  timers.forEach(clearTimeout)
  cap.reset()
  closeMic()
})

async function start(): Promise<void> {
  if (!(await openMic())) return
  void actx?.resume()
  audio.play('confirm')
  step.value = 'nedrakning'
  count.value = 3
  floorSamples = []
  // setInterval (inte rAF) → mätningen fortsätter även om fönstret inte har fokus.
  if (loopTimer) clearInterval(loopTimer)
  loopTimer = setInterval(() => {
    const v = rms()
    level.value = v
    if (step.value === 'nedrakning') floorSamples.push(v)
    if (step.value === 'prata') tickTalk(v)
  }, 40)
  for (let i = 1; i <= 3; i++) {
    timers.push(
      setTimeout(() => {
        count.value = 3 - i
        if (i < 3) audio.play('tick')
        else beginTalk()
      }, i * 1000),
    )
  }
}

function beginTalk(): void {
  const sorted = floorSamples.slice().sort((a, b) => a - b)
  const floor = sorted[Math.floor(sorted.length * 0.5)] ?? 0.005
  startedAt = performance.now()
  sil = { floor, lastVoiceAt: startedAt, startedAt }
  lastDriftAt = startedAt
  sentChars = 0
  elapsed.value = 0
  valdiRad.value = ''
  audio.play('tickfinal')
  step.value = 'prata'
  if (online.value) {
    cap.reset()
    cap.start()
  }
}

function tickTalk(v: number): void {
  const now = performance.now()
  elapsed.value = now - startedAt
  const r = feedLevel(sil, v, now)
  sil = r.state
  if (r.silent) return end('tyst')
  if (elapsed.value >= TRAD.maxMs) return end('max')
  if (online.value && !driftBusy && elapsed.value >= TRAD.driftFirstMs && now - lastDriftAt >= TRAD.driftEveryMs) {
    lastDriftAt = now
    void checkDrift()
  }
}

async function checkDrift(): Promise<void> {
  const full = cap.transcript.value
  // Det nya sedan förra kollen + lite sammanhang.
  const snippet = full.slice(Math.max(0, Math.min(sentChars, full.length) - 80))
  if (snippet.trim().split(/\s+/).length < 6) return
  sentChars = full.length
  driftBusy = true
  const at = startedAt
  try {
    const r = await lekPost<{ drift: boolean; rad: string }>(
      { kind: 'drift', topic: AMNEN[amne.value], transcript: snippet },
      6000,
      ctl.signal,
    )
    // Svaret gäller bara om samma tur fortfarande pågår.
    if (r.drift && step.value === 'prata' && startedAt === at) {
      valdiRad.value = r.rad
      end('drift')
    }
  } catch {
    /* timeout/offline: tystnadsregeln gäller ändå */
  } finally {
    driftBusy = false
  }
}

function end(orsak: TradResultat['orsak']): void {
  if (step.value !== 'prata') return
  cap.reset()
  const res: TradResultat = {
    namn: vem.value || `Spelare ${resultat.value.length + 1}`,
    ms: Math.min(elapsed.value, TRAD.maxMs),
    orsak,
  }
  resultat.value = [...resultat.value, res]
  senaste.value = res
  audio.play(orsak === 'max' ? 'win' : 'deny')
  step.value = 'surr'
}

function next(): void {
  amne.value = pickIndex(AMNEN.length, amne.value)
  vem.value = ''
  senaste.value = null
  step.value = 'redo'
}

const ORSAK: Record<TradResultat['orsak'], string> = {
  tyst: 'Du tystnade!',
  drift: 'Du gled iväg från ämnet!',
  max: 'Tråden höll hela vägen!',
  stopp: 'Stopp.',
}
const hint = computed(() => {
  if (step.value === 'redo') return 'Prata om ämnet så länge du kan. Tystna inte!'
  if (step.value === 'nedrakning') return 'Var tyst … snart kör vi.'
  if (step.value === 'prata') return online.value ? 'Fortsätt prata — håll dig till ämnet!' : 'Fortsätt prata — tystna inte!'
  return senaste.value ? ORSAK[senaste.value.orsak] : ''
})
const meter = computed(() => Math.min(1, level.value / (silenceThreshold(sil.floor) * 3)))
</script>

<template>
  <LekPanel title="HÅLL TRÅDEN" :hint="hint">
    <!-- REDO -->
    <div v-if="step === 'redo'" class="ht__center">
      <p class="ht__k">ÄMNE</p>
      <p class="ht__amne">{{ AMNEN[amne] }}</p>
      <div v-if="names.length" class="ht__names">
        <span class="ht__k">Vem pratar?</span>
        <button
          v-for="n in names"
          :key="n"
          class="lek-btn"
          :class="{ 'lek-btn--on': vem === n }"
          @click="vem = vem === n ? '' : n"
        >
          {{ n }}
        </button>
      </div>
      <div class="ht__row">
        <button class="lek-btn lek-btn--big" @click="start">Starta ▸</button>
        <button class="lek-btn lek-btn--ghost" @click="amne = pickIndex(AMNEN.length, amne)">Nytt ämne</button>
      </div>
      <p v-if="micFel" class="ht__err">Mikrofonen svarar inte — kolla att den är inkopplad.</p>
    </div>

    <!-- NEDRÄKNING / PRATA -->
    <div v-else-if="step === 'nedrakning' || step === 'prata'" class="ht__center">
      <p class="ht__amne">{{ AMNEN[amne] }}</p>
      <p class="ht__clock">{{ step === 'nedrakning' ? count : sek(elapsed) }}</p>
      <div class="ht__meter" aria-hidden="true"><span :style="{ transform: `scaleX(${meter})` }" /></div>
    </div>

    <!-- SURR / RESULTAT -->
    <div v-else class="ht__center">
      <p class="ht__clock">{{ senaste ? sek(senaste.ms) : '' }} s</p>
      <p v-if="valdiRad" class="ht__valdi">VALdi: ”{{ valdiRad }}”</p>
      <ol class="ht__list">
        <li v-for="(r, i) in lista" :key="i" :class="{ 'ht__me': r === senaste }">
          <span>{{ r.namn }}</span><span>{{ sek(r.ms) }} s</span>
        </li>
      </ol>
      <button class="lek-btn lek-btn--big" @click="next">Nästa person ▸</button>
    </div>

    <template #foot>
      <span v-if="online === false">VALdi är offline — bara tystnadsregeln gäller</span>
    </template>
  </LekPanel>
</template>

<style scoped>
.ht__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}
.ht__k {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.16em;
  color: #b48cff;
}
.ht__amne {
  margin: 0;
  font-family: var(--font-retro, monospace);
  font-size: clamp(1.8rem, 4.4vw, 3.2rem);
  line-height: 1.15;
}
.ht__names {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
}
.ht__row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.ht__clock {
  margin: 0;
  font-family: var(--font-retro, monospace);
  font-size: clamp(4rem, 12vw, 8rem);
  color: #b48cff;
  text-shadow: 0 0 24px rgba(180, 140, 255, 0.7);
}
.ht__meter {
  width: min(30rem, 80%);
  height: 0.9rem;
  border: 1px solid #b48cff;
  border-radius: 999px;
  overflow: hidden;
}
.ht__meter span {
  display: block;
  height: 100%;
  background: #b48cff;
  transform-origin: left;
  transition: transform 0.08s linear;
}
.ht__valdi {
  margin: 0;
  font-size: 1.4rem;
  max-width: 40ch;
}
.ht__list {
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 18rem;
  font-size: 1.3rem;
}
.ht__list li {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0.2rem 0.6rem;
}
.ht__me {
  color: #1a0f2c;
  background: #b48cff;
  border-radius: 6px;
}
.ht__err {
  margin: 0;
  color: #ff8a7a;
}
</style>

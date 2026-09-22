/**
 * Talfångst för stationerna — webbläsarens Web Speech API (samma Chrome-väg
 * som Emils appar). Bygger transkriptet LOKALT och kontinuerligt, så en kort
 * nätsvacka aldrig tappar det som redan sagts; bara /assess kräver nät.
 *
 * - `start()` / `stop()` styr en lyssningssession.
 * - `windowMs` (valfritt): sluter fönstret automatiskt efter N ms (per-steg
 *   ~60 s) och exponerar `remainingMs` så UI:t (diegetisk mätare, 10-sek-
 *   varning) kan följa samma klocka.
 * - Recognition startas om tyst om motorn stänger mitt i fönstret (Chrome
 *   avslutar efter tystnad) — transkriptet ackumuleras oavbrutet.
 *
 * INGEN text lämnar klienten härifrån; det är anroparen som skickar
 * `finalTranscript` vidare till /assess när steget är klart.
 */
import { ref, computed, onUnmounted, readonly, type Ref } from 'vue'
import { getLang, type Lang } from '../i18n'

/** Minsta yta av Web Speech vi använder (typerna finns inte i lib.dom brett). */
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: unknown) => void) | null
  onend: (() => void) | null
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>
}
type RecognitionCtor = new () => SpeechRecognitionLike

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** i18n-språk → BCP-47 för taligenkänning. */
function speechLang(lang: Lang): string {
  switch (lang) {
    case 'no':
      return 'nb-NO'
    case 'svorsk':
    case 'sv':
    default:
      return 'sv-SE'
  }
}

export interface SpeechCaptureOptions {
  /** Auto-stäng fönstret efter så här många ms (t.ex. 60000). Utelämnad = manuell. */
  windowMs?: number
  /** Override av språk; annars kitets aktiva i18n-språk. */
  lang?: Lang
}

export interface SpeechCapture {
  /** Web Speech finns i webbläsaren. Falskt → visa manuell fallback. */
  supported: boolean
  /** Lyssnar just nu. */
  isListening: Readonly<Ref<boolean>>
  /** Färdigtolkade meningar (det som skickas vidare). */
  finalTranscript: Readonly<Ref<string>>
  /** Live-tolkning som ännu inte fastställts (för UI). */
  interimTranscript: Readonly<Ref<string>>
  /** final + interim, bekvämt för visning. */
  transcript: Readonly<Ref<string>>
  /** ms kvar av fönstret (om windowMs satt), annars null. */
  remainingMs: Readonly<Ref<number | null>>
  start(): void
  stop(): void
  /** Nollställ transkript inför nästa steg. */
  reset(): void
}

export function useSpeechCapture(opts: SpeechCaptureOptions = {}): SpeechCapture {
  const Ctor = recognitionCtor()
  const supported = Ctor !== null

  const isListening = ref(false)
  const finalTranscript = ref('')
  const interimTranscript = ref('')
  const remainingMs = ref<number | null>(opts.windowMs ?? null)

  const transcript = computed(() =>
    (finalTranscript.value + ' ' + interimTranscript.value).trim(),
  )

  let rec: SpeechRecognitionLike | null = null
  let wantOn = false // vi vill lyssna (för tyst omstart efter onend)
  let windowTimer: ReturnType<typeof setTimeout> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  let windowEndsAt = 0

  function buildRec(): SpeechRecognitionLike | null {
    if (!Ctor) return null
    const r = new Ctor()
    r.lang = speechLang(opts.lang ?? getLang())
    r.continuous = true
    r.interimResults = true
    r.onresult = (e: SpeechRecognitionEventLike) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        const text = res[0].transcript
        if (res.isFinal) finalTranscript.value += text
        else interim += text
      }
      interimTranscript.value = interim
    }
    r.onerror = () => {
      // 'no-speech'/'aborted' m.fl. är ofarliga — onend hanterar omstart.
    }
    r.onend = () => {
      interimTranscript.value = ''
      // Chrome stänger efter tystnad; starta om tyst om fönstret lever kvar.
      if (wantOn) {
        try {
          r.start()
        } catch {
          /* redan igång / race — ignorera */
        }
      } else {
        isListening.value = false
      }
    }
    return r
  }

  function start(): void {
    if (!supported || isListening.value) return
    wantOn = true
    isListening.value = true
    rec = buildRec()
    try {
      rec?.start()
    } catch {
      /* ignore */
    }
    if (opts.windowMs != null) {
      windowEndsAt = Date.now() + opts.windowMs
      remainingMs.value = opts.windowMs
      tickTimer = setInterval(() => {
        remainingMs.value = Math.max(0, windowEndsAt - Date.now())
      }, 100)
      windowTimer = setTimeout(() => stop(), opts.windowMs)
    }
  }

  function stop(): void {
    wantOn = false
    isListening.value = false
    if (windowTimer) {
      clearTimeout(windowTimer)
      windowTimer = null
    }
    if (tickTimer) {
      clearInterval(tickTimer)
      tickTimer = null
    }
    if (opts.windowMs != null) remainingMs.value = 0
    // Fånga sista interim som final så inget tappas.
    if (interimTranscript.value.trim()) {
      finalTranscript.value += interimTranscript.value
      interimTranscript.value = ''
    }
    try {
      rec?.stop()
    } catch {
      /* ignore */
    }
    rec = null
  }

  function reset(): void {
    finalTranscript.value = ''
    interimTranscript.value = ''
    remainingMs.value = opts.windowMs ?? null
  }

  onUnmounted(() => {
    wantOn = false
    if (windowTimer) clearTimeout(windowTimer)
    if (tickTimer) clearInterval(tickTimer)
    try {
      rec?.abort()
    } catch {
      /* ignore */
    }
  })

  return {
    supported,
    isListening: readonly(isListening),
    finalTranscript: readonly(finalTranscript),
    interimTranscript: readonly(interimTranscript),
    transcript: readonly(transcript),
    remainingMs: readonly(remainingMs),
    start,
    stop,
    reset,
  }
}

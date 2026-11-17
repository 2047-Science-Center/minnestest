/**
 * Lek-läget på station 2 — AI-sömmen mot gatewayen (/lek + /speak) med HÅRDA
 * tidsgränser och avbrott. Allt är best-effort: fel/timeout → anroparen faller
 * tillbaka på offline-varianten (XY-VANTUPPGIFTER.md §0.6). Inga namn skickas.
 */
import { config } from '@/config'

const base = (): string => config.assess.baseUrl.replace(/\/+$/, '')

/** Timeout + extern avbrytning i en och samma signal. */
function withTimeout(ms: number, outer?: AbortSignal): { signal: AbortSignal; done: () => void } {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  const onOuter = () => ctl.abort()
  outer?.addEventListener('abort', onOuter)
  return {
    signal: ctl.signal,
    done: () => {
      clearTimeout(t)
      outer?.removeEventListener('abort', onOuter)
    },
  }
}

/** Gatewayen nåbar OCH har en AI-nyckel? (Snabb koll när leken startar.) */
export async function aiAvailable(signal?: AbortSignal): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false
  const w = withTimeout(1500, signal)
  try {
    const r = await fetch(`${base()}/health`, { signal: w.signal })
    if (!r.ok) return false
    const j = (await r.json()) as { keyed?: boolean }
    return j.keyed === true
  } catch {
    return false
  } finally {
    w.done()
  }
}

/** POST /lek. Kastar vid fel/timeout. */
export async function lekPost<T>(body: Record<string, unknown>, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  const w = withTimeout(timeoutMs, signal)
  try {
    const r = await fetch(`${base()}/lek`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: w.signal,
    })
    if (!r.ok) throw new Error(`lek ${r.status}`)
    return (await r.json()) as T
  } finally {
    w.done()
  }
}

/**
 * Läs upp en text (ElevenLabs via /speak; VALdi-rösten). Spelas i NUC:ens
 * ljudutgång = luren på telefonsidan. Resolvar true om ljudet spelades klart,
 * false vid fel/timeout/avbrott. `signal` avbryter både hämtning och uppspelning.
 */
export async function lekSpeak(text: string, signal?: AbortSignal, timeoutMs = 10_000): Promise<boolean> {
  if (!text.trim()) return false
  const w = withTimeout(timeoutMs, signal)
  let url: string | null = null
  try {
    const r = await fetch(`${base()}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configId: 'manniskotest', text }),
      signal: w.signal,
    })
    if (!r.ok) return false
    url = URL.createObjectURL(await r.blob())
    w.done()
    if (signal?.aborted) return false
    return await playUrl(url, signal)
  } catch {
    return false
  } finally {
    w.done()
    if (url) URL.revokeObjectURL(url)
  }
}

/** Spela en ljudfil; avbryts av signal. */
export function playUrl(url: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const el = new Audio(url)
    const stop = () => {
      try {
        el.pause()
      } catch {
        /* ignore */
      }
      resolve(false)
    }
    if (signal?.aborted) return resolve(false)
    signal?.addEventListener('abort', stop, { once: true })
    el.onended = () => resolve(true)
    el.onerror = () => resolve(false)
    el.play().catch(() => resolve(false))
  })
}

/** Webbläsarens inbyggda röst (offline-reserv om den finns). true = talade klart. */
export function speakLocal(text: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth) return resolve(false)
    const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('sv'))
    if (!voices.length) return resolve(false)
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voices[0]
    u.lang = voices[0].lang
    u.onend = () => resolve(true)
    u.onerror = () => resolve(false)
    signal?.addEventListener(
      'abort',
      () => {
        synth.cancel()
        resolve(false)
      },
      { once: true },
    )
    synth.speak(u)
  })
}

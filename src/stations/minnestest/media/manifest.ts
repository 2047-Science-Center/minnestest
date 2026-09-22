/**
 * Media-manifest (innehållsspec §5). MediaSlot läser härifrån: utan `src`
 * renderas placeholder-rutan `[VIDEO: id — brief]`; droppar man riktig media i
 * public/media/ och sätter `src` fylls den in. Layout färdig, media utbytbar.
 *
 * `durationMs` på eskaleringsklipp = latensmask-GOLV: delruta C dröjer minst så
 * länge (och tills /assess-svaret är klart). Sätt kort i pilot; riktiga klipp
 * är längre (~20 s enligt §5) men det är en media-fråga, inte en flödesfråga.
 */
import { asset } from '@/config'

export type MediaType = 'video' | 'video-loop' | 'image'

export interface MediaEntry {
  typ: MediaType
  aspect: '16:9' | '1:1'
  brief: string
  durationMs?: number
  /** Filnamn i public/media/ (utan sökväg). Saknas → placeholder. */
  file?: string
}

export interface ResolvedMedia extends MediaEntry {
  id: string
  /** Full url om `file` satt, annars null (→ placeholder). */
  src: string | null
}

const MEDIA: Record<string, MediaEntry> = {
  // --- Ström (metodspecialist) — skarpt ---
  attract_loop: { typ: 'video-loop', aspect: '16:9', brief: 'Dämpad bunker, flimrande monitorer' },
  roll_metodspecialist: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den händiga som fixar/bygger, självsäker' },
  roll_doktorand: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den som analyserar/ser mönster, lugn, klok' },
  overgang_valv: { typ: 'video', aspect: '16:9', brief: 'Glitch-svep ut/in ur valvet', durationMs: 4000 },
  intro_strommen: { typ: 'video', aspect: '16:9', brief: 'Skymning, lampor slocknar över hem + stad' },
  hem_oversikt: { typ: 'image', aspect: '16:9', brief: 'Genomskärning av vanligt hem i skymning, resurser synliga' },
  steg1_narr: { typ: 'video', aspect: '16:9', brief: 'Ljuset slocknar, hissen stannar, solen går ner' },
  steg1_eskalering: { typ: 'video', aspect: '16:9', brief: 'Mörkret lägger sig, ficklampor famlar, kylan kryper in', durationMs: 6000 },
  steg2_eskalering: { typ: 'video', aspect: '16:9', brief: 'Morgon dag 2, mörka fönster, grannen (82) knackar', durationMs: 6000 },
  steg3_overgang: { typ: 'video', aspect: '16:9', brief: 'Övergång mot mönstringsutlåtandet', durationMs: 6000 },
  npc_portratt: { typ: 'image', aspect: '1:1', brief: 'NPC:ns ansikte på CRT (mönstringsofficer/mentor)' },
  sorteringshatt_bg: { typ: 'image', aspect: '16:9', brief: 'Dramatisk utskrift/emblem-bakgrund' },

  // --- Internet (doktorand) — STUBB, samma slots ---
  intro_internet: { typ: 'video', aspect: '16:9', brief: '(stubb) Uppkopplingen dör' },
  hem_oversikt_internet: { typ: 'image', aspect: '16:9', brief: '(stubb) Hem, uppkopplat' },
  steg1_narr_internet: { typ: 'video', aspect: '16:9', brief: '(stubb) Nätet dör' },
  steg1_eskalering_internet: { typ: 'video', aspect: '16:9', brief: '(stubb)', durationMs: 6000 },
  steg2_eskalering_internet: { typ: 'video', aspect: '16:9', brief: '(stubb)', durationMs: 6000 },
  steg3_overgang_internet: { typ: 'video', aspect: '16:9', brief: '(stubb)', durationMs: 6000 },
}

/** Slå upp media; returnerar alltid ett objekt (placeholder om okänt id). */
export function media(id: string): ResolvedMedia {
  const entry = MEDIA[id] ?? {
    typ: 'image' as MediaType,
    aspect: '16:9' as const,
    brief: `okänt media-id: ${id}`,
  }
  return {
    id,
    ...entry,
    src: entry.file ? asset(`/media/${entry.file}`) : null,
  }
}

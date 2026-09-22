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
  attract_loop: { typ: 'image', aspect: '16:9', brief: 'Mörk villagata/stad om natten', file: 'attract_loop.png' },
  // Rollklippen (min 3/4) ej klara än — placeholder tills videorna droppas.
  roll_metodspecialist: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den händiga som fixar/bygger, självsäker' },
  roll_doktorand: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den som analyserar/ser mönster, lugn, klok' },
  overgang_valv: { typ: 'video', aspect: '16:9', brief: 'Glitch-svep ut/in ur valvet (CSS-glitch)', durationMs: 4000 },
  intro_strommen: { typ: 'image', aspect: '16:9', brief: 'Familjen tittar ut över mörknande stad', file: 'intro_strommen.png' },
  hem_oversikt: { typ: 'image', aspect: '16:9', brief: 'Genomskärning av hemmet, resurser synliga', file: 'hem_oversikt.png' },
  steg1_narr: { typ: 'image', aspect: '16:9', brief: 'Familjen letar ficklampa när ljuset dör', file: 'steg1_narr.png' },
  steg1_eskalering: { typ: 'image', aspect: '16:9', brief: 'Natt, kallt, ficklampa/filtar, lågt batteri', durationMs: 6000, file: 'steg1_eskalering.png' },
  steg2_eskalering: { typ: 'image', aspect: '16:9', brief: 'Grannen (82) vid dörren, familjen i varmt rum', durationMs: 6000, file: 'steg2_eskalering.png' },
  steg3_overgang: { typ: 'image', aspect: '16:9', brief: 'Alla + grannen varma ihop (upplösning)', durationMs: 6000, file: 'steg3_overgang.png' },
  npc_portratt: { typ: 'image', aspect: '1:1', brief: 'AI-ansikte på CRT (mönstringsofficer)', file: 'npc_portratt.png' },
  sorteringshatt_bg: { typ: 'image', aspect: '16:9', brief: 'Emblem/utskrift-bakgrund', file: 'sorteringshatt_bg.png' },

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

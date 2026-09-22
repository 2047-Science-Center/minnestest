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
  // --- Scenario-neutrala (behålls) ---
  attract_loop: { typ: 'image', aspect: '16:9', brief: 'Familj lämnar brinnande stad i solnedgång, andra flyr på vägen', file: 'flykten_frontbild.png' },
  npc_portratt: { typ: 'image', aspect: '1:1', brief: 'AI-ansikte på CRT (mönstringsofficer)', file: 'npc_portratt.png' },
  sorteringshatt_bg: { typ: 'image', aspect: '16:9', brief: 'Emblem/utskrift-bakgrund', file: 'sorteringshatt_bg.png' },
  // Rollklippen (min 3/4) ej klara än — placeholder tills videorna droppas.
  roll_metodspecialist: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den händiga som fixar/bygger, självsäker' },
  roll_doktorand: { typ: 'video', aspect: '16:9', brief: 'Day-in-a-life: den som analyserar/ser mönster, lugn, klok' },

  // --- Flykt-referensbilder (§8) — placeholders tills flykt_*.jpg droppas.
  //     durationMs = latensmask-golv i analys-rutan. ---
  flykt_1_packa: {
    typ: 'image',
    aspect: '16:9',
    brief: 'Familj i skymning som snabbt packar väskor i ett hem, krigsstämning, handlingskraft',
    durationMs: 6000,
    file: 'flykt_1_packa.png',
  },
  flykt_2_vagar: {
    typ: 'image',
    aspect: '16:9',
    brief: 'En väg full av folk och bilar som flyr i skymning, trängsel',
    durationMs: 6000,
    file: 'flykt_2_vagar.png',
  },
  flykt_3_skog: {
    typ: 'image',
    aspect: '16:9',
    brief: 'Skogsbryn i skymning, familj med väskor som måste slå läger',
    durationMs: 6000,
    file: 'flykt_3_skog.png',
  },

  // --- Fermi-skrotbilar (§7) — placeholders tills media droppas. ---
  intro_fermi: { typ: 'image', aspect: '16:9', brief: 'Skrotgård/bilkyrkogård i skymning, bärnstens-CRT-lins' },
  steg1_bil: { typ: 'image', aspect: '16:9', brief: 'En helt vanlig personbil, ren referens' },
  steg2_trafik: { typ: 'image', aspect: '16:9', brief: 'Trafik/många bilar — antydan om mängd, ett lands flotta' },
  steg3_skrot: { typ: 'image', aspect: '16:9', brief: 'Berg av skrotbilar (pressade kaross-kuber)' },
  esk1_berakning: { typ: 'image', aspect: '16:9', brief: '"Enheten beräknar" — CRT-siffervärld, vikter/vågar', durationMs: 6000 },
  esk2_berakning: { typ: 'image', aspect: '16:9', brief: 'Latensmask steg 2 — bilar räknas, karta över Sverige fylls', durationMs: 6000 },
  esk3_overgang: { typ: 'image', aspect: '16:9', brief: 'Övergång mot mönstringsutlåtandet, siffror växer till ett berg', durationMs: 6000 },
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

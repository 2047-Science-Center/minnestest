/**
 * Station 2 (Människotestet A / Lögndetektorn B) → station-kit/ljus.
 * Design: xy-arkitektur/XY-FEEDBACK-LJUS-LJUD.md §5.2 (händelsetabellen), §3.1 (ljudnamn).
 *
 * DELAD station: en NUC per sida. Sida A skriver bara segment `A`, sida B skriver `B` +
 * `valdi` (VALdi-ringen). Delad vy (pilot, ingen sida) = alla segment, spelet avgör sidan.
 *
 * Rena funktioner här (testas i ljus.test.ts); komponenterna kallar useLjus() med dem.
 */
import { audio, type Sfx } from '@/station-kit/audio/AudioEngine'
import { lageFranRotation, type Gest, type Lage, type LjudNamn } from '@/station-kit/ljus/kanon'
import type { Game } from '@/config'
import type { SideId } from '@/station-kit/entre/types'
import type { Phase } from './store/minnestestStore'

/**
 * Kanon-ljud → appens AudioEngine. Stationsspecifika ljud (valdi-activate/pulse/deactivate,
 * ld-granted/denied, unlock/vaultopen/vaultdenied) spelas kvar av appen själv; gesterna för
 * de händelserna går då med {tyst: true}.
 */
export const LJUD: Record<LjudNamn, Sfx> = {
  kvitto: 'bipstart',
  'kvitto-fel': 'deny',
  ratt: 'confirm',
  fel: 'deny',
  inom: 'confirm', // TODO P1 i XY-FEEDBACK-LJUS-LJUD §8 (generiskt `inom` saknas)
  over: 'deny', // TODO P2 i XY-FEEDBACK-LJUS-LJUD §8 (generiskt `over` saknas)
  varning: 'tick',
  sista: 'tickfinal', // TODO P5 i XY-FEEDBACK-LJUS-LJUD §8 (`sista` lyfts in från stresstestet)
  start: 'live',
  vinst: 'win',
  forlust: 'nobuy', // TODO P3 i XY-FEEDBACK-LJUS-LJUD §8 (generisk förlust-stinger saknas)
  neutral: 'nobuy',
  klar: 'positive', // TODO P4 i XY-FEEDBACK-LJUS-LJUD §8 (övergång till lila lek saknas)
  resultat: 'popup',
  oppnar: 'hatch',
  stanger: 'lockin', // TODO P6 i XY-FEEDBACK-LJUS-LJUD §8 (`stanger` lyfts in från stresstestet)
}

export function spela(l: LjudNamn): void {
  audio.play(LJUD[l])
}

/**
 * Sidans underglow-segment: NUC:ens sida (?sida= / VITE_GAME) om den är satt, annars spelet
 * (delad vy: Människotestet = A, Lögndetektorn = B).
 */
export type Segment = 'A' | 'B'
export function segmentFor(game: Game, side: SideId | null = null): Segment {
  if (side) return side
  return game === 'logndetektor' ? 'B' : 'A'
}

/** Segment den här NUC:en äger. null (delad vy) = alla. */
export function egnaSegment(side: SideId | null): string[] | undefined {
  if (side === 'A') return ['A']
  if (side === 'B') return ['B', 'valdi']
  return undefined
}

/**
 * Sidans bas. Rotationen på → dess fas/läge (group = ankomst, running = tutorial|skarp, lek);
 * rotationen av (pilot) → appens egna faser: intro/övning = tutorial, goLive/skarpa rum/resultat
 * = skarp (utfallet håller ovanpå), attract/checkout = null (följ regi / vila).
 */
export function basLage(
  rot: { phase: string; mode: string | null },
  phase: Phase,
  isTutorial: boolean,
): Lage | null {
  if (rot.phase !== 'off') return lageFranRotation(rot.phase, rot.mode)
  switch (phase) {
    case 'gameSelect':
    case 'branchIntro':
    case 'intro':
      return 'tutorial'
    case 'room':
      return isTutorial ? 'tutorial' : 'skarp'
    case 'goLive':
    case 'result':
      return 'skarp'
    default:
      return null
  }
}

/* ------------------------------------------------------------------ *
 * VALdi-ringen (segment `valdi`, bara sida B) speglar ValdiHole-videon.
 * Modulens lägen har inga VALdi-lägen (komet/antand/blixt kräver XyLjus, LJUSLAGEN §4),
 * så: vila/överväger/talar = vila · lyssnar (mik öppen) = ankomst (amber chase) ·
 * godkänd = vinst · förtroendet sjönk = fel · nekad = forlust · avaktivera = kvitto + vila.
 * ------------------------------------------------------------------ */
export type RingTillstand =
  | 'vila'
  | 'lyssnar'
  | 'overvager'
  | 'talar'
  | 'godkand'
  | 'varning'
  | 'nekad'
  | 'avaktivera'

/** ValdiHole-state (RoomCycle.holeRevealState) → ringens tillstånd. */
export function ringFranHal(
  s: 'idle' | 'overvager' | 'granted' | 'warndown' | 'deactivate' | 'denied' | 'talking',
): RingTillstand {
  switch (s) {
    case 'overvager':
      return 'overvager'
    case 'granted':
      return 'godkand'
    case 'warndown':
      return 'varning'
    case 'denied':
      return 'nekad'
    case 'deactivate':
      return 'avaktivera'
    case 'talking':
      return 'talar'
    default:
      return 'vila'
  }
}

export type RingSteg = { lage: Lage } | { gest: Gest }

/** Ringens övergång → steg (lage/gest på `valdi`, alltid tysta: appen spelar hålets egna ljud). */
export function ringSteg(fran: RingTillstand | null, till: RingTillstand): RingSteg[] {
  if (fran === till) return []
  const steg: RingSteg[] = []
  if (till === 'lyssnar') steg.push({ lage: 'ankomst' })
  else if (till === 'godkand') steg.push({ gest: 'vinst' })
  else if (till === 'nekad') steg.push({ gest: 'forlust' })
  else if (till === 'varning') steg.push({ gest: 'fel' })
  else steg.push({ lage: 'vila' })
  // Mikrofonen stängs (taltiden slut / "Klar") = avaktivera: ett kvitto-blink.
  if (fran === 'lyssnar') steg.push({ gest: 'kvitto' })
  return steg
}

/**
 * Rummets utslag på sidans segment. A (porten): beviljad = vinst, nekad = forlust (håller).
 * B (hålet): sant = rätt, förtroendet sjönk = inget (ringen visar varningen), nekad = fel.
 */
export function utslag(
  reveal: 'door' | 'hole',
  granted: boolean,
  trend: 'up' | 'down' | 'same',
): { utfall: 'vinst' | 'forlust' } | { gest: Gest } | null {
  if (reveal === 'door') return { utfall: granted ? 'vinst' : 'forlust' }
  if (!granted) return { gest: 'fel' }
  if (trend === 'down') return null
  return { gest: 'ratt' }
}

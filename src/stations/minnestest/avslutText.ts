/**
 * Avslutets innehåll per sida (XY-RESULTAT-OCH-VINST §2.3). Ren — testbar utan Vue.
 *
 *  A Människotestet: "11 av 15 svar lät mänskliga" + portarna gruppen tog sig genom. Bra jobbat.
 *  B Lögndetektorn:  ett av fyra betyg (MÄSTERLÖGNARE · ÖVERTYGANDE · SPRICKOR I FASADEN ·
 *                    GENOMSKÅDADE) + "9 av 15 lögner gick igenom".
 *
 * Copy-regler: prestationen vid stationen, gruppen (aldrig en enskild person), nämn aldrig
 * sortering/valv/roller.
 */
import type { UtfallTyp } from '@/station-kit/resultat'
import { METER, type Game } from '@/config'
import type { GameOutcome } from './store/minnestestStore'

export type Betyg = 'mastare' | 'overtygande' | 'sprickor' | 'genomskadade'

export const BETYG_TEXT: Record<Betyg, string> = {
  mastare: 'MÄSTERLÖGNARE',
  overtygande: 'ÖVERTYGANDE',
  sprickor: 'SPRICKOR I FASADEN',
  genomskadade: 'GENOMSKÅDADE',
}

/** Lögndetektorns bedömning ur rummen + slutförtroendet (inget nytt AI-anrop). */
export function betygFor(o: Pick<GameOutcome, 'granted' | 'roomsCleared' | 'slutFortroende'>): Betyg {
  if (o.granted) return o.slutFortroende >= METER.highAt ? 'mastare' : 'overtygande'
  return o.roomsCleared >= 2 ? 'sprickor' : 'genomskadade'
}

/** Utfallstypen (färg i rutan): alla rum = klarat, minst ett = delvis, inget = missat. */
export function utfallTyp(o: Pick<GameOutcome, 'granted' | 'roomsCleared'>): UtfallTyp {
  if (o.granted) return 'klarat'
  return o.roomsCleared >= 1 ? 'delvis' : 'missat'
}

export interface AvslutText {
  uppbyggnad: string
  spanning: string
  eyebrow: string
  rubrik: string
  siffra: string
  siffraEtikett: string
  rad: string
}

export function avslutText(game: Game, o: GameOutcome): AvslutText {
  const siffra = o.svarTotalt > 0 ? `${o.svarGodkanda} av ${o.svarTotalt}` : ''
  const n = o.roomsCleared
  const max = o.maxRooms
  if (game === 'logndetektor') {
    return {
      uppbyggnad: 'LÖGNDETEKTORN ANALYSERAR …',
      spanning: 'Mäter er trovärdighet …',
      eyebrow: 'LÖGNDETEKTORNS BEDÖMNING',
      rubrik: BETYG_TEXT[betygFor(o)],
      siffra,
      siffraEtikett: 'lögner gick igenom',
      rad: o.granted
        ? `Ni ljög er förbi alla ${max} kontroller. Bra jobbat!`
        : n > 0
          ? `Ni ljög er förbi ${n} av ${max} kontroller. Bra jobbat!`
          : 'VALdi genomskådade er redan vid första kontrollen. Bra kämpat!',
    }
  }
  return {
    uppbyggnad: 'VALDI SAMMANSTÄLLER …',
    spanning: 'Räknar svaren …',
    eyebrow: 'VALDIS UTSLAG',
    rubrik: o.granted ? 'VÄLKOMNA IN' : 'PORTEN STÄNGDES',
    siffra,
    siffraEtikett: 'svar lät mänskliga',
    rad: o.granted
      ? `Ni tog er genom alla ${max} portarna. Bra jobbat!`
      : n > 0
        ? `Ni tog er genom ${n} av ${max} portar. Bra jobbat!`
        : 'Den första porten höll stängt. Bra kämpat!',
  }
}

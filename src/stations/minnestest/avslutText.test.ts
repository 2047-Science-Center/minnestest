import { describe, it, expect } from 'vitest'
import { avslutText, betygFor, utfallTyp } from './avslutText'
import type { GameOutcome } from './store/minnestestStore'

const o = (p: Partial<GameOutcome>): GameOutcome => ({
  roomsCleared: 0,
  maxRooms: 5,
  granted: false,
  zone: 'lose',
  lastUtlatande: '',
  svarGodkanda: 0,
  svarTotalt: 0,
  slutFortroende: 50,
  ...p,
})

describe('Människotestet: räkningen', () => {
  it('visar godkända svar av alla och portarna (nekad i rum 3 = 2 portar)', () => {
    const t = avslutText('manniskotest', o({ roomsCleared: 2, svarGodkanda: 5, svarTotalt: 9 }))
    expect(t.siffra).toBe('5 av 9')
    expect(t.siffraEtikett).toBe('svar lät mänskliga')
    expect(t.rad).toBe('Ni tog er genom 2 av 5 portar. Bra jobbat!')
    expect(t.rubrik).toBe('PORTEN STÄNGDES')
  })
  it('alla portar → välkomna in', () => {
    const t = avslutText('manniskotest', o({ granted: true, roomsCleared: 5, svarGodkanda: 13, svarTotalt: 15 }))
    expect(t.rubrik).toBe('VÄLKOMNA IN')
    expect(t.rad).toContain('alla 5')
  })
  it('ingen port → ingen "rum 0"-text', () => {
    expect(avslutText('manniskotest', o({})).rad).not.toMatch(/0 av/)
  })
})

describe('Lögndetektorn: bedömningen', () => {
  it('fyra betyg', () => {
    expect(betygFor(o({ granted: true, roomsCleared: 5, slutFortroende: 80 }))).toBe('mastare')
    expect(betygFor(o({ granted: true, roomsCleared: 5, slutFortroende: 40 }))).toBe('overtygande')
    expect(betygFor(o({ roomsCleared: 3 }))).toBe('sprickor')
    expect(betygFor(o({ roomsCleared: 1 }))).toBe('genomskadade')
  })
  it('rubriken är betyget och siffran lögnerna', () => {
    const t = avslutText('logndetektor', o({ roomsCleared: 3, svarGodkanda: 7, svarTotalt: 12 }))
    expect(t.rubrik).toBe('SPRICKOR I FASADEN')
    expect(t.siffra).toBe('7 av 12')
    expect(t.siffraEtikett).toBe('lögner gick igenom')
  })
})

describe('utfallTyp', () => {
  it('klarat / delvis / missat', () => {
    expect(utfallTyp(o({ granted: true, roomsCleared: 5 }))).toBe('klarat')
    expect(utfallTyp(o({ roomsCleared: 2 }))).toBe('delvis')
    expect(utfallTyp(o({}))).toBe('missat')
  })
  it('texterna nämner aldrig sortering, valv eller roller', () => {
    for (const g of ['manniskotest', 'logndetektor'] as const) {
      const t = JSON.stringify(avslutText(g, o({ roomsCleared: 2, svarGodkanda: 3, svarTotalt: 6 })))
      expect(t).not.toMatch(/sortering|\bvalv|\broll|arbetslag/i)
    }
  })
})

import { describe, expect, it } from 'vitest'
import { utdragAv, valdiMattFor, UTDRAG_MAX, type Tur } from './valdiMatt'

const tur = (poang: number, transcript = 'jag tror att hon ljuger'): Tur => ({ poang, transcript })

describe('VALdi-mått st2 — sida A Människotestet', () => {
  // Tre skarpa rum, tre lurar. Deltagare 2 svarade inte i rum 2.
  const turer = [
    [tur(7, 'Jag skulle fråga hur hen mår först.'), tur(4), tur(9, 'Man måste tänka på syskonet också,\ninte bara sig själv.')],
    [tur(8, 'Det beror på vem som frågar.'), null, tur(6)],
    [tur(6), tur(5), tur(10, '')],
  ]
  const inp = { game: 'manniskotest' as const, turer, outcome: { granted: true, roomsCleared: 3 } }

  it('lur + snitt av personens poäng + gruppens utlåtande, tal inte strängar', () => {
    const p = valdiMattFor(0, inp)
    expect(p.plats).toBe('lur')
    expect(p.matt).toEqual({ manniskopoang: 7, slapptin: 1 })
    expect(typeof p.matt.manniskopoang).toBe('number')
    expect(valdiMattFor(1, inp).matt).toEqual({ manniskopoang: 4.5, slapptin: 1 })
  })

  it('utdraget = starkaste turen med något sagt, utan radbrytningar', () => {
    expect(valdiMattFor(0, inp).utdrag).toBe('Det beror på vem som frågar.')
    // Tom tur (10 p) räknas i snittet men ger inget utdrag.
    const p = valdiMattFor(2, inp)
    expect(p.matt.manniskopoang).toBe(8.3)
    expect(p.utdrag).toBe('Man måste tänka på syskonet också, inte bara sig själv.')
  })

  it('nekad grupp → slapptin 0', () => {
    expect(valdiMattFor(0, { ...inp, outcome: { granted: false, roomsCleared: 1 } }).matt.slapptin).toBe(0)
  })

  it('ingen outcome → gruppmåttet utelämnas', () => {
    expect(valdiMattFor(0, { ...inp, outcome: null }).matt).toEqual({ manniskopoang: 7 })
  })
})

describe('VALdi-mått st2 — sida B Lögndetektorn', () => {
  const turer = [
    [tur(6, 'Jag har faktiskt varit i London'), tur(3), tur(8)],
    [tur(9, 'Jag jonglerar med fem bollar varje morgon'), tur(5), tur(7)],
  ]
  const inp = { game: 'logndetektor' as const, turer, outcome: { granted: false, roomsCleared: 2 } }

  it('talare + snitt av personens turer + rum', () => {
    const p = valdiMattFor(0, inp)
    expect(p).toEqual({
      plats: 'talare',
      matt: { overtygande: 7.5, rum: 2 },
      utdrag: 'Jag jonglerar med fem bollar varje morgon',
    })
  })

  it('person som aldrig fick tur (index utanför turerna, t.ex. i kö) → inget övertygande, inget utdrag', () => {
    const p = valdiMattFor(3, inp)
    expect(p).toEqual({ plats: 'talare', matt: { rum: 2 } })
    expect('overtygande' in p.matt).toBe(false)
    expect('utdrag' in p).toBe(false)
  })

  it('inga skarpa rum alls → inga personmått', () => {
    expect(valdiMattFor(0, { ...inp, turer: [] })).toEqual({ plats: 'talare', matt: { rum: 2 } })
  })
})

describe('utdragAv', () => {
  it('kort text oförändrad (men en rad)', () => {
    expect(utdragAv('  hej\n\ndå  ')).toBe('hej då')
  })

  it('tom eller bara blanktecken → inget utdrag', () => {
    expect(utdragAv('')).toBeUndefined()
    expect(utdragAv(' \n ')).toBeUndefined()
  })

  it('lång text klipps vid ordgräns, högst 200 tecken', () => {
    const lang = Array.from({ length: 80 }, (_, i) => `ord${i}`).join(' ')
    const u = utdragAv(lang)!
    expect(u.length).toBeLessThanOrEqual(UTDRAG_MAX)
    expect(u.endsWith('…')).toBe(true)
    const kropp = u.slice(0, -1)
    expect(lang.startsWith(kropp)).toBe(true)
    expect(lang[kropp.length]).toBe(' ') // klippt precis före ett mellanslag
  })

  it('ett enda jätteord klipps hårt', () => {
    const u = utdragAv('a'.repeat(500))!
    expect(u.length).toBe(UTDRAG_MAX)
  })

  it('gruppens namn rensas bort (inga namn på andra, §8)', () => {
    expect(utdragAv('Jag håller med Maja, men inte majas kompis Omar.', ['Maja', 'Omar'])).toBe(
      'Jag håller med …, men inte majas kompis ….',
    )
  })
})

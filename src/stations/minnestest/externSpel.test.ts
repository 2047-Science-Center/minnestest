import { describe, it, expect } from 'vitest'
import { externSpelUrl, spelSrc, tolkaPersoner, resultValueAv } from './externSpel'

const loc = (search = '') => ({ search, protocol: 'http:', hostname: 'localhost' })

describe('externSpelUrl', () => {
  it('sida A → Människa eller maskin, sida B → Lögndetektorn, samma värd', () => {
    expect(externSpelUrl('A', loc('?sida=A'))).toBe('http://localhost:8796/')
    expect(externSpelUrl('B', loc('?sida=B'))).toBe('http://localhost:8798/')
  })
  it('delad vy och ?spel=gammalt = de gamla spelen; ?spelurl överstyr', () => {
    expect(externSpelUrl(null, loc())).toBeNull()
    expect(externSpelUrl('B', loc('?sida=B&spel=gammalt'))).toBeNull()
    expect(externSpelUrl('B', loc('?spelurl=http://x:1/'))).toBe('http://x:1/')
  })
})

it('spelSrc: namn i turordning, skalets origin, mqtt och testparametrar vidare', () => {
  const s = new URL(spelSrc({ url: 'http://localhost:8798/', namn: ['Ada', 'Bo', 'Cy'], grupp: 'testgrupp-3', skalOrigin: 'http://localhost:5176', mqttUrl: 'ws://b:9001', search: '?sida=B&lur=Opis&text=1&rotation=1' }))
  expect(s.searchParams.get('embed')).toBe('1')
  expect(s.searchParams.get('namn')).toBe('Ada,Bo,Cy')
  expect(s.searchParams.get('spelare')).toBe('3')
  expect(s.searchParams.get('skal')).toBe('http://localhost:5176')
  expect(s.searchParams.get('mqtt')).toBe('ws://b:9001')
  expect(s.searchParams.get('lur')).toBe('Opis')
  expect(s.searchParams.get('text')).toBe('1')
  expect(s.searchParams.has('rotation')).toBe(false)
})

describe('tolkaPersoner', () => {
  it('behåller bara tal, kända platser och kort utdrag', () => {
    const p = tolkaPersoner([
      { index: 0, plats: 'talare', matt: { overtygande: 6.2, alibi_holl: 0, fel: 'x', Ond: 3 }, utdrag: 'x'.repeat(300) },
      { index: 'nej' },
      { index: 1, plats: 'hacker', matt: null },
    ])
    expect(p).toHaveLength(2)
    expect(p[0].matt).toEqual({ overtygande: 6.2, alibi_holl: 0 })
    expect(p[0].utdrag).toHaveLength(200)
    expect(p[1]).toEqual({ index: 1, matt: {} })
  })
  it('result_value ur personens 0–10-mått', () => {
    expect(resultValueAv({ index: 0, matt: { overtygande: 6.6 } })).toBe(7)
    expect(resultValueAv({ index: 0, matt: { manniskopoang: 3.2, slapptin: 1 } })).toBe(3)
    expect(resultValueAv(undefined)).toBe(0)
  })
})

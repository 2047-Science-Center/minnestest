import { describe, it, expect } from 'vitest'
import { fermiTraff, fermiDelpoang, fermiFinal, strongestFermiDim } from './fermiScoring.js'

const cfg = {
  reference: {
    1: { ref: 1500, prick: [1200, 1800], tiopotens: [[500, 1200], [1800, 3000]] },
    2: { ref: 170000, prick: [100000, 300000], tiopotens: [[50000, 100000], [300000, 500000]] },
  },
  scoring: {
    matrix: {
      Exceptionell: { prick: 10, tiopotens: 9, utanfor: 7 },
      Stark: { prick: 8, tiopotens: 7, utanfor: 6 },
      Godkänd: { prick: 6, tiopotens: 5, utanfor: 4 },
      Svag: { prick: 3, tiopotens: 2, utanfor: 1 },
    },
    step3: { prick: [0.7, 1.5], tiopotens: [0.2, 5] },
    final: { rodTradBonus: 1, clamp: { min: 1, max: 10 } },
  },
  scale: [
    { min: 1, max: 2, label: 'a' },
    { min: 3, max: 4, label: 'b' },
    { min: 5, max: 6, label: 'c' },
    { min: 7, max: 8, label: 'd' },
    { min: 9, max: 10, label: 'e' },
  ],
  profiles: { dekomposition: 'Analytikern', storleksordning: 'Uppskattaren' },
}

describe('fermiTraff — steg 1 & 2 mot facit', () => {
  it('prick inom bandet', () => {
    expect(fermiTraff(1, 1500, [], cfg)).toBe('prick')
    expect(fermiTraff(2, 170000, [], cfg)).toBe('prick')
  })
  it('rätt tiopotens', () => {
    expect(fermiTraff(1, 900, [], cfg)).toBe('tiopotens')
    expect(fermiTraff(1, 2500, [], cfg)).toBe('tiopotens')
    expect(fermiTraff(2, 400000, [], cfg)).toBe('tiopotens')
  })
  it('utanför', () => {
    expect(fermiTraff(1, 5000, [], cfg)).toBe('utanfor')
    expect(fermiTraff(2, 1000000, [], cfg)).toBe('utanfor')
  })
  it('tom gissning → neutral mittkolumn', () => {
    expect(fermiTraff(1, null, [], cfg)).toBe('tiopotens')
  })
})

describe('fermiTraff — steg 3 mot EGNA tal', () => {
  const prior = [{ step: 1, guess: 1500 }, { step: 2, guess: 170000 }]
  // förväntat: 1500*170000/1000 = 255000 ton
  it('prick när produkten stämmer med egna tal', () => {
    expect(fermiTraff(3, 255000, prior, cfg)).toBe('prick')
    expect(fermiTraff(3, 300000, prior, cfg)).toBe('prick') // ratio 1.18
  })
  it('tiopotens vid slarvig avrundning', () => {
    expect(fermiTraff(3, 1000000, prior, cfg)).toBe('tiopotens') // ratio ~3.9
  })
  it('utanför vid nollfel/enhetsfel', () => {
    expect(fermiTraff(3, 255, prior, cfg)).toBe('utanfor') // ratio 0.001 (glömde ×1000)
  })
  it('saknat eget tal → neutral', () => {
    expect(fermiTraff(3, 255000, [{ step: 1, guess: 1500 }], cfg)).toBe('tiopotens')
  })
})

describe('fermiDelpoang — matris', () => {
  it('Exceptionell×prick = 10, Svag×prick kapas till 3', () => {
    expect(fermiDelpoang('Exceptionell', 'prick', cfg)).toBe(10)
    expect(fermiDelpoang('Svag', 'prick', cfg)).toBe(3)
    expect(fermiDelpoang('Exceptionell', 'utanfor', cfg)).toBe(7)
  })
})

describe('fermiFinal — medel ± röd tråd', () => {
  it('medel av tre delpoäng, +1 när steg 3 träffar prick', () => {
    const prior = [
      { step: 1, delpoang: 8, dimensioner: { dekomposition: true } },
      { step: 2, delpoang: 7, dimensioner: { dekomposition: true } },
      { step: 3, delpoang: 8, traff: 'prick', dimensioner: { storleksordning: true } },
    ]
    const r = fermiFinal(prior, cfg)
    expect(r.bonus).toBe(1)
    // medel (8+7+8)/3 = 7.67 → 8, +1 = 9
    expect(r.poang).toBe(9)
    expect(r.profil).toBe('Analytikern') // dekomposition starkast
  })
  it('ingen bonus när steg 3 inte är prick, clamp 1–10', () => {
    const prior = [
      { step: 1, delpoang: 2 },
      { step: 2, delpoang: 2 },
      { step: 3, delpoang: 1, traff: 'utanfor' },
    ]
    const r = fermiFinal(prior, cfg)
    expect(r.bonus).toBe(0)
    expect(r.poang).toBe(2) // medel 1.67 → 2
  })
})

describe('strongestFermiDim', () => {
  it('flest sanna vinner', () => {
    const prior = [
      { dimensioner: { storleksordning: true } },
      { dimensioner: { storleksordning: true, dekomposition: true } },
    ]
    expect(strongestFermiDim(prior)).toBe('storleksordning')
  })
})

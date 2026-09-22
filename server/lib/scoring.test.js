import { describe, it, expect } from 'vitest'
import { bandSum, strongestDimension, computeFinal } from './scoring.js'

/** Minimal config-fixtur (samma form som configs/minnestest.json → scoring/profiles/scale). */
const cfg = {
  scoring: {
    bandPoints: { Svag: 1, Godkänd: 2, Stark: 3 },
    bonus: { minSteps: 2, points: 1 },
    clamp: { min: 1, max: 10 },
  },
  profiles: {
    system: 'Systemtänkaren',
    framforhallning: 'Förutseende',
    prioritering: 'Prioriteraren',
    resurs: 'Improvisatören',
    anpassning: 'Lagets klippa',
  },
  scale: [
    { min: 1, max: 2, label: 'Överlevde stunden' },
    { min: 3, max: 4, label: 'Höll huvudet kallt' },
    { min: 5, max: 6, label: 'Tänkte framåt' },
    { min: 7, max: 8, label: 'Såg hela systemet' },
    { min: 9, max: 10, label: 'Någon andra kan luta sig mot' },
  ],
}

const noDims = { system: false, framforhallning: false, prioritering: false, resurs: false, anpassning: false }
const step = (band, dims = {}) => ({ band, dimensioner: { ...noDims, ...dims } })

describe('bandSum', () => {
  it('summerar band → poäng', () => {
    expect(bandSum(['Svag', 'Godkänd', 'Stark'], cfg.scoring.bandPoints)).toBe(6)
    expect(bandSum(['Stark', 'Stark', 'Stark'], cfg.scoring.bandPoints)).toBe(9)
    expect(bandSum(['Svag', 'Svag', 'Svag'], cfg.scoring.bandPoints)).toBe(3)
  })
})

describe('computeFinal', () => {
  it('tre Svag → 3 (golv-nära), ingen bonus', () => {
    const r = computeFinal([step('Svag'), step('Svag'), step('Svag')], cfg)
    expect(r.poang).toBe(3)
    expect(r.bonus).toBe(0)
    expect(r.markering).toBe('Höll huvudet kallt')
  })

  it('tre Stark utan anpassning → 9', () => {
    const r = computeFinal([step('Stark'), step('Stark'), step('Stark')], cfg)
    expect(r.base).toBe(9)
    expect(r.bonus).toBe(0)
    expect(r.poang).toBe(9)
    expect(r.markering).toBe('Någon andra kan luta sig mot')
  })

  it('+1 bonus när anpassning är tydlig i ≥2 steg, klampas till 10', () => {
    const r = computeFinal(
      [step('Stark', { anpassning: true }), step('Stark', { anpassning: true }), step('Stark')],
      cfg,
    )
    expect(r.base).toBe(9)
    expect(r.bonus).toBe(1)
    expect(r.poang).toBe(10) // 9+1, clamp-kant
  })

  it('anpassning i bara 1 steg ger ingen bonus', () => {
    const r = computeFinal(
      [step('Godkänd', { anpassning: true }), step('Godkänd'), step('Godkänd')],
      cfg,
    )
    expect(r.bonus).toBe(0)
    expect(r.poang).toBe(6)
  })

  it('clamp håller poäng inom 1–10', () => {
    const r = computeFinal([step('Svag'), step('Svag'), step('Svag')], {
      ...cfg,
      scoring: { ...cfg.scoring, bandPoints: { Svag: 0, Godkänd: 0, Stark: 0 } },
    })
    expect(r.poang).toBe(1) // 0 → klamp upp till min 1
  })

  it('profil väljs efter starkaste dimensionen', () => {
    const r = computeFinal(
      [
        step('Stark', { system: true }),
        step('Stark', { system: true, resurs: true }),
        step('Godkänd', { system: true }),
      ],
      cfg,
    )
    expect(r.strongest).toBe('system')
    expect(r.profil).toBe('Systemtänkaren')
  })
})

describe('strongestDimension', () => {
  it('tie-break följer DIM_ORDER', () => {
    // system och resurs lika (1 vardera) → system vinner (tidigare i ordningen)
    const prior = [step('Godkänd', { system: true, resurs: true })]
    expect(strongestDimension(prior)).toBe('system')
  })
})

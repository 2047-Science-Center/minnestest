/**
 * Gate-matematiken för den gatade stegen: stigande tröskel per nivå, poäng ≥
 * tröskel → vidare, annars mjukt stopp. Tröskeln bor i config (tunbar).
 */
import { describe, it, expect } from 'vitest'
import { LEVEL_THRESHOLDS, MAX_NIVA, thresholdForLevel } from '@/config'

describe('gatad stege — tröskel', () => {
  it('har en tröskel per nivå och stiger (generöst först, hårdare sen)', () => {
    expect(LEVEL_THRESHOLDS.length).toBe(MAX_NIVA)
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThanOrEqual(LEVEL_THRESHOLDS[i - 1])
    }
    expect(LEVEL_THRESHOLDS[0]).toBeLessThanOrEqual(3) // nivå 1 generös
  })

  it('thresholdForLevel klampar utanför intervallet', () => {
    expect(thresholdForLevel(0)).toBe(LEVEL_THRESHOLDS[0])
    expect(thresholdForLevel(4)).toBe(LEVEL_THRESHOLDS[4])
    expect(thresholdForLevel(99)).toBe(LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1])
  })

  it('gate: poäng ≥ tröskel klarar nivån', () => {
    const passed = (poang: number, level: number) => poang >= thresholdForLevel(level)
    expect(passed(2, 0)).toBe(true) // generös nivå 1
    expect(passed(1, 0)).toBe(false)
    expect(passed(8, 4)).toBe(true) // sista nivån kräver mest
    expect(passed(7, 4)).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { feedLevel, offlineSvar, OFFLINE_SVAR, threeQuestions, topplista, TRAD, type SilenceState } from './lekBank'

describe('Fråga VALdi — offline', () => {
  it('varje snabbvalskombination ger ett eget svar', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 8; i++) seen.add(offlineSvar([i & 1, (i >> 1) & 1, (i >> 2) & 1]))
    expect(seen.size).toBe(OFFLINE_SVAR.length)
  })
  it('svaren nämner aldrig valv/arbetslag', () => {
    for (const s of OFFLINE_SVAR) expect(s.toLowerCase()).not.toMatch(/valv|arbetslag|sortering/)
  })
  it('tre olika frågor', () => {
    expect(new Set(threeQuestions()).size).toBe(3)
  })
})

describe('Håll tråden — tystnad', () => {
  const start: SilenceState = { floor: 0.005, lastVoiceAt: 0, startedAt: 0 }
  it('ingen tystnad under respiten', () => {
    expect(feedLevel(start, 0, TRAD.graceMs - 1).silent).toBe(false)
  })
  it('tal håller tråden, tystnad > silenceMs surrar', () => {
    let s = feedLevel(start, 0.05, 2000).state
    expect(feedLevel(s, 0.0, 2000 + TRAD.silenceMs - 1).silent).toBe(false)
    s = feedLevel(s, 0.0, 2000 + TRAD.silenceMs).state
    expect(feedLevel(s, 0.0, 2000 + TRAD.silenceMs).silent).toBe(true)
  })
  it('topplistan sorterar längst först och kapar till 5', () => {
    const l = [1, 5, 3, 9, 2, 7].map((ms, i) => ({ namn: `S${i}`, ms, orsak: 'tyst' as const }))
    expect(topplista(l).map((r) => r.ms)).toEqual([9, 7, 5, 3, 2])
  })
})

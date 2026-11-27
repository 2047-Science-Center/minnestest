import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { basLage, egnaSegment, LJUD, ringFranHal, ringSteg, segmentFor, utslag } from './ljus'
import { initLjus, __resetLjusForTest, type LjusClient } from '@/station-kit/ljus/stationLjus'
import { FARG } from '@/station-kit/ljus/kanon'
import { LJUS } from '@/config'

const OFF = { phase: 'off', mode: null }

describe('station 2 ljus — sidor och bas', () => {
  it('sidan går före spelet; delad vy = spelets sida', () => {
    expect(segmentFor('manniskotest')).toBe('A')
    expect(segmentFor('logndetektor')).toBe('B')
    expect(segmentFor('manniskotest', 'B')).toBe('B')
    expect(egnaSegment('A')).toEqual(['A', 'A.lur1', 'A.lur2', 'A.lur3'])
    expect(egnaSegment('B')).toEqual(['B'])
    expect(egnaSegment(null)).toBeUndefined()
  })

  it('basen följer rotationen när den är på, annars appens faser', () => {
    expect(basLage({ phase: 'running', mode: 'skarp' }, 'room', true)).toBe('skarp')
    expect(basLage({ phase: 'running', mode: 'tutorial' }, 'intro', false)).toBe('tutorial')
    expect(basLage({ phase: 'lek', mode: 'lek' }, 'attract', false)).toBe('lek')
    expect(basLage(OFF, 'room', true)).toBe('tutorial')
    expect(basLage(OFF, 'room', false)).toBe('skarp')
    expect(basLage(OFF, 'result', false)).toBe('skarp')
    expect(basLage(OFF, 'attract', false)).toBeNull()
    expect(basLage(OFF, 'checkout', false)).toBeNull()
  })

  it('alla kanon-ljud har en Sfx', () => {
    for (const sfx of Object.values(LJUD)) expect(sfx).toBeTruthy()
    expect(LJUD.varning).toBe('tick')
  })
})

describe('station 2 ljus — VALdi-ringen och utslag', () => {
  it('ringen följer hålet: lyssnar → avaktivera (kvitto) → överväger → godkänd → talar', () => {
    expect(ringSteg(null, 'vila')).toEqual([{ lage: 'vila' }])
    expect(ringSteg('vila', 'lyssnar')).toEqual([{ lage: 'ankomst' }])
    expect(ringSteg('lyssnar', 'avaktivera')).toEqual([{ lage: 'vila' }, { gest: 'kvitto' }])
    expect(ringSteg('lyssnar', 'vila')).toEqual([{ lage: 'vila' }, { gest: 'kvitto' }])
    expect(ringSteg('avaktivera', ringFranHal('overvager'))).toEqual([{ lage: 'vila' }])
    expect(ringSteg('overvager', ringFranHal('granted'))).toEqual([{ gest: 'vinst' }])
    expect(ringSteg('overvager', ringFranHal('warndown'))).toEqual([{ gest: 'fel' }])
    expect(ringSteg('overvager', ringFranHal('denied'))).toEqual([{ gest: 'forlust' }])
    expect(ringSteg('godkand', ringFranHal('talking'))).toEqual([{ lage: 'vila' }])
    expect(ringSteg('vila', 'vila')).toEqual([])
  })

  it('utslag: A-porten = vinst/forlust, B = rätt / inget (sjönk) / fel', () => {
    expect(utslag('door', true, 'down')).toEqual({ utfall: 'vinst' })
    expect(utslag('door', false, 'down')).toEqual({ utfall: 'forlust' })
    expect(utslag('hole', true, 'up')).toEqual({ gest: 'ratt' })
    expect(utslag('hole', true, 'down')).toBeNull()
    expect(utslag('hole', false, 'down')).toEqual({ gest: 'fel' })
  })
})

describe('station 2 ljus — delad station mot modulen', () => {
  beforeEach(() => {
    __resetLjusForTest()
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
  })
  afterEach(() => vi.useRealTimers())

  function klient() {
    const sent: { topic: string; payload: any }[] = []
    let onConnect = () => {}
    const c: LjusClient = {
      publish: (topic, payload) => sent.push({ topic, payload: JSON.parse(payload) }),
      subscribe: () => {},
      on: (ev: string, cb: any) => {
        if (ev === 'connect') onConnect = cb
      },
    }
    return { sent, c, connect: () => onConnect() }
  }
  const bas = (sent: { topic: string; payload: any }[], sida: 'A' | 'B') => {
    expect(sent.some((m) => m.topic === 'station2/underglow')).toBe(false)
    return sent.filter((m) => m.topic === `station2/underglow/${sida}`).at(-1)!.payload
  }

  it('standardslingan: A 0–69 (lurarna = A.1/A.2/A.3), B 70–140, ingen valdi på underglow', () => {
    expect(LJUS.segment.A).toEqual([0, 69])
    expect(LJUS.segment.B).toEqual([70, 140])
    expect([1, 2, 3].map((i) => LJUS.segment[`A.lur${i}`])).toEqual([[0, 23], [24, 45], [46, 69]])
    expect(LJUS.segment.valdi).toBeUndefined()
  })

  it('sida A + sida B täcker tillsammans hela slingan 0–140, var sin topic', () => {
    const tackt = new Set<number>()
    for (const sida of ['A', 'B'] as const) {
      __resetLjusForTest()
      const k = klient()
      initLjus({ stationN: 2, enabled: true, mqttUrl: '', valv: 'teknolog', segment: LJUS.segment, egna: egnaSegment(sida), sida, skrivare: true }, k.c)
      k.connect()
      const b = bas(k.sent, sida)
      expect(b.segments.map((x: { id: string }) => x.id)).toEqual(egnaSegment(sida))
      for (const x of b.segments) for (let i = x.from; i <= x.to; i++) tackt.add(i)
    }
    expect(tackt.size).toBe(141)
    expect(Math.min(...tackt)).toBe(0)
    expect(Math.max(...tackt)).toBe(140)
  })

  it('sida B skriver bara B (station2/underglow/B); ringens lägen/gester på valdi är no-op', () => {
    const k = klient()
    const spela = vi.fn()
    const l = initLjus(
      { stationN: 2, enabled: true, mqttUrl: '', valv: 'teknolog', segment: LJUS.segment, egna: egnaSegment('B'), sida: 'B', skrivare: true, spela },
      k.c,
    )
    k.connect()
    l.lage('skarp', [segmentFor('logndetektor', 'B')])
    for (const s of ringSteg('vila', 'lyssnar')) if ('lage' in s) l.lage(s.lage, ['valdi'])
    const b = bas(k.sent, 'B')
    expect(b.segments).toEqual([{ id: 'B', from: 70, to: 140, color: FARG.skarp, effekt: 'static' }])

    const fore = k.sent.length
    expect(l.gest('kvitto', ['valdi'], { tyst: true })).toBe(0)
    expect(k.sent.length).toBe(fore)
    expect(l.gest('kvitto', ['B'], { tyst: true })).toBe(1)
    expect(k.sent.at(-1)!.topic).toBe('station2/feedback')
    expect(spela).not.toHaveBeenCalled()
  })
})

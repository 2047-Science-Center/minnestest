import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { basLage, egnaSegment, LJUD, ringFranHal, ringSteg, segmentFor, utslag } from './ljus'
import { initLjus, __resetLjusForTest, type LjusClient } from '@/station-kit/ljus/stationLjus'
import { FARG } from '@/station-kit/ljus/kanon'

const OFF = { phase: 'off', mode: null }

describe('station 2 ljus — sidor och bas', () => {
  it('sidan går före spelet; delad vy = spelets sida', () => {
    expect(segmentFor('manniskotest')).toBe('A')
    expect(segmentFor('logndetektor')).toBe('B')
    expect(segmentFor('manniskotest', 'B')).toBe('B')
    expect(egnaSegment('A')).toEqual(['A', 'A.lur1', 'A.lur2', 'A.lur3'])
    expect(egnaSegment('B')).toEqual(['B', 'valdi'])
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

  it('sida B skriver bara B + valdi (ersatt:false); ringens gest är tyst', () => {
    const sent: { topic: string; payload: any }[] = []
    let onConnect = () => {}
    const c: LjusClient = {
      publish: (topic, payload) => sent.push({ topic, payload: JSON.parse(payload) }),
      subscribe: () => {},
      on: (ev: string, cb: any) => {
        if (ev === 'connect') onConnect = cb
      },
    }
    const spela = vi.fn()
    const l = initLjus(
      {
        stationN: 2,
        enabled: true,
        mqttUrl: '',
        valv: 'teknolog',
        segment: { A: [0, 29], B: [30, 59], valdi: [60, 75] },
        egna: egnaSegment('B'),
        delad: true,
        spela,
      },
      c,
    )
    onConnect()
    l.lage('skarp', [segmentFor('logndetektor', 'B')])
    for (const s of ringSteg('vila', 'lyssnar')) if ('lage' in s) l.lage(s.lage, ['valdi'])
    const bas = sent.filter((m) => m.topic === 'station2/underglow').at(-1)!.payload
    expect(bas.ersatt).toBe(false)
    expect(bas.segments.map((s: { id: string }) => s.id)).toEqual(['B', 'valdi'])
    expect(bas.segments[0]).toMatchObject({ color: FARG.skarp, effekt: 'static' })
    expect(bas.segments[1]).toMatchObject({ color: FARG.amber, effekt: 'chase' })

    l.gest('kvitto', ['valdi'], { tyst: true })
    expect(sent.at(-1)!.topic).toBe('station2/feedback')
    expect(spela).not.toHaveBeenCalled()
  })
})

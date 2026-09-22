import { describe, it, expect, vi, afterEach } from 'vitest'
import { HttpAssess } from './HttpAssess'
import type { StepInput, FinalInput, AssessMeta } from './Assess'

const meta: AssessMeta = { lang: 'sv' }

const stepInput: StepInput = {
  step: 1,
  role: 'metodspecialist',
  example: 'fermi-skrotbilar',
  transcript: 'en bil väger typ 1,5 ton',
  guess: 1500,
  unit: 'kg',
  prior: [],
}

const finalInput: FinalInput = {
  step: 'final',
  role: 'metodspecialist',
  example: 'fermi-skrotbilar',
  prior: [],
}

function mockFetch(body: unknown, ok = true, status = 200) {
  const calls: { url: string; init: RequestInit }[] = []
  const fn = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return {
      ok,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as unknown as Response
  })
  ;(globalThis as unknown as { fetch: typeof fn }).fetch = fn
  return { fn, calls }
}

describe('HttpAssess — kontraktsform', () => {
  afterEach(() => vi.restoreAllMocks())

  it('assessStep POSTar configId (per anrop) + input + meta och plockar ut assessment', async () => {
    const assessment = {
      resonemang_niva: 'Stark',
      dimensioner: { dekomposition: true },
      traff: 'prick',
      delpoang: 8,
      kvitterat: 'bra',
      miss: '',
      ankare: '',
      svar_text: 'Ni ankrade i en referens.',
      osakert: [],
    }
    const { calls } = mockFetch({ assessment, meta: {} })
    const client = new HttpAssess('http://localhost:8787')

    const out = await client.assessStep('fermi-skrotbilar', stepInput, meta)
    expect(out).toEqual(assessment)

    expect(calls[0].url).toBe('http://localhost:8787/assess')
    expect(calls[0].init.method).toBe('POST')
    const sent = JSON.parse(calls[0].init.body as string)
    expect(sent.configId).toBe('fermi-skrotbilar')
    expect(sent.input.step).toBe(1)
    expect(sent.input.guess).toBe(1500)
    expect(sent.meta.lang).toBe('sv')
  })

  it('trimmar dubbel slash i baseUrl', async () => {
    const { calls } = mockFetch({ assessment: {} })
    const client = new HttpAssess('http://localhost:8787/')
    await client.assessStep('flykt', stepInput, meta).catch(() => undefined)
    expect(calls[0].url).toBe('http://localhost:8787/assess')
  })

  it('composeFinal plockar ut final', async () => {
    const final = { poang: 8, profil: 'Analytikern', markering: 'Såg hela systemet', sammanfattning: 'Bra.' }
    mockFetch({ final, meta: {} })
    const client = new HttpAssess('http://localhost:8787')
    const out = await client.composeFinal('fermi-skrotbilar', finalInput, meta)
    expect(out).toEqual(final)
  })

  it('kastar vid icke-2xx', async () => {
    mockFetch({ error: 'boom' }, false, 500)
    const client = new HttpAssess('http://localhost:8787')
    await expect(client.assessStep('flykt', stepInput, meta)).rejects.toThrow(/assess 500/)
  })
})

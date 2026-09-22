import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HttpAssess } from './HttpAssess'
import type { StepInput, FinalInput, AssessMeta } from './Assess'

const meta: AssessMeta = { lang: 'sv' }

const stepInput: StepInput = {
  step: 1,
  role: 'metodspecialist',
  scenario: 'flykt',
  transcript: 'vi tar passen och vatten som räcker flera dagar',
  prior: [],
}

const finalInput: FinalInput = {
  step: 'final',
  role: 'metodspecialist',
  scenario: 'flykt',
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
  beforeEach(() => {
    /* fresh mock per test */
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('assessStep POSTar rätt kropp till {baseUrl}/assess och plockar ut assessment', async () => {
    const assessment = {
      band: 'Stark',
      dimensioner: { system: true, framforhallning: true, prioritering: true, resurs: true, anpassning: false },
      kvitterat: 'bra',
      miss: 'litet',
      ankare: 'framåt',
      svar_text: 'Ni tänkte rätt.',
      osakert: [],
    }
    const { calls } = mockFetch({ assessment, meta: { model: 'x', latencyMs: 1 } })
    const client = new HttpAssess('http://localhost:8787', 'minnestest')

    const out = await client.assessStep(stepInput, meta)
    expect(out).toEqual(assessment)

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('http://localhost:8787/assess')
    expect(calls[0].init.method).toBe('POST')
    const sent = JSON.parse(calls[0].init.body as string)
    expect(sent.configId).toBe('minnestest')
    expect(sent.input.step).toBe(1)
    expect(sent.input.role).toBe('metodspecialist')
    expect(sent.meta.lang).toBe('sv')
  })

  it('trimmar dubbel slash i baseUrl', async () => {
    const { calls } = mockFetch({ assessment: {} })
    const client = new HttpAssess('http://localhost:8787/', 'minnestest')
    await client.assessStep(stepInput, meta).catch(() => undefined)
    expect(calls[0].url).toBe('http://localhost:8787/assess')
  })

  it('composeFinal plockar ut final', async () => {
    const final = { poang: 8, profil: 'Improvisatören', markering: 'Såg hela systemet', sammanfattning: 'Bra jobbat.' }
    mockFetch({ final, meta: {} })
    const client = new HttpAssess('http://localhost:8787', 'minnestest')
    const out = await client.composeFinal(finalInput, meta)
    expect(out).toEqual(final)
  })

  it('kastar vid icke-2xx', async () => {
    mockFetch({ error: 'boom' }, false, 500)
    const client = new HttpAssess('http://localhost:8787', 'minnestest')
    await expect(client.assessStep(stepInput, meta)).rejects.toThrow(/assess 500/)
  })

  it('kastar när assessment saknas i svaret', async () => {
    mockFetch({ meta: {} })
    const client = new HttpAssess('http://localhost:8787', 'minnestest')
    await expect(client.assessStep(stepInput, meta)).rejects.toThrow(/saknar assessment/)
  })
})

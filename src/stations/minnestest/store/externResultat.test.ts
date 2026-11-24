import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const skickat: unknown[] = []
vi.mock('@/station-kit/resultat', () => ({ skickaResultat: (p: unknown) => skickat.push(p) }))

import { useMinnestestStore } from './minnestestStore'

describe('externt spel → station2/result (SOM.md "Station 2 från 2026-11-24")', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    skickat.length = 0
  })

  it('entréns personer + spelets mått per index; result_value ur 0–10-måttet; checkout efteråt', () => {
    const s = useMinnestestStore()
    s.setRoster('testgrupp-3', [
      { band_id: 'V2B1', name: 'Ada', chosen_role: 'B', assigned_role: 'B', role_presented_as: 'kvinnlig' },
      { band_id: 'V2B2', name: 'Bo', chosen_role: 'A', assigned_role: 'B', role_presented_as: 'manlig' },
    ])
    s.startExtern()
    expect(s.phase).toBe('extern')
    expect(s.isTutorial).toBe(true)
    s.externSkarp()
    expect(s.isTutorial).toBe(false)
    s.externKlar([
      { index: 0, plats: 'talare', matt: { overtygande: 6.6, alibi_holl: 0, misstanke: 70 }, utdrag: 'vi satt i verkstaden' },
      { index: 1, plats: 'talare', matt: { overtygande: 3.1, alibi_holl: 0, misstanke: 70 } },
    ])
    expect(s.phase).toBe('checkout')
    expect(skickat).toHaveLength(1)
    const p = skickat[0] as { grupp: string; personer: Record<string, unknown>[] }
    expect(p.grupp).toBe('testgrupp-3')
    expect(p.personer[0]).toMatchObject({ band_id: 'V2B1', chosen_role: 'B', assigned_role: 'B', role_presented_as: 'kvinnlig', result_value: 7, plats: 'talare', matt: { overtygande: 6.6, alibi_holl: 0, misstanke: 70 }, utdrag: 'vi satt i verkstaden' })
    expect(p.personer[1]).toMatchObject({ band_id: 'V2B2', chosen_role: 'A', result_value: 3 })
    expect(p.personer[1].utdrag).toBeUndefined()
  })

  it('klar räknas bara en gång (i externa läget)', () => {
    const s = useMinnestestStore()
    s.startExtern()
    s.externKlar([])
    s.externKlar([])
    expect(skickat).toHaveLength(1)
  })
})

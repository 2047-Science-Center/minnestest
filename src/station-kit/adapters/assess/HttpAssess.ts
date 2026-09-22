/**
 * Enda /assess-implementationen: POST {baseUrl}/assess mot den lokala gatewayen.
 * INGEN MockAssess — AI:n byggs på riktigt (innehållsspec §7). Anropas en gång
 * per steg och en gång som `final`.
 */
import type {
  Assess,
  AssessMeta,
  FinalInput,
  FinalResult,
  StepAssessment,
  StepInput,
} from './Assess'

export class HttpAssess implements Assess {
  constructor(
    private readonly baseUrl: string,
    private readonly configId: string,
  ) {}

  private async post<T>(body: unknown, pick: (json: unknown) => T): Promise<T> {
    const url = `${this.baseUrl.replace(/\/+$/, '')}/assess`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`assess ${res.status}: ${text.slice(0, 200)}`)
    }
    const json = (await res.json()) as unknown
    return pick(json)
  }

  assessStep(input: StepInput, meta: AssessMeta): Promise<StepAssessment> {
    return this.post({ configId: this.configId, input, meta }, (json) => {
      const j = json as { assessment?: StepAssessment }
      if (!j.assessment) throw new Error('assess: saknar assessment i svaret')
      return j.assessment
    })
  }

  composeFinal(input: FinalInput, meta: AssessMeta): Promise<FinalResult> {
    return this.post({ configId: this.configId, input, meta }, (json) => {
      const j = json as { final?: FinalResult }
      if (!j.final) throw new Error('assess: saknar final i svaret')
      return j.final
    })
  }
}

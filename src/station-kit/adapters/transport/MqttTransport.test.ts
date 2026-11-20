import { describe, expect, it, vi } from 'vitest'
import { MqttTransport } from './MqttTransport'
import type { MqttClient } from '../mqtt/mqttClient'

/**
 * Fejk-broker som speglar varje publish till ALLA prenumeranter (inkl. avsändaren),
 * precis som en riktig MQTT-broker. Så kan vi verifiera att MqttTransport filtrerar
 * sitt eget eko men levererar den andra NUC:ens meddelanden.
 */
function fejkBroker() {
  const subs = new Map<string, Set<(payload: string, topic: string) => void>>()
  return {
    klientFor(): MqttClient {
      return {
        publish(topic, payload) {
          for (const cb of subs.get(topic) ?? []) cb(payload, topic)
        },
        subscribe(topic, cb) {
          let s = subs.get(topic)
          if (!s) subs.set(topic, (s = new Set()))
          s.add(cb)
          return () => s!.delete(cb)
        },
      }
    },
  }
}

describe('MqttTransport (skärm↔skärm över broker, station<N>/skarmsynk)', () => {
  it('levererar den andra NUC:ens meddelande men inte sitt eget eko', () => {
    const broker = fejkBroker()
    const a = new MqttTransport(2, broker.klientFor())
    const b = new MqttTransport(2, broker.klientFor())
    const aFick = vi.fn()
    const bFick = vi.fn()
    a.subscribe(aFick)
    b.subscribe(bFick)

    a.send({ kind: 'entre:vote', payload: { run: 'r', band_id: 'V1', role: 'A' } })

    // B (andra NUC:en) får meddelandet; A (avsändaren) får INTE sitt eget eko.
    expect(bFick).toHaveBeenCalledTimes(1)
    expect(bFick).toHaveBeenCalledWith({ kind: 'entre:vote', payload: { run: 'r', band_id: 'V1', role: 'A' } })
    expect(aFick).not.toHaveBeenCalled()
  })

  it('ignorerar trasig payload utan att kasta', () => {
    const broker = fejkBroker()
    const klient = broker.klientFor()
    const t = new MqttTransport(2, klient)
    const fick = vi.fn()
    t.subscribe(fick)
    expect(() => klient.publish('station2/skarmsynk', '{ inte json')).not.toThrow()
    expect(fick).not.toHaveBeenCalled()
  })

  it('close() slutar leverera', () => {
    const broker = fejkBroker()
    const a = new MqttTransport(2, broker.klientFor())
    const b = new MqttTransport(2, broker.klientFor())
    const bFick = vi.fn()
    b.subscribe(bFick)
    b.close()
    a.send({ kind: 'entre:hello', payload: { run: 'r' } })
    expect(bFick).not.toHaveBeenCalled()
  })
})

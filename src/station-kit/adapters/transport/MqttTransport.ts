/**
 * Skärm↔skärm-synk över riggens broker — för en station vars två sidor sitter på
 * OLIKA NUC:ar (station 2: Människa eller maskin + Lögndetektorn). BroadcastChannel når bara
 * samma dator, så entréns röster/lottning/sekvens-steg måste gå via brokern i stället.
 *
 * Kontrakt: `station<N>/skarmsynk` (SOM.md). Payload = JSON `{from, kind, payload}`:
 *   - `kind`/`payload` = Transport-meddelandet (entre:* och lek:*), oförändrat.
 *   - `from` = en slumpad klient-id per flik så den egna ekot filtreras bort
 *     (brokern speglar till ALLA prenumeranter inkl. avsändaren; BroadcastChannel gör inte det).
 *
 * Återbrukar den delade MQTT-över-WebSocket-klienten (EN broker-anslutning per flik,
 * samma som MqttLights/MqttIdentity/MqttResultSink). Ingen ny broker, inga hemligheter.
 *
 * Tid: sekvens-stegen bär ledarens epoch-ms (`at`); de två NUC:arna antas NTP-synkade
 * (som filmkontraktet mäter mot regi `/time`). Själva utfallet (grupp, röster, lottning,
 * steg-övergångar) är händelsestyrt och oberoende av klockan; bara videons finsynk i
 * SynkSekvens använder `at`, och den rättas ändå var 500:e ms mot klippets egen tid.
 */

import { getMqttClient, type MqttClient } from '../mqtt/mqttClient'
import type { Transport, TransportHandler, TransportMessage } from './Transport'

interface Kuvert {
  from: string
  kind: string
  payload: unknown
}

export class MqttTransport implements Transport {
  private readonly topic: string
  private readonly id = Math.random().toString(16).slice(2, 10)
  private readonly handlers = new Set<TransportHandler>()
  private readonly client: MqttClient
  private readonly unsub: () => void

  /** `client` injiceras bara i test; i appen används den delade broker-klienten. */
  constructor(stationN: number, client: MqttClient = getMqttClient()) {
    this.client = client
    this.topic = `station${stationN}/skarmsynk`
    this.unsub = this.client.subscribe(this.topic, (payload) => {
      let m: Kuvert
      try {
        m = JSON.parse(payload) as Kuvert
      } catch {
        return
      }
      if (!m || m.from === this.id || typeof m.kind !== 'string') return // egen echo / skräp
      for (const h of this.handlers) h({ kind: m.kind, payload: m.payload })
    })
  }

  send(msg: TransportMessage): void {
    const kuvert: Kuvert = { from: this.id, kind: msg.kind, payload: msg.payload }
    this.client.publish(this.topic, JSON.stringify(kuvert))
  }

  subscribe(handler: TransportHandler): () => void {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  close(): void {
    this.unsub()
    this.handlers.clear()
  }
}

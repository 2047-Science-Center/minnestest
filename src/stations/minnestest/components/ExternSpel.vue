<script setup lang="ts">
/**
 * Station 2:s nya spel i helskärm (externSpel.ts): sida A = Människa eller maskin, sida B = Lögndetektorn.
 * Skalet skickar gruppens namn i turordning + sin origin; spelet svarar med postMessage
 * {kalla:"xy-st2", typ:"skarp"|"klar", personer?}. Bara meddelanden från spelets origin räknas.
 *
 * LJUS (XY-ST2-LJUSMANUS.md, SOM.md): spelet styr inte underglow själv utan skickar
 * {kalla:"xy-st2", typ:"ljus", lage? | gest? | utfall? | farg?, seg?} → skalet anropar station-kit/ljus
 * på SINA segment (sida A: A + A.lur1–3, sida B: B). Alltid tyst — spelet spelar sina egna ljud.
 */
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useLjus } from '@/station-kit/ljus'
import type { Gest, Lage } from '@/station-kit/ljus/kanon'
import { spelSrc, tolkaPersoner, type ExternPerson } from '../externSpel'

const props = defineProps<{ url: string; namn: string[]; grupp: string | null; mqttUrl: string | null; egna?: string[] }>()
const emit = defineEmits<{ skarp: []; klar: [personer: ExternPerson[]] }>()

const src = computed(() =>
  spelSrc({ url: props.url, namn: props.namn, grupp: props.grupp, skalOrigin: location.origin, mqttUrl: props.mqttUrl, search: location.search }),
)
const spelOrigin = computed(() => new URL(props.url).origin)

function onMessage(e: MessageEvent): void {
  if (e.origin !== spelOrigin.value) return
  const d = e.data as { kalla?: string; typ?: string; personer?: unknown } | null
  if (!d || d.kalla !== 'xy-st2') return
  if (d.typ === 'ljus') ljusFranSpel(d as LjusMsg)
  else if (d.typ === 'skarp') emit('skarp')
  else if (d.typ === 'klar') emit('klar', tolkaPersoner(d.personer))
}
interface LjusMsg {
  lage?: string | null
  gest?: string
  utfall?: string
  farg?: { color?: string; effekt?: string } | null
  seg?: string[]
}
const LAGEN = ['vila', 'ankomst', 'startsida', 'tutorial', 'skarp', 'varning', 'sista', 'vinst', 'forlust', 'forlorarsida', 'oavgjort', 'spanning', 'vinnare', 'lek', 'av']
const GESTER = ['kvitto', 'ratt', 'inom', 'fel', 'over', 'oppnar', 'stanger', 'vinst', 'forlust', 'klar']
const UTFALL = ['vinst', 'forlust', 'forlorarsida', 'oavgjort'] as const
const EFFEKTER = ['av', 'static', 'blink', 'puls', 'chase']
function ljusFranSpel(m: LjusMsg): void {
  const ljus = useLjus()
  // Bara skalets egna segment (delad station: sida A rör aldrig B och tvärtom).
  const egna = props.egna
  const ids = m.seg?.length ? m.seg.filter((id) => !egna || egna.includes(id)) : egna
  if (m.seg?.length && !ids?.length) return
  if (m.lage !== undefined && (m.lage === null || LAGEN.includes(m.lage))) ljus.lage(m.lage as Lage | null, ids)
  if (m.gest && GESTER.includes(m.gest)) ljus.gest(m.gest as Gest, ids, { tyst: true })
  if (m.utfall && (UTFALL as readonly string[]).includes(m.utfall)) ljus.utfall(m.utfall as (typeof UTFALL)[number], ids, { tyst: true })
  if (m.farg === null) ljus.farg(null, ids)
  else if (m.farg && /^#[0-9a-fA-F]{6}$/.test(m.farg.color ?? '') && EFFEKTER.includes(m.farg.effekt ?? 'static'))
    ljus.farg({ color: m.farg.color!, effekt: (m.farg.effekt ?? 'static') as 'static' }, ids)
}
onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <iframe class="extern" :src="src" allow="microphone; autoplay; fullscreen; speaker-selection" title="Stationens spel" />
</template>

<style scoped>
.extern {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  border: 0;
  background: #05100b;
  z-index: 50;
}
</style>

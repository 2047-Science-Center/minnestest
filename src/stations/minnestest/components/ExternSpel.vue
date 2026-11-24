<script setup lang="ts">
/**
 * Station 2:s nya spel i helskärm (externSpel.ts): sida A = Människa eller maskin, sida B = Lögndetektorn.
 * Skalet skickar gruppens namn i turordning + sin origin; spelet svarar med postMessage
 * {kalla:"xy-st2", typ:"skarp"|"klar", personer?}. Bara meddelanden från spelets origin räknas.
 */
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { spelSrc, tolkaPersoner, type ExternPerson } from '../externSpel'

const props = defineProps<{ url: string; namn: string[]; grupp: string | null; mqttUrl: string | null }>()
const emit = defineEmits<{ skarp: []; klar: [personer: ExternPerson[]] }>()

const src = computed(() =>
  spelSrc({ url: props.url, namn: props.namn, grupp: props.grupp, skalOrigin: location.origin, mqttUrl: props.mqttUrl, search: location.search }),
)
const spelOrigin = computed(() => new URL(props.url).origin)

function onMessage(e: MessageEvent): void {
  if (e.origin !== spelOrigin.value) return
  const d = e.data as { kalla?: string; typ?: string; personer?: unknown } | null
  if (!d || d.kalla !== 'xy-st2') return
  if (d.typ === 'skarp') emit('skarp')
  else if (d.typ === 'klar') emit('klar', tolkaPersoner(d.personer))
}
onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <iframe class="extern" :src="src" allow="microphone; autoplay; fullscreen" title="Stationens spel" />
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

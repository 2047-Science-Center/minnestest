<script setup lang="ts">
/**
 * Incheckning / bipp-start (ruta 2). BIPPA DITT BAND — identifierar gruppen via
 * identitetstjänsten (reader-initierad: läsaren → regi → station2/rfid →
 * station2/identity). Faller ALLTID tillbaka på klick-igenom (mock-identitet)
 * så stationen går att testa utan hårdvara. CRT-standard via BippStart.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { useMinnestestStore } from '../store/minnestestStore'
import BippStart from '@/station-kit/components/BippStart.vue'
import { audio } from '@/station-kit/audio/AudioEngine'

const store = useMinnestestStore()
const identifiedName = ref<string | null>(null)
let unsub: (() => void) | null = null
let advanceTimer: ReturnType<typeof setTimeout> | null = null

function proceed() {
  if (advanceTimer) return
  advanceTimer = setTimeout(() => store.checkinDone(), 50)
}

onMounted(() => {
  unsub = store.listenIdentity((idn) => {
    if (identifiedName.value) return // redan identifierad denna omgång
    store.applyIdentity(idn)
    identifiedName.value = idn.medlemmar[0]?.name ?? idn.grupp
    audio.play('bipstart')
    // Kort bekräftelse, sedan vidare.
    advanceTimer = setTimeout(() => store.checkinDone(), 1100)
  })
})
onUnmounted(() => {
  unsub?.()
  if (advanceTimer) clearTimeout(advanceTimer)
})
</script>

<template>
  <BippStart :identified-name="identifiedName" @skip="proceed" />
</template>

<script setup lang="ts">
/**
 * Slutskärm = avslutet i fem takter (station-kit/resultat, XY-RESULTAT-OCH-VINST §2.3):
 * uppbyggnad → spänning → avslöjande → utfall → (checkout → done → lek).
 *  A Människotestet: "VÄLKOMNA IN"/"PORTEN STÄNGDES" + "11 av 15 svar lät mänskliga" + portarna.
 *  B Lögndetektorn:  betyget (MÄSTERLÖGNARE … GENOMSKÅDADE) + "9 av 15 lögner gick igenom".
 * Ljus + ljud på EGEN sida (varje sida = egen NUC): stänger → spänning → vinst/förlust efter
 * slaget (B: även VALdi-ringen). Minst 8 s från avslöjandet, auto-vidare efter 45 s (→ done).
 */
import { computed, onMounted } from 'vue'
import { thisSide } from '@/config'
import { useLjus } from '@/station-kit/ljus'
import { AvslutRuta, useAvslut } from '@/station-kit/resultat'
import { useMinnestestStore } from '../store/minnestestStore'
import { segmentFor } from '../ljus'
import { avslutText, utfallTyp } from '../avslutText'

const store = useMinnestestStore()
const ljus = useLjus()
const o = computed(() => store.outcome)
const isLd = computed(() => store.game === 'logndetektor')
const segs = computed(() => {
  const s: string[] = [segmentFor(store.game, thisSide())]
  if (isLd.value) s.push('valdi')
  return s
})
const text = computed(() => (o.value ? avslutText(store.game, o.value) : null))

const avslut = useAvslut({
  ljus: { skrivare: true, ids: [segmentFor(store.game, thisSide())] },
  onAvslojande: () => {
    const u = o.value?.granted ? 'vinst' : 'forlust'
    ljus.utfall(u, segs.value, { tyst: true })
    setTimeout(() => ljus.ljud(u), 650) // efter slaget, aldrig samtidigt
  },
  onAuto: () => store.resultDone(),
})
onMounted(() => avslut.start())
</script>

<template>
  <div class="result">
    <AvslutRuta
      v-if="o && text"
      :takt="avslut.takt.value"
      :typ="utfallTyp(o)"
      :uppbyggnad="text.uppbyggnad"
      :spanning="text.spanning"
      :eyebrow="text.eyebrow"
      :rubrik="text.rubrik"
      :siffra="text.siffra"
      :siffra-etikett="text.siffraEtikett"
      :rad="text.rad"
      :valdi="o.lastUtlatande"
      knapp="Vi är klara ▸"
      :kan-ga-vidare="avslut.kanGaVidare.value"
      @vidare="store.resultDone()"
    />
  </div>
</template>

<style scoped>
.result {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}
</style>

<script setup lang="ts">
/**
 * Mönstringsutlåtande (ruta 17): poängen visas ALDRIG som en naken siffra — den
 * byggs fram steg för steg i ResultWalkthrough (träff × resonemang / band +
 * motivering → medel/summa → röd tråd → slutpoäng + profil). Samma genomgång
 * körs efter övningen (mode="test") och efter skarpt (mode="live").
 */
import { useMinnestestStore } from '../store/minnestestStore'
import ResultWalkthrough from './ResultWalkthrough.vue'
import MediaSlot from './MediaSlot.vue'

const store = useMinnestestStore()
</script>

<template>
  <div class="verdict">
    <div class="verdict__bg" aria-hidden="true">
      <MediaSlot id="sorteringshatt_bg" :autoplay="false" />
    </div>
    <div class="verdict__fg">
      <ResultWalkthrough v-if="store.final" mode="live" @finish="store.verdictDone()" />
    </div>
  </div>
</template>

<style scoped>
.verdict {
  position: relative;
  height: 100%;
  min-height: 0;
}
.verdict__bg {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  pointer-events: none;
  display: flex;
  align-items: center;
}
.verdict__fg {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 0.5rem;
  min-height: 0;
}
</style>

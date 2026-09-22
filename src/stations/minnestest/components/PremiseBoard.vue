<script setup lang="ts">
/**
 * Premiss-tavlan "SÅ ÄR LÄGET" (visas efter hem-reveal, innan steg 1). Låser
 * världen: förbestämmer meta-frågetecknen (får vi gå ut? funkar mobilen? hur
 * länge?) så tänkandet i stegen hålls öppet men inom ramen. Fyra rader skrivs
 * in en och en; VI ÄR REDO ▸ tänds först när alla står.
 */
import { ref } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { useMinnestestStore } from '../store/minnestestStore'
import Teletype from '@/station-kit/components/Teletype.vue'

const { t } = useI18n()
const store = useMinnestestStore()

const lines = [t('premise.l1'), t('premise.l2'), t('premise.l3'), t('premise.l4')]
const visible = ref(1)
const ready = ref(false)

function lineDone(i: number): void {
  if (i < lines.length - 1) setTimeout(() => (visible.value = i + 2), 350)
  else ready.value = true
}
</script>

<template>
  <div class="premise">
    <div class="premise__board amber-frame">
      <h2 class="premise__title ink-strong">{{ t('premise.title') }}</h2>
      <ul class="premise__lines">
        <li v-for="(line, i) in lines.slice(0, visible)" :key="i" class="premise__line">
          <Teletype :text="line" :speed="26" @done="lineDone(i)" />
        </li>
      </ul>
    </div>
    <button
      class="crt-button crt-button--strong premise__go"
      :disabled="!ready"
      @click="store.premiseDone()"
    >
      {{ t('premise.ready') }} ▸
    </button>
  </div>
</template>

<style scoped>
.premise {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.premise__board {
  width: min(100%, 60ch);
  padding: 1.5rem 1.8rem;
  border-radius: var(--radius, 8px);
  background: rgba(0, 0, 0, 0.35);
}
.premise__title {
  font-family: var(--font-retro);
  letter-spacing: 0.18em;
  text-align: center;
  margin: 0 0 1.2rem;
  color: var(--color-primary);
}
.premise__lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.premise__line {
  font-size: 1.05rem;
  line-height: 1.45;
  color: var(--color-ink-strong);
}
.premise__go {
  align-self: center;
}
</style>

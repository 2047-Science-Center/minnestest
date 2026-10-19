<script setup lang="ts">
/**
 * Coach-intro (tutorial) — "lär genom att göra": grund-UI:t visas och vi
 * highlightar en del i taget med en kort bubbla, i stället för en textvägg.
 * Grenspecifikt (fermi: fråga → sifferväljare → tänk högt; flykt: läget →
 * fråga → tänk högt). Blått/mint = övning/genomgång. Leder in i övningsrundan.
 */
import { ref, computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useMinnestestStore } from '../store/minnestestStore'

const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
const store = useMinnestestStore()
const isFermi = computed(() => store.exampleType === 'fermi')

const bubbles = computed(() =>
  isFermi.value
    ? [t('coach.fermi.b1'), t('coach.fermi.b2'), t('coach.fermi.b3')]
    : [t('coach.flykt.b1'), t('coach.flykt.b2'), t('coach.flykt.b3')],
)

const beat = ref(0)
const last = computed(() => beat.value >= 2)
function active(i: number): boolean {
  return beat.value === i
}
function next(): void {
  if (last.value) {
    emit('done')
    return
  }
  beat.value += 1
  audio.play('blip')
}
</script>

<template>
  <div class="coach">
    <header class="coach__head">
      <h2 class="coach__title ink-strong">{{ t('coach.title') }}</h2>
      <span class="coach__badge">ÖVNING</span>
    </header>

    <!-- grund-UI-skelett med highlight per beat -->
    <div class="coach__ui">
      <template v-if="isFermi">
        <div class="zone" :class="{ 'zone--on': active(0) }">
          <span class="zone__tag">{{ t('coach.fermi.z1') }}</span>
          <span class="zone__q">{{ t('coach.fermi.z1_ex') }}</span>
        </div>
        <div class="zone zone--row" :class="{ 'zone--on': active(1) }">
          <span class="stp">−</span>
          <span class="stp__val">1 500</span><span class="stp__u">kg</span>
          <span class="stp">+</span>
          <span class="zone__tag zone__tag--r">{{ t('coach.fermi.z2') }}</span>
        </div>
        <div class="zone zone--row" :class="{ 'zone--on': active(2) }">
          <span class="zone__th">{{ t('coach.fermi.z3') }}</span>
          <span class="zone__ex">{{ t('coach.fermi.z3_ex') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="zone" :class="{ 'zone--on': active(0) }">
          <span class="zone__tag">{{ t('coach.flykt.z1') }}</span>
          <span class="zone__ex">{{ t('coach.flykt.z1_ex') }}</span>
        </div>
        <div class="zone" :class="{ 'zone--on': active(1) }">
          <span class="zone__tag">{{ t('coach.flykt.z2') }}</span>
          <span class="zone__q">{{ t('coach.flykt.z2_ex') }}</span>
        </div>
        <div class="zone zone--row" :class="{ 'zone--on': active(2) }">
          <span class="zone__th">{{ t('coach.flykt.z3') }}</span>
          <span class="zone__ex">{{ t('coach.flykt.z3_ex') }}</span>
        </div>
      </template>
    </div>

    <!-- coach-bubbla -->
    <div class="coach__bubble">
      <span class="coach__step">{{ beat + 1 }}/3</span>
      <span class="coach__text ink-strong">{{ bubbles[beat] }}</span>
    </div>

    <div class="coach__foot">
      <span class="coach__hint">{{ t('coach.hint') }}</span>
      <button class="crt-button crt-button--strong coach__btn" @click="next">
        {{ last ? (isFermi ? t('coach.start_fermi') : t('coach.start_flykt')) : t('coach.next') }} ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.coach {
  --mint: #35e0d0;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.coach__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.coach__title {
  font-family: var(--font-retro);
  letter-spacing: 0.14em;
  margin: 0;
}
.coach__badge {
  background: var(--mint);
  color: var(--color-background);
  font-family: var(--font-retro);
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  padding: 0.05em 0.7em;
  border-radius: 6px;
}
.coach__ui {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  justify-content: center;
}
.zone {
  border: 2px solid #16241c;
  border-radius: 10px;
  padding: 0.8rem 1rem;
  opacity: 0.35;
  transition: opacity 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.zone--row {
  flex-direction: row;
  align-items: center;
  gap: 0.8rem;
}
.zone--on {
  opacity: 1;
  border-color: var(--mint);
}
.zone__tag {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  color: var(--mint);
}
.zone__tag--r {
  margin-left: auto;
}
.zone__q {
  font-family: var(--font-retro);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  color: var(--color-primary);
  line-height: 1;
}
.zone__ex {
  color: var(--color-ink-strong);
}
.zone__th {
  font-family: var(--font-retro);
  font-size: 1.4rem;
  color: var(--mint);
}
.stp {
  width: 2.6rem;
  height: 2.6rem;
  border: 2px solid var(--mint);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-retro);
  font-size: 1.8rem;
  color: var(--color-ink-strong);
}
.stp__val {
  font-family: var(--font-retro);
  font-size: 2.2rem;
  color: var(--color-primary);
}
.stp__u {
  font-size: 0.85rem;
  color: var(--color-ink-muted);
}
.coach__bubble {
  background: var(--color-background-2);
  border: 1px solid var(--mint);
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.coach__step {
  font-family: var(--font-retro);
  font-size: 1.4rem;
  color: var(--mint);
}
.coach__text {
  font-size: 1.15rem;
}
.coach__foot {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.coach__hint {
  font-size: 0.85rem;
  color: var(--color-ink-muted);
}
.coach__btn {
  margin-left: auto;
}
</style>

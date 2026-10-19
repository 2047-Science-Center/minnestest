<script setup lang="ts">
/**
 * Resultat-genomgång — stegar EN beat i taget genom hur slutpoängen byggdes:
 * per steg (träff × resonemang → delpoäng, resp. band + motivering), sedan
 * medel/summa → röd tråd → slutpoäng + profil. Poängen visas aldrig naken; den
 * byggs fram. Återanvänds i TVÅ lägen (speglar Förhandlingens ResultWalkthrough):
 *   mode="test" → efter övningen (knappen leder vidare till skarpt)
 *   mode="live" → efter det skarpa spelet (knappen → utcheckning)
 */
import { ref, computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useMinnestestStore } from '../store/minnestestStore'

const props = withDefaults(defineProps<{ mode?: 'test' | 'live' }>(), { mode: 'live' })
const emit = defineEmits<{ finish: [] }>()

const { t } = useI18n()
const store = useMinnestestStore()

const isFermi = computed(() => store.exampleType === 'fermi')
const accent = computed(() => (props.mode === 'test' ? '#35e0d0' : '#ff9500'))

// Bandpoäng (flykt) — stabila stationskonstanter (speglar configs/flykt.json).
const BAND_POINTS: Record<string, number> = { Svag: 1, Godkänd: 2, Stark: 3 }

interface Row {
  label: string
  points: number
  traff?: string
  niva?: string
  band?: string
  motiverat?: boolean
}

const rows = computed<Row[]>(() =>
  store.steps.map((_s, i) => {
    const a = store.assessments[i]
    const label = isFermi.value ? t(`reveal.fermi.steg${i + 1}`) : t(`reveal.flykt.steg${i + 1}`)
    if (isFermi.value) {
      return {
        label,
        points: a?.delpoang ?? 0,
        traff: a?.traff ? t(`reveal.traff.${a.traff}`) : '—',
        niva: a?.resonemang_niva ?? '—',
      }
    }
    return {
      label,
      points: BAND_POINTS[a?.band ?? 'Godkänd'] ?? 0,
      band: a?.band ?? '—',
      motiverat: a?.motiverat ?? false,
    }
  }),
)

const summary = computed(() => {
  const pts = rows.value.map((r) => r.points)
  const sum = pts.reduce((s, n) => s + n, 0)
  const mean = pts.length ? Math.round(sum / pts.length) : 0
  const bonus = isFermi.value
    ? store.assessments[2]?.traff === 'prick'
      ? 1
      : 0
    : store.assessments.filter((a) => a?.dimensioner?.anpassning).length >= 2
      ? 1
      : 0
  return {
    base: sum,
    mean,
    bonus,
    poang: store.final?.poang ?? 0,
    markering: store.final?.markering ?? '',
    profil: store.final?.profil ?? '',
    sammanfattning: store.final?.sammanfattning ?? '',
  }
})

// --- Beats: ett steg i taget, sedan slutsummering ---
const beat = ref(0)
const stepCount = computed(() => store.steps.length)
const showSummary = computed(() => beat.value >= stepCount.value)
const atEnd = showSummary

function next(): void {
  if (showSummary.value) {
    emit('finish')
    return
  }
  beat.value += 1
  audio.play(beat.value >= stepCount.value ? 'confirm' : 'blip')
}
</script>

<template>
  <div class="rw" :style="{ '--acc': accent }">
    <h2 class="rw__title ink-strong">{{ t('reveal.title') }}</h2>
    <p class="rw__caption">{{ showSummary ? t('reveal.caption_final') : t('reveal.caption_steps') }}</p>

    <div class="rw__rows">
      <template v-for="(r, i) in rows" :key="i">
        <div v-if="beat >= i" class="rw__row rw__in">
          <span class="rw__step">Steg {{ i + 1 }} · {{ r.label }}</span>
          <template v-if="isFermi">
            <span class="rw__tag">{{ r.traff }}</span>
            <span class="rw__x">×</span>
            <span class="rw__tag">{{ r.niva }}</span>
          </template>
          <template v-else>
            <span class="rw__tag">{{ r.band }}</span>
            <span class="rw__mot" :class="{ 'rw__mot--no': !r.motiverat }">{{ r.motiverat ? '✓ varför' : '✗ varför' }}</span>
          </template>
          <span class="rw__pts">{{ isFermi ? r.points : '+' + r.points }}</span>
        </div>
      </template>
    </div>

    <transition name="rw-fade">
      <div v-if="showSummary" class="rw__summary">
        <div class="rw__calc">
          <span class="rw__calc-label">{{ isFermi ? t('reveal.medel') : t('reveal.summa') }}</span>
          <span class="rw__calc-val">{{ isFermi ? summary.mean : summary.base }}</span>
        </div>
        <div v-if="summary.bonus" class="rw__calc rw__calc--bonus">
          <span class="rw__calc-label">{{ t('reveal.rodtrad') }}</span>
          <span class="rw__calc-note">{{ isFermi ? t('reveal.rodtrad_fermi') : t('reveal.rodtrad_flykt') }}</span>
          <span class="rw__calc-val">+{{ summary.bonus }}</span>
        </div>

        <div class="rw__hero">
          <span class="rw__poang">{{ summary.poang }}</span>
          <div class="rw__herometa">
            <span class="rw__mark ink-strong">{{ summary.markering }}</span>
            <span class="rw__profil">{{ t('verdict.profile_label', { roll: store.roleId ? t(`role.${store.roleId}.upper`) : '', profil: summary.profil }) }}</span>
          </div>
        </div>
        <p v-if="summary.sammanfattning" class="rw__sum">{{ summary.sammanfattning }}</p>
      </div>
    </transition>

    <button class="crt-button crt-button--strong rw__btn" @click="next">
      <template v-if="!atEnd">{{ t('reveal.next') }} ▸</template>
      <template v-else-if="props.mode === 'test'">{{ t('reveal.to_live') }} ▸</template>
      <template v-else>{{ t('reveal.to_checkout') }} ▸</template>
    </button>
  </div>
</template>

<style scoped>
.rw {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  overflow: auto;
}
.rw__title {
  font-family: var(--font-retro);
  letter-spacing: 0.14em;
  text-align: center;
  margin: 0;
}
.rw__caption {
  text-align: center;
  color: var(--color-ink-muted);
  margin: 0;
}
.rw__rows {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.rw__row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 0.5rem;
  font-size: 1.05rem;
}
.rw__step {
  min-width: 15ch;
  color: var(--color-ink-muted);
}
.rw__tag {
  color: var(--color-ink-strong);
}
.rw__x {
  color: var(--color-ink-muted);
}
.rw__mot {
  color: var(--acc);
  font-size: 0.9rem;
}
.rw__mot--no {
  color: var(--color-danger, #ff5a3c);
}
.rw__pts {
  margin-left: auto;
  font-family: var(--font-retro);
  font-size: 1.9rem;
  color: var(--acc);
}
.rw__in {
  animation: rw-in 0.3s ease-out;
}
.rw__summary {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border-top: 2px solid var(--acc);
  padding-top: 0.8rem;
}
.rw__calc {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
}
.rw__calc-label {
  color: var(--color-ink-muted);
}
.rw__calc-note {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}
.rw__calc-val {
  margin-left: auto;
  font-family: var(--font-retro);
  font-size: 1.6rem;
  color: var(--color-ink-strong);
}
.rw__calc--bonus .rw__calc-label {
  color: var(--acc);
}
.rw__hero {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 0.3rem;
}
.rw__poang {
  font-family: var(--font-retro);
  font-size: clamp(3.4rem, 10vw, 5.4rem);
  line-height: 0.9;
  color: var(--acc);
  text-shadow: 0 0 20px color-mix(in srgb, var(--acc) 55%, transparent);
}
.rw__herometa {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.rw__mark {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  letter-spacing: 0.06em;
  color: var(--color-ink-strong);
}
.rw__profil {
  color: var(--color-ink-muted);
  font-size: 0.95rem;
}
.rw__sum {
  color: var(--color-ink-strong);
  line-height: 1.5;
  margin: 0;
}
.rw__btn {
  align-self: center;
  margin-top: auto;
}
@keyframes rw-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
.rw-fade-enter-active {
  transition: opacity 0.4s ease;
}
.rw-fade-enter-from {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .rw__in,
  .rw-fade-enter-active {
    animation: none;
    transition: none;
  }
}
</style>

<script setup lang="ts">
/**
 * Slut-ceremoni — poängen visas ALDRIG naken. Enheten räknar upp de TRE
 * resonemangs-kriterierna ett i taget (namn + poäng/10 + kort motivering), sedan
 * TOTALEN på 1–10-skalan (markering + profil), sedan EN uppläst slutmening.
 * Samma ceremoni efter övningen (mode="test", cyan) och efter skarpt (mode="live",
 * bärnsten). Kriterie-poängen sätts av modellen; totalen räknas i gatewayen.
 */
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { audio } from '@/station-kit/audio/AudioEngine'
import { useMinnestestStore } from '../store/minnestestStore'

const props = withDefaults(defineProps<{ mode?: 'test' | 'live' }>(), { mode: 'live' })
const emit = defineEmits<{ finish: [] }>()

const { t } = useI18n()
const store = useMinnestestStore()

const isTest = computed(() => props.mode === 'test')
const accent = computed(() => (isTest.value ? '#35e0d0' : '#ff9500'))

const kriterier = computed(() => store.final?.kriterier ?? [])
const poang = computed(() => store.final?.poang ?? 0)
const markering = computed(() => store.final?.markering ?? '')
const profil = computed(() => store.final?.profil ?? '')
const slutmening = computed(() => store.final?.slutmening ?? '')

// --- Beats: ett kriterium i taget, sedan total + slutmening ---
const beat = ref(0)
const nCrit = computed(() => kriterier.value.length)
const showSummary = computed(() => store.final != null && beat.value >= nCrit.value)

let spoken = false
function speakOnce(): void {
  if (spoken) return
  spoken = true
  if (slutmening.value) void store.speakNpc(slutmening.value)
}

function next(): void {
  if (!store.final) return
  if (showSummary.value) {
    emit('finish')
    return
  }
  beat.value += 1
  if (beat.value >= nCrit.value) {
    audio.play(!isTest.value && poang.value >= 7 ? 'positive' : 'confirm')
    speakOnce()
  } else {
    audio.play('blip')
  }
}

// Om final kommer in medan vi redan står på "summary-beat" (t.ex. 0 kriterier) → läs ändå.
watch(showSummary, (v) => {
  if (v) speakOnce()
})
</script>

<template>
  <div class="rw" :style="{ '--acc': accent }">
    <!-- Väntar på enhetens vägning (compose pågår) -->
    <div v-if="!store.final" class="rw__wait">
      <span class="rw__wait-txt">{{ t('reveal.composing') }}</span>
      <span class="rw__dots"><i /><i /><i /></span>
    </div>

    <template v-else>
      <h2 class="rw__title ink-strong">{{ t('reveal.title') }}</h2>
      <p class="rw__caption">{{ showSummary ? t('reveal.caption_total') : t('reveal.caption_criteria') }}</p>

      <!-- Kriterierna räknas upp ett i taget -->
      <div class="rw__rows">
        <template v-for="(k, i) in kriterier" :key="i">
          <div v-if="beat >= i" class="rw__row rw__in">
            <span class="rw__knamn ink-strong">{{ k.namn }}</span>
            <span class="rw__kpts">{{ k.poang }}<small>/10</small></span>
            <p class="rw__kmot">{{ k.motivering }}</p>
          </div>
        </template>
      </div>

      <!-- Total + profil + slutmening -->
      <transition name="rw-fade">
        <div v-if="showSummary" class="rw__summary">
          <div class="rw__hero">
            <span class="rw__poang">{{ poang }}<small>/10</small></span>
            <div class="rw__herometa">
              <span v-if="markering" class="rw__mark ink-strong">{{ markering }}</span>
              <span v-if="profil" class="rw__profil">{{
                t('verdict.profile_label', {
                  roll: store.roleId ? t(`role.${store.roleId}.upper`) : '',
                  profil,
                })
              }}</span>
            </div>
          </div>
          <p v-if="slutmening" class="rw__slut">{{ slutmening }}</p>
          <p v-if="isTest" class="rw__note">{{ t('reveal.test_note') }}</p>
        </div>
      </transition>

      <button class="crt-button crt-button--strong rw__btn" @click="next">
        <template v-if="!showSummary">{{ t('reveal.next') }} ▸</template>
        <template v-else-if="isTest">{{ t('reveal.to_live') }} ▸</template>
        <template v-else>{{ t('reveal.to_checkout') }} ▸</template>
      </button>
    </template>
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
.rw__wait {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}
.rw__wait-txt {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}
.rw__dots {
  display: inline-flex;
  gap: 4px;
}
.rw__dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--acc);
  animation: rw-blink 1s infinite;
}
.rw__dots i:nth-child(2) {
  animation-delay: 0.2s;
}
.rw__dots i:nth-child(3) {
  animation-delay: 0.4s;
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
  gap: 0.7rem;
}
.rw__row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 0.2rem 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-bottom: 0.55rem;
}
.rw__knamn {
  font-family: var(--font-retro);
  font-size: 1.5rem;
  letter-spacing: 0.04em;
}
.rw__kpts {
  font-family: var(--font-retro);
  font-size: 2rem;
  color: var(--acc);
  justify-self: end;
}
.rw__kpts small,
.rw__poang small {
  font-size: 0.5em;
  color: var(--color-ink-muted);
}
.rw__kmot {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--color-ink-strong);
  line-height: 1.45;
}
.rw__in {
  animation: rw-in 0.3s ease-out;
}
.rw__summary {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  border-top: 2px solid var(--acc);
  padding-top: 0.9rem;
  margin-top: 0.2rem;
}
.rw__hero {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.rw__poang {
  font-family: var(--font-retro);
  font-size: clamp(3.4rem, 11vw, 5.6rem);
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
  font-size: 1.6rem;
  letter-spacing: 0.06em;
}
.rw__profil {
  color: var(--color-ink-muted);
  font-size: 0.95rem;
}
.rw__slut {
  color: var(--color-ink-strong);
  font-size: clamp(1.15rem, 2.4vw, 1.6rem);
  line-height: 1.5;
  margin: 0;
}
.rw__note {
  color: var(--acc);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
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
@keyframes rw-blink {
  50% {
    opacity: 0.25;
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
  .rw__dots i,
  .rw-fade-enter-active {
    animation: none;
    transition: none;
  }
}
</style>

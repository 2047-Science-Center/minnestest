<script setup lang="ts">
/**
 * VALVPORTEN — man står framför dörren i rummet. Tillstånd:
 *   closed    — stängd port (väntar).
 *   overvager — "VALDI ÖVERVÄGER" arbetar PÅ dörren.
 *   open      — porten ÖPPNAS (ÖPPNINGS-VIDEON spelas; ljus strömmar ut).
 *   denied    — rött larm, porten förblir stängd.
 *
 * Varje rum har en STÄNGD-stillbild (DOOR_ART.still) + en ÖPPNINGS-video
 * (DOOR_ART.video). Stillbilden visas stängd/under överväganden; videon spelas
 * vid 'open'. Saknas video → CSS-öppningsblixt över stillbilden. Övningen (ingen
 * art) → CSS-ritad port. Rumsnumret är inbakat i arten.
 */
import { computed } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { asset, DOOR_ART, type RoomColor } from '@/config'

const props = defineProps<{
  state: 'closed' | 'overvager' | 'open' | 'denied'
  accent: string
  accentRgb: string
  color: RoomColor
  roomNr: number
  roomName: string
  /** Övningen: ingen rums-art → CSS-porten. */
  tutorial?: boolean
}>()

const { t } = useI18n()

const art = computed(() => (props.tutorial ? null : DOOR_ART[props.color]))
const hasArt = computed(() => art.value != null)
const stillSrc = computed(() => (art.value ? asset(art.value.still) : ''))
const videoSrc = computed(() => (art.value?.video ? asset(art.value.video) : ''))
const playOpening = computed(() => props.state === 'open' && Boolean(videoSrc.value))
</script>

<template>
  <div
    class="door"
    :class="[`door--${state}`, hasArt ? 'door--art' : 'door--css']"
    :style="{ '--acc': accent, '--acc-rgb': accentRgb }"
  >
    <!-- ========== ART-LÄGE (riktiga valv-rum) ========== -->
    <template v-if="hasArt">
      <img class="door__still" :src="stillSrc" alt="" />
      <!-- Öppnings-videon spelas EN gång vid 'open' och håller sista rutan -->
      <video
        v-if="playOpening"
        :key="videoSrc"
        class="door__video"
        :src="videoSrc"
        autoplay
        muted
        playsinline
      />
      <!-- Fallback-blixt när öppnings-video saknas -->
      <div v-else-if="state === 'open'" class="door__flash" aria-hidden="true" />
      <!-- Scan medan Valdi överväger -->
      <div v-if="state === 'overvager'" class="door__scan" aria-hidden="true" />
      <div class="door__tint" aria-hidden="true" />
    </template>

    <!-- ========== CSS-LÄGE (övningen) ========== -->
    <template v-else>
      <div class="door__ambient" aria-hidden="true" />
      <div class="door__light" aria-hidden="true" />
      <div class="door__leaf door__leaf--l" aria-hidden="true"><div class="door__ridges" /></div>
      <div class="door__leaf door__leaf--r" aria-hidden="true"><div class="door__ridges" /></div>
      <div class="door__hub" :class="{ spin: state === 'overvager' }" aria-hidden="true">
        <span class="door__hub-ring" />
        <span class="door__hub-ring door__hub-ring--2" />
        <span class="door__hub-core" />
      </div>
    </template>

    <!-- Overlay-texter per tillstånd (gemensamt) -->
    <div class="door__overlay">
      <p v-if="state === 'overvager'" class="door__status door__status--work">
        {{ t('door.overvager') }}<span class="door__ell"><i>.</i><i>.</i><i>.</i></span>
      </p>
      <p v-else-if="state === 'open'" class="door__status door__status--granted">
        {{ t('door.granted') }}
      </p>
      <p v-else-if="state === 'denied'" class="door__status door__status--denied">
        {{ t('door.denied') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.door {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- ART-LÄGE ---------- */
.door__still,
.door__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.door__still {
  z-index: 0;
}
.door__video {
  z-index: 1;
  animation: art-in 0.4s ease-out both;
}
@keyframes art-in {
  from {
    opacity: 0;
  }
}
.door__tint {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
}
.door--denied .door__tint {
  background: radial-gradient(ellipse at center, rgba(255, 90, 60, 0.25), rgba(0, 0, 0, 0.7) 75%);
  animation: deny-flash 0.6s steps(2) 3;
}
.door__scan {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(var(--acc-rgb), 0.18) 48%,
    rgba(var(--acc-rgb), 0.28) 50%,
    rgba(var(--acc-rgb), 0.18) 52%,
    transparent 100%
  );
  background-size: 100% 42%;
  background-repeat: no-repeat;
  animation: door-scan 2s linear infinite;
}
@keyframes door-scan {
  0% {
    background-position: 0 -45%;
  }
  100% {
    background-position: 0 145%;
  }
}
.door__flash {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #fff;
  opacity: 0;
  animation: door-flash 1.4s ease-out both;
}
@keyframes door-flash {
  0% {
    opacity: 0;
  }
  35% {
    opacity: 0.85;
  }
  100% {
    opacity: 0.35;
  }
}

/* ---------- CSS-LÄGE (övningen) ---------- */
.door__ambient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(var(--acc-rgb), 0.22), rgba(0, 0, 0, 0.85) 75%);
}
.door__light {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: #fff;
  opacity: 0;
  box-shadow: 0 0 60px 30px rgba(255, 255, 255, 0.5);
  transition: opacity 0.4s ease-out;
  z-index: 1;
}
.door__leaf {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  z-index: 2;
  background: linear-gradient(180deg, #1a1d20, #0c0e10);
  border: 1px solid rgba(var(--acc-rgb), 0.35);
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.8);
  transition: transform 1.5s cubic-bezier(0.76, 0, 0.24, 1);
}
.door__leaf--l {
  left: 0;
  border-right: 2px solid rgba(var(--acc-rgb), 0.5);
}
.door__leaf--r {
  right: 0;
  border-left: 2px solid rgba(var(--acc-rgb), 0.5);
}
.door__ridges {
  position: absolute;
  inset: 8% 10%;
  background: repeating-linear-gradient(180deg, rgba(var(--acc-rgb), 0.06) 0 14px, transparent 14px 34px);
  border-radius: 6px;
}
.door__hub {
  position: relative;
  z-index: 3;
  width: clamp(5rem, 16vw, 9rem);
  height: clamp(5rem, 16vw, 9rem);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease-out;
}
.door__hub-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(var(--acc-rgb), 0.6);
  box-shadow: 0 0 20px rgba(var(--acc-rgb), 0.5);
}
.door__hub-ring--2 {
  inset: 18%;
  border-style: dashed;
  opacity: 0.7;
}
.door__hub-core {
  width: 36%;
  height: 36%;
  border-radius: 50%;
  background: var(--acc);
  box-shadow: 0 0 24px rgba(var(--acc-rgb), 0.9);
}
.door__hub.spin .door__hub-ring {
  animation: hub-spin 2.4s linear infinite;
}
.door__hub.spin .door__hub-ring--2 {
  animation: hub-spin 1.6s linear infinite reverse;
}
@keyframes hub-spin {
  to {
    transform: rotate(360deg);
  }
}
.door--css.door--open .door__leaf--l {
  transform: translateX(-102%);
}
.door--css.door--open .door__leaf--r {
  transform: translateX(102%);
}
.door--css.door--open .door__light {
  opacity: 1;
  width: 100%;
}
.door--css.door--open .door__hub {
  opacity: 0;
}

/* ---------- Overlay-texter ---------- */
.door__overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.door__status {
  font-family: var(--font-retro);
  font-size: clamp(2rem, 6.5vw, 3.6rem);
  letter-spacing: 0.08em;
  margin: 0;
  text-align: center;
  padding: 0.3em 0.7em;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 10px;
}
.door__status--work {
  color: var(--acc);
  text-shadow: 0 0 18px rgba(var(--acc-rgb), 0.7);
  animation: work-pulse 1.5s ease-in-out infinite;
}
.door__status--granted {
  color: var(--color-lag2, #7ad14f);
  text-shadow: 0 0 22px rgba(122, 209, 79, 0.8);
  animation: pop-in 0.5s var(--ease-out, ease-out) both;
}
.door__status--denied {
  color: var(--color-danger, #ff5a3c);
  text-shadow: 0 0 22px rgba(255, 90, 60, 0.8);
  animation: deny-shake 0.5s ease-out both;
}
.door__ell {
  display: inline-flex;
}
.door__ell i {
  animation: ell 1.2s infinite;
}
.door__ell i:nth-child(2) {
  animation-delay: 0.2s;
}
.door__ell i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes work-pulse {
  50% {
    opacity: 0.55;
  }
}
@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes deny-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}
@keyframes deny-flash {
  50% {
    opacity: 0.4;
  }
}
@keyframes ell {
  50% {
    opacity: 0.2;
  }
}
@media (prefers-reduced-motion: reduce) {
  .door__leaf,
  .door__video,
  .door__scan,
  .door__flash,
  .door__hub.spin .door__hub-ring,
  .door__hub.spin .door__hub-ring--2,
  .door__status--work,
  .door__ell i,
  .door--denied .door__tint {
    animation: none;
    transition: none;
  }
}
</style>

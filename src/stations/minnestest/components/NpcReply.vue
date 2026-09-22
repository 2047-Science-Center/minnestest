<script setup lang="ts">
/**
 * NPC-svaret (delruta D): "inkommande"-typning, prefix ENHETEN //, bärnstenston,
 * valfri talande-vågform + porträtt. Texten är alltid grunden; röst (om på)
 * läggs ovanpå av föräldern via /speak-adaptern.
 */
import Teletype from '@/station-kit/components/Teletype.vue'
import MediaSlot from './MediaSlot.vue'
import { useI18n } from '@/station-kit/i18n'

withDefaults(
  defineProps<{
    text: string
    /** Visa talande-vågform (röst på / läses upp). */
    speaking?: boolean
    /** Visa NPC-porträtt uppe till vänster. */
    portrait?: boolean
  }>(),
  { speaking: false, portrait: false },
)

const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="npc">
    <div v-if="portrait" class="npc__portrait">
      <MediaSlot id="npc_portratt" :autoplay="false" />
    </div>
    <div class="npc__body">
      <div class="npc__head">
        <span class="npc__prefix ink-strong">{{ t('npc.prefix') }}</span>
        <span v-if="speaking" class="npc__wave" aria-hidden="true">
          <i v-for="n in 5" :key="n" :style="{ animationDelay: n * 0.08 + 's' }" />
        </span>
      </div>
      <Teletype class="npc__text" :text="text" :speed="24" @done="emit('done')" />
    </div>
  </div>
</template>

<style scoped>
.npc {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.npc__portrait {
  width: 96px;
  flex: 0 0 auto;
}
.npc__body {
  flex: 1;
  min-width: 0;
}
.npc__head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.4rem;
}
.npc__prefix {
  font-family: var(--font-retro);
  letter-spacing: 0.15em;
  color: var(--color-primary);
}
.npc__text {
  font-size: 1.15rem;
  line-height: 1.5;
  color: var(--color-ink-strong);
}
.npc__wave {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 1rem;
}
.npc__wave i {
  width: 3px;
  height: 100%;
  background: var(--color-primary);
  transform-origin: bottom;
  animation: npc-wave 0.6s ease-in-out infinite alternate;
}
@keyframes npc-wave {
  from {
    transform: scaleY(0.25);
  }
  to {
    transform: scaleY(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .npc__wave i {
    animation: none;
    transform: scaleY(0.6);
  }
}
</style>

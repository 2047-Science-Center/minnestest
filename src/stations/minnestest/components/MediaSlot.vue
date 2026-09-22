<script setup lang="ts">
/**
 * Renderar rätt aspect-ratio + streckad ram + etikett `[VIDEO: id — brief]`
 * tills riktig media droppas i public/media/ (då fylls `file` i manifestet och
 * en <video>/<img> visas i stället). Layout färdig, media utbytbar.
 */
import { computed } from 'vue'
import { media } from '../media/manifest'

const props = withDefaults(
  defineProps<{
    id: string
    autoplay?: boolean
    loop?: boolean
    /** Dämpad uppspelning (narrativt ljud kan tändas när riktig media finns). */
    muted?: boolean
  }>(),
  { autoplay: true, loop: false, muted: true },
)

const emit = defineEmits<{ ended: [] }>()

const m = computed(() => media(props.id))
const kind = computed(() =>
  m.value.typ === 'image' ? 'BILD' : m.value.typ === 'video-loop' ? 'VIDEO (loop)' : 'VIDEO',
)
const ratio = computed(() => (m.value.aspect === '1:1' ? '1 / 1' : '16 / 9'))
const isVideo = computed(() => m.value.typ !== 'image')
</script>

<template>
  <div class="slot amber-frame" :style="{ aspectRatio: ratio }">
    <template v-if="m.src">
      <video
        v-if="isVideo"
        class="slot__media"
        :src="m.src"
        :autoplay="autoplay"
        :loop="loop || m.typ === 'video-loop'"
        :muted="muted"
        playsinline
        @ended="emit('ended')"
      />
      <img v-else class="slot__media" :src="m.src" :alt="m.brief" />
    </template>

    <div v-else class="slot__placeholder" role="img" :aria-label="`${kind}: ${m.id} — ${m.brief}`">
      <span class="slot__tag">[{{ kind }}: {{ m.id }}]</span>
      <span class="slot__brief">{{ m.brief }}</span>
    </div>
  </div>
</template>

<style scoped>
.slot {
  position: relative;
  width: 100%;
  max-width: 100%;
  /* Överskrid aldrig förälderns höjd (flex:1-scen) — annars kan den höga
   *  16:9-rutan svämma över och täcka knappar under (t.ex. BÖRJA på hem-
   *  revealet på breda skärmar). Höjd har företräde → aspect-ratio ger vika. */
  max-height: 100%;
  overflow: hidden;
  border-radius: var(--radius, 8px);
  background: #0a0a0a;
}
.slot__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.slot__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;
  border: 2px dashed var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  color: var(--color-ink-muted);
}
.slot__tag {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  color: var(--color-primary);
}
.slot__brief {
  font-size: 0.8rem;
  max-width: 34ch;
  opacity: 0.8;
}
</style>

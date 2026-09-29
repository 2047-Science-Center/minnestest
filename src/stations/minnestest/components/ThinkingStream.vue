<script setup lang="ts">
/**
 * "Tänkande-ström" som visas under analys-väntan: ENHETEN tänker högt, en rad i
 * taget — hälften ekar tillbaka fragment av det deltagarna FAKTISKT sa, hälften
 * små komiska pseudo-dator-tankar (som att se Claude tänka i förbifarten).
 * Ren ögongodis under väntan; påverkar inte bedömningen.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  transcript: string
  flavor: 'flykt' | 'fermi'
}>()

// Komiska "dator-tankar" — gemensam pool + gren-krydda.
const COMIC_COMMON = [
  'väger orden …',
  'kalibrerar medkänsla till 87 %',
  'jämför med 3 000 tidigare svar',
  'kollar en gång till, för säkerhets skull',
  'letar efter en siffra … hittar en metafor',
  'noterar tonläget',
  'hmm.',
  'dammar av det gamla facit',
]
const COMIC_FLYKT = [
  'packar om era ord i en väska',
  'räknar filtar … tappar räkningen',
  'kollar väderleken år 1994',
]
const COMIC_FERMI = [
  'försöker dela med noll … ångrar mig',
  'rundar av till närmaste storleksordning',
  'multiplicerar i huvudet (jag har inget huvud)',
]
const ECHO_PREFIX = ['hörde: «{f}»', 'noterar: «{f}»', 'fastnar för: «{f}»', 'sparar: «{f}»']

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Plocka ut 3–5-ords-fragment ur transkriptet.
function fragments(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const words = clean.split(' ')
  const out: string[] = []
  let i = 0
  while (i < words.length && out.length < 4) {
    const len = 3 + Math.floor(Math.random() * 3) // 3–5 ord
    const frag = words.slice(i, i + len).join(' ').replace(/[.,!?]+$/, '')
    if (frag.trim().length > 1) out.push(frag)
    i += len
  }
  return out
}

// Väv ihop en sekvens: komisk → eko → komisk → eko …
const script = computed<string[]>(() => {
  const comic = shuffle([
    ...COMIC_COMMON,
    ...(props.flavor === 'fermi' ? COMIC_FERMI : COMIC_FLYKT),
  ])
  const frags = fragments(props.transcript)
  const echoes = shuffle(ECHO_PREFIX).slice(0, frags.length).map((p, i) => p.replace('{f}', frags[i]))

  const seq: string[] = []
  let ci = 0
  let ei = 0
  // Öppna med en tanke, avsluta med en.
  seq.push(comic[ci++ % comic.length])
  while (ei < echoes.length || seq.length < 6) {
    if (ei < echoes.length) seq.push(echoes[ei++])
    seq.push(comic[ci++ % comic.length])
    if (seq.length > 9) break
  }
  return seq
})

const shown = ref<string[]>([])
let idx = 0
let timer: ReturnType<typeof setTimeout> | null = null

function tick(): void {
  if (idx >= script.value.length) return
  shown.value = [...shown.value, script.value[idx]]
  idx += 1
  // Ojämn takt känns mer "levande".
  const delay = 650 + Math.floor(Math.random() * 500)
  timer = setTimeout(tick, delay)
}

onMounted(() => {
  timer = setTimeout(tick, 400)
})
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="stream" aria-hidden="true">
    <transition-group name="ln" tag="div" class="stream__lines">
      <p
        v-for="(l, i) in shown"
        :key="i"
        class="stream__line"
        :class="{ 'stream__line--last': i === shown.length - 1 }"
      >
        <span class="stream__caret">›</span> {{ l }}
      </p>
    </transition-group>
  </div>
</template>

<style scoped>
.stream {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.stream__lines {
  width: min(92%, 52ch);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.stream__line {
  font-family: var(--font-mono);
  font-size: clamp(0.95rem, 2vw, 1.2rem);
  line-height: 1.4;
  color: var(--color-ink-muted);
  margin: 0;
  opacity: 0.5;
}
.stream__line--last {
  color: var(--color-primary);
  opacity: 1;
}
.stream__caret {
  color: var(--color-primary);
  opacity: 0.6;
}
.ln-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.ln-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
@media (prefers-reduced-motion: reduce) {
  .ln-enter-active {
    transition: none;
  }
}
</style>

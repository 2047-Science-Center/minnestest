<script setup lang="ts">
/**
 * Station 2:s lek-läge (lila) — en lek PER SIDA (två NUC:ar, två appar):
 *   sida A (Människotestet, telefonen) → 2A "Fråga VALdi"
 *   sida B (Lögndetektorn)             → 2C "Håll tråden"
 * Delad vy (pilot, ingen sida) → sida A. Förhandsvisa sida B med ?sida=B&lek=1.
 */
import FragaValdiLek from './FragaValdiLek.vue'
import HallTradenLek from './HallTradenLek.vue'

defineProps<{ side: 'A' | 'B' | null; names: string[] }>()
</script>

<template>
  <HallTradenLek v-if="side === 'B'" :names="names" />
  <FragaValdiLek v-else />
</template>

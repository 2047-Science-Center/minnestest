<script setup lang="ts">
/**
 * Liten mikrofon-ikon (ersätter 🎙-emojin — skarp och temafärgad i stället för en
 * plattforms-emoji). Ärver textfärgen via currentColor och skalar med font-size.
 */
</script>

<template>
  <svg class="mic-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
    <path d="M6 11a6 6 0 0 0 12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.mic-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: -0.14em;
  flex: 0 0 auto;
}
</style>

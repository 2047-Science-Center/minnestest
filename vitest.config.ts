import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Pure game-engine tests run in node — no DOM, no Vue needed.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Frontend-kontraktstester (TS) + gatewayns rena slutpoäng-modul (JS).
    include: ['src/**/*.test.ts', 'server/**/*.test.js'],
  },
})

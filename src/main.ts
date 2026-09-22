import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './station-kit/theme/crt.css'
import { registerStationMessages } from './stations/minnestest/i18n'

// Station-specifik copy injiceras i kitets i18n (kitet självt hålls rent —
// bara mekanismen registerMessages() är generisk, alla strängar bor i stationen).
registerStationMessages()

createApp(App).use(createPinia()).mount('#app')

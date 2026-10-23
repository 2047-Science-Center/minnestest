import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './station-kit/theme/crt.css'
import { registerStationMessages } from './stations/minnestest/i18n'

// Station-specifik copy injiceras i kitets i18n (kitet självt hålls rent —
// bara mekanismen registerMessages() är generisk, alla strängar bor i stationen).
registerStationMessages()

// Touch-kiosk: ett långt tryck ska ALDRIG bli högerklick/kontextmeny (Beetronics
// m.fl. touchskärmar tolkar annars håll-tryck som secondary click).
document.addEventListener('contextmenu', (e) => e.preventDefault())

createApp(App).use(createPinia()).mount('#app')

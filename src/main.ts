import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './station-kit/theme/crt.css'
import { registerStationMessages } from './stations/minnestest/i18n'
import { installKioskExit } from './station-kit/kiosk/kioskExit'
import { installKioskSkip } from './station-kit/kiosk/kioskSkip'

// Station-specifik copy injiceras i kitets i18n (kitet självt hålls rent —
// bara mekanismen registerMessages() är generisk, alla strängar bor i stationen).
registerStationMessages()

// Touch-kiosk: ett långt tryck ska ALDRIG bli högerklick/kontextmeny (Beetronics
// m.fl. touchskärmar tolkar annars håll-tryck som secondary click), och övre vänstra
// hörnet hållet i 4 s avslutar appen (station-kit/kiosk, samma som Eco Loco).
installKioskExit()
installKioskSkip() // håll övre högra hörnet 2 s → nästa steg (ersätter alla synliga hoppa över-knappar); i spelen skickas hoppet vidare

createApp(App).use(createPinia()).mount('#app')

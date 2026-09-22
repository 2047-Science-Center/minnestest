/**
 * Svenska — all Minnestest-copy (byggs skarpt). Injiceras i kitets i18n-bundle
 * via registerMessages(). Kitet självt hålls rent från station-copy.
 *
 * 'strom.*' = metodspecialist/ström (skarpt). 'internet.*' = doktorand/
 * uppkopplingen (STUBB — samma nyckeluppsättning, fylls senare).
 */
export const sv: Record<string, string> = {
  // --- Kit-överskrivningar ---
  'app.title': 'BORTFALLET',
  'app.subtitle': 'X&Y-riggen · 2047',
  'attract.tagline': 'Mönstring pågår. Bippa ditt band för att ta plats.',
  'attract.boot': 'STARTAR …',
  'common.press_to_start': 'TRYCK FÖR ATT BÖRJA',

  // --- Gemensamma knappar ---
  'common.continue': 'FORTSÄTT',
  'common.begin': 'BÖRJA',
  'common.next': 'NÄSTA',
  'step.next': 'NÄSTA',
  // Dold pilot-skip på analys-rutan (kit-nyckel, överskriven för denna kontext).
  'onboarding.skip': 'hoppa över',

  // --- Statusrad ---
  'status.station': 'BORTFALLET',
  'status.group': 'GRUPP {grupp}',
  'status.moment': 'MOMENT {n}/3',
  'status.pretext': '// tiden före valvet',

  // --- Incheckning (ruta 2) ---
  'checkin.read': 'BAND AVLÄST // GRUPP {grupp} // {n} DELTAGARE',

  // --- Rollval (ruta 3) ---
  'roleselect.title': 'VÄLJ DIN ROLL',
  'roleselect.subtitle': 'Se en dag i vardera, välj den du känner igen dig i.',
  'roleselect.pick': 'VÄLJ',
  'role.metodspecialist.title': 'METODSPECIALIST',
  'role.metodspecialist.upper': 'METODSPECIALIST',
  'role.metodspecialist.blurb': 'Den som löser det med händerna.',
  'role.doktorand.title': 'DOKTORAND',
  'role.doktorand.upper': 'DOKTORAND',
  'role.doktorand.blurb': 'Den som tänker ut vad som händer sen.',

  // --- Utplockning ur valvet (ruta 4) ---
  'vaultout.l1': 'MÖNSTRING PAUSAD.',
  'vaultout.l2': 'Vi förflyttar er till tiden före valvet.',
  'vaultout.l3': 'Platsen: ett vanligt hem. En vanlig kväll.',
  'vaultout.l4': 'Situationen börjar nu.',

  // --- Scenario-intro (ruta 5) ---
  'strom.intro':
    'Klockan är 16:47. Strömmen slocknar — inte bara hos er, hela stan. Sista beskedet innan näten dog: den är inte tillbaka ikväll. Du är den i hemmet som brukar lösa saker. Nu är det ni tre och det som finns här.',

  // --- Hem- & resurs-reveal (ruta 6) ---
  'home.title': 'Det här är ert hem. Det här har ni att jobba med.',
  'home.sub': '(Titta er omkring — ni får inget mer.)',
  'home.begin': 'BÖRJA',
  'resurs.vatten': 'Vatten',
  'resurs.gasspis': 'Gasspis',
  'resurs.ficklampa': 'Ficklampa',
  'resurs.filtar': 'Filtar',
  'resurs.bilen': 'Bilen',
  'resurs.grannen': 'Grannen',

  // --- Steg-cykel (generellt) ---
  'step.think_together': 'Prata högt tillsammans. Enheten lyssnar.',
  'step.mic_active': '🎙 MIK AKTIV',
  'step.we_are_done': 'VI ÄR KLARA',
  'step.warn': '10 SEK KVAR',
  'step.time_up': 'TIDEN UTE',
  'step.analyzing': 'ENHETEN ANALYSERAR ERT BESLUT …',
  'step.lage_label': 'LÄGE: {text}',
  'step.no_speech':
    'Taligenkänning stöds inte i denna webbläsare — prata ändå, eller skriv era beslut i fältet.',
  'step.manual_placeholder': 'Skriv ert beslut här …',
  // Mikrofon-fel (talfångst) — visas i delruta B om något går snett.
  'step.mic_err.not-allowed':
    'Mikrofonen är blockerad. Tillåt mikrofon i webbläsaren (klicka på hänglåset i adressfältet → Mikrofon → Tillåt) och försök igen. Ni kan skriva i fältet så länge.',
  'step.mic_err.no-mic': 'Ingen mikrofon hittades. Skriv era beslut i fältet i stället.',
  'step.mic_err.no-internet':
    'Taligenkänningen tappade nätet (den kräver internet). Skriv i fältet så länge.',
  'step.mic_err.unsupported':
    'Den här webbläsaren stödjer inte taligenkänning — använd Chrome, eller skriv i fältet.',

  // --- Steg 1 (ström) ---
  'strom.steg1.prompt':
    'Ni har en halvtimmes dagsljus kvar och bara det som finns i huset. Vad gör ni först — och varför i den ordningen?',
  'strom.steg1.meter': 'DAGSLJUS',
  'strom.steg1.meter_note': 'Solen går ner om ~30 min',

  // --- Steg 2 (ström) ---
  'strom.steg2.banner': 'Natt, dag 1. Kallt, kolmörkt.',
  'strom.steg2.prompt':
    'Er sista mobil har 15 % kvar och ni vet inte hur länge strömmen är borta. Vad gör ni med mobilen — och hur håller ni värmen?',
  'strom.steg2.meter_a': 'MOBIL 15 %',
  'strom.steg2.meter_b': 'INNE 14 °C ↓',

  // --- Steg 3 (ström) ---
  'strom.steg3.banner': 'Dag 2. Hela regionen mörk.',
  'strom.steg3.prompt':
    'Hela kvarteret är mörkt och de äldre fryser. Ni har tills det blir natt igen. Vad gör ni så att alla på våningen klarar natten?',
  'strom.steg3.meter_a': 'TILL NÄSTA NATT',
  'strom.steg3.meter_b': 'Grannen: 82 år',

  // --- NPC-svar (ruta D) ---
  'npc.prefix': 'ENHETEN //',
  'npc.error':
    'Enheten tappade uppkopplingen ett ögonblick och kunde inte väga ert svar den här gången. Ni kan gå vidare.',

  // --- Återförs till valvet (ruta 16) ---
  'vaultback.l1': 'SITUATIONEN AVSLUTAD.',
  'vaultback.l2': 'Ni återförs till valvet.',
  'vaultback.l3': 'Enheten sammanställer er mönstring …',

  // --- Mönstringsutlåtande / stigande skala (ruta 17) ---
  'verdict.title': 'MÖNSTRINGSUTLÅTANDE',
  'verdict.profile_label': '{roll}-PROFIL: {profil}',
  'verdict.score_registered': 'Er poäng registreras.',
  'verdict.checkout_hint': 'Bippa ut för att gå vidare.',
  'skala.mark_1_2': 'Överlevde stunden',
  'skala.mark_3_4': 'Höll huvudet kallt',
  'skala.mark_5_6': 'Tänkte framåt',
  'skala.mark_7_8': 'Såg hela systemet',
  'skala.mark_9_10': 'Någon andra kan luta sig mot',

  // --- Utcheckning (ruta 18) ---
  'checkout.title': 'KLART.',
  'checkout.body': 'Bippa bandet och gå vidare.',
  'checkout.next': 'Nästa: {dyn}',
  'checkout.next_unknown': 'nästa station',

  // --- Doktorand/uppkopplingen (STUBB) ---
  'internet.intro': '(stubbad copy — doktorand/uppkopplingen speglas senare)',
  'internet.steg1.prompt': '(stubb) Steg 1 — uppkopplingen dör.',
  'internet.steg1.meter': 'UPPKOPPLING',
  'internet.steg1.meter_note': '(stubb)',
  'internet.steg2.banner': '(stubb) Läge steg 2',
  'internet.steg2.prompt': '(stubb) Steg 2.',
  'internet.steg2.meter_a': '(stubb)',
  'internet.steg2.meter_b': '(stubb)',
  'internet.steg3.banner': '(stubb) Läge steg 3',
  'internet.steg3.prompt': '(stubb) Steg 3.',
  'internet.steg3.meter_a': '(stubb)',
  'internet.steg3.meter_b': '(stubb)',
  'resurs.router': 'Router',
  'resurs.powerbank': 'Powerbank',
  'resurs.radio': 'Radio',
  'resurs.kontanter': 'Kontanter',
}

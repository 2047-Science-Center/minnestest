/**
 * Svenska — all Minnestest-copy (FLYKT-scenariot). Injiceras i kitets i18n-bundle
 * via registerMessages(). Kitet självt hålls rent från station-copy.
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

  // --- Statusrad ---
  'status.station': 'BORTFALLET',
  'status.group': 'GRUPP {grupp}',
  'status.moment': 'MOMENT {n}/3',
  'status.pretext': '// tiden före valvet',

  // --- Incheckning ---
  'checkin.read': 'BAND AVLÄST // GRUPP {grupp} // {n} DELTAGARE',

  // --- Rollval ---
  'roleselect.title': 'VÄLJ DIN ROLL',
  'roleselect.subtitle': 'Se en dag i vardera, välj den du känner igen dig i.',
  'roleselect.pick': 'VÄLJ',
  'role.metodspecialist.title': 'METODSPECIALIST',
  'role.metodspecialist.upper': 'METODSPECIALIST',
  'role.metodspecialist.blurb': 'Den som löser det med händerna.',
  'role.doktorand.title': 'DOKTORAND',
  'role.doktorand.upper': 'DOKTORAND',
  'role.doktorand.blurb': 'Den som tänker ut vad som händer sen.',

  // --- Utplockning ur valvet ---
  'vaultout.l1': 'MÖNSTRING PAUSAD.',
  'vaultout.l2': 'Vi förflyttar er till tiden före valvet.',
  'vaultout.l3': 'Platsen: ett vanligt hem. En vanlig kväll.',
  'vaultout.l4': 'Situationen börjar nu.',

  // --- Läges-flöde (IDENTISKT för uppgift 1–3) ---
  'lage.title': 'DET HÄR ÄR LÄGET',
  'lage.ready': 'VI ÄR REDO',
  'countdown.prefix': 'Uppgiften börjar om',

  // --- Steg-cykel (generellt) ---
  'step.talk_motiv': 'Prata högt tillsammans — och säg VARFÖR ni väljer som ni gör.',
  'step.why_line': 'Säg VARFÖR ni väljer som ni gör. Det är motiveringen som räknas.',
  'step.mic_active': '🎙 MIK AKTIV',
  'step.talk_now': '🎙 PRATA NU',
  'step.we_are_done': 'VI ÄR KLARA',
  'step.warn': '10 SEK KVAR',
  'step.time_up': 'TIDEN UTE',
  'step.analyzing': 'ENHETEN ANALYSERAR ERT BESLUT …',
  'step.next': 'NÄSTA',
  'step.no_speech':
    'Taligenkänning stöds inte i denna webbläsare — prata ändå, eller skriv era beslut i fältet.',
  'step.manual_placeholder': 'Skriv ert beslut här …',
  'step.mic_err.not-allowed':
    'Mikrofonen är blockerad. Tillåt mikrofon i webbläsaren (klicka på hänglåset i adressfältet → Mikrofon → Tillåt) och försök igen. Ni kan skriva i fältet så länge.',
  'step.mic_err.no-mic': 'Ingen mikrofon hittades. Skriv era beslut i fältet i stället.',
  'step.mic_err.no-internet':
    'Taligenkänningen tappade nätet (den kräver internet). Skriv i fältet så länge.',
  'step.mic_err.unsupported':
    'Den här webbläsaren stödjer inte taligenkänning — använd Chrome, eller skriv i fältet.',

  // --- Uppgift 1 · Packa ---
  'flykt.steg1.undertext': 'Kriget har brutit ut — ni måste fly landet.',
  'flykt.steg1.popup1': 'Kriget har nått er stad. Ni är familjen som bor här.',
  'flykt.steg1.popup2': 'Ni måste fly landet — nu.',
  'flykt.steg1.popup3': 'Ni vet inte hur länge ni blir borta eller vart ni hamnar.',
  'flykt.steg1.fraga': 'Vad tar ni med er — och varför just det?',

  // --- Uppgift 2 · Färdsätt ---
  'flykt.steg2.undertext': 'Vägarna är fulla av folk som flyr.',
  'flykt.steg2.popup1': 'Ni har tagit er ut ur staden.',
  'flykt.steg2.popup2': 'Vägarna är redan fulla av folk som flyr.',
  'flykt.steg2.popup3': 'Ni måste välja hur ni tar er vidare.',
  'flykt.steg2.fraga': 'Hur väljer ni att ta er fram — och varför det sättet framför andra?',

  // --- Uppgift 3 · Slå läger ---
  'flykt.steg3.undertext': 'Ni kommer inte längre ikväll.',
  'flykt.steg3.popup1': 'Det blev stopp. Ni kommer inte längre ikväll.',
  'flykt.steg3.popup2': 'Ni måste stanna och slå läger i skogen, några nätter.',
  'flykt.steg3.popup3': '',
  'flykt.steg3.fraga': 'Vad gör ni först — och varför är det viktigast?',

  // --- NPC-svar ---
  'npc.prefix': 'ENHETEN //',
  'npc.error':
    'Enheten tappade uppkopplingen ett ögonblick och kunde inte väga ert svar den här gången. Ni kan gå vidare.',

  // --- Återförs till valvet ---
  'vaultback.l1': 'SITUATIONEN AVSLUTAD.',
  'vaultback.l2': 'Ni återförs till valvet.',
  'vaultback.l3': 'Enheten sammanställer er mönstring …',

  // --- Mönstringsutlåtande / stigande skala ---
  'verdict.title': 'MÖNSTRINGSUTLÅTANDE',
  'verdict.profile_label': '{roll}-PROFIL: {profil}',
  'verdict.score_registered': 'Er poäng registreras.',
  'verdict.checkout_hint': 'Bippa ut för att gå vidare.',
  'skala.mark_1_2': 'Överlevde stunden',
  'skala.mark_3_4': 'Höll huvudet kallt',
  'skala.mark_5_6': 'Tänkte framåt',
  'skala.mark_7_8': 'Såg hela systemet',
  'skala.mark_9_10': 'Någon andra kan luta sig mot',

  // --- Utcheckning ---
  'checkout.title': 'KLART.',
  'checkout.body': 'Bippa bandet och gå vidare.',
  'checkout.next': 'Nästa: {dyn}',
  'checkout.next_unknown': 'nästa station',
}

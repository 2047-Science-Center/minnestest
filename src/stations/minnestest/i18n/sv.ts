/**
 * Svenska — all Minnestest-copy (FLYKT-scenariot). Injiceras i kitets i18n-bundle
 * via registerMessages(). Kitet självt hålls rent från station-copy.
 */
export const sv: Record<string, string> = {
  // --- Kit-överskrivningar ---
  'app.title': 'FLYKTEN',
  'app.subtitle': 'X&Y-riggen · 2047',
  'attract.tagline': 'Bippa ditt band för att börja.',
  'attract.boot': 'STARTAR …',
  'common.press_to_start': 'TRYCK FÖR ATT BÖRJA',

  // --- Gemensamma knappar ---
  'common.continue': 'FORTSÄTT',
  'common.begin': 'BÖRJA',
  'common.next': 'NÄSTA',

  // --- Facilitator-kontroller (paus / starta om / avsluta) ---
  'facil.pause': 'Paus',
  'facil.resume': 'Fortsätt',
  'facil.reset': 'Starta om',
  'facil.reset_confirm': 'Starta om hela stationen?',
  'facil.reset_yes': 'Ja, starta om',
  'facil.exit': 'Avsluta',
  'facil.exit_confirm': 'Avsluta stationen och gå till skrivbordet?',
  'facil.exit_yes': 'Ja, avsluta',
  'facil.cancel': 'Avbryt',
  'facil.paused_title': 'PAUSAT',
  'facil.paused_sub': 'Facilitatorn har pausat. Vänta ett ögonblick.',

  // --- Statusrad ---
  'status.station': 'FLYKTEN',
  'status.group': 'GRUPP {grupp}',
  'status.moment': 'MOMENT {n}/3',
  'status.pretext': '// tiden före valvet',

  // --- Incheckning ---
  'checkin.read': 'BAND AVLÄST // GRUPP {grupp} // {n} DELTAGARE',

  // --- Rollval ---
  'roleselect.title': 'VÄLJ DIN ROLL',
  'roleselect.subtitle': 'Vilken är du? Välj en.',
  'roleselect.pick': 'VÄLJ',
  'role.metodspecialist.title': 'METODSPECIALIST',
  'role.metodspecialist.upper': 'METODSPECIALIST',
  'role.metodspecialist.blurb': 'Den som löser det med händerna.',
  'role.doktorand.title': 'DOKTORAND',
  'role.doktorand.upper': 'DOKTORAND',
  'role.doktorand.blurb': 'Den som tänker ut vad som händer sen.',

  // --- Utplockning ur valvet ---
  // Valv-övergång — flykt (doktorand): tillbaka till hemmet.
  'vaultout.l1': 'Vi tar er tillbaka i tiden.',
  'vaultout.l2': 'Till en helt vanlig kväll.',
  'vaultout.l3': 'Det börjar nu.',
  // Valv-övergång — metodspecialist (Fermi/skattningsprov).
  'fermi.vaultout.l1': 'Enheten är redo.',
  'fermi.vaultout.l2': 'Nu mäter vi hur ni tänker.',
  'fermi.vaultout.l3': 'Det börjar nu.',

  // --- Läges-flöde (IDENTISKT för uppgift 1–3) ---
  'lage.title': 'DET HÄR ÄR LÄGET',
  'lage.ready': 'VI ÄR REDO',
  'countdown.prefix': 'Uppgiften börjar om',

  // --- Steg-cykel (generellt) ---
  // Poäng-regeln: syns i varje stegs pop-up + nedräkning → omöjlig att missa.
  'step.rule_title': '🎙 TÄNK HÖGT TILLSAMMANS',
  'step.rule_body': 'Ni bedöms på HUR ni resonerar — inte på om svaret blir rätt.',
  'step.talk_motiv': 'Prata högt — och säg varför ni väljer så.',
  'step.why_line': 'Säg VARFÖR ni väljer som ni gör. Det är motiveringen som räknas.',
  'step.mic_active': '🎙 MIK AKTIV',
  'step.talk_now': '🎙 PRATA NU',
  'step.we_are_done': 'VI ÄR KLARA',
  'step.warn': '10 SEK KVAR',
  'step.time_up': 'TIDEN UTE',
  'step.analyzing': 'Enheten väger ert svar …',
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
  //   context = liten rad ovanför, task = STORA frågan (syns hela tiden), time = tidsgräns.
  'flykt.steg1.context': 'Ett krig har brutit ut och ni måste fly.',
  'flykt.steg1.task': 'Vad tar ni med er?',
  'flykt.steg1.time': 'Ni har en minut. Sen måste ni ge er av.',
  'flykt.steg1.popup1': 'Kriget har nått er stad.',
  'flykt.steg1.popup2': 'Ni måste fly nu — och vet inte vart eller hur länge.',
  'flykt.steg1.popup3': '',

  // --- Uppgift 2 · Färdsätt ---
  'flykt.steg2.context': 'Vägarna är fulla av folk som flyr.',
  'flykt.steg2.task': 'Hur tar ni er fram?',
  'flykt.steg2.time': 'Ni har en minut att välja väg.',
  'flykt.steg2.popup1': 'Ni har tagit er ut ur staden.',
  'flykt.steg2.popup2': 'Vägarna är redan fulla av folk som flyr — ni måste välja hur ni tar er vidare.',
  'flykt.steg2.popup3': '',

  // --- Uppgift 3 · Slå läger ---
  'flykt.steg3.context': 'Ni kommer inte längre ikväll.',
  'flykt.steg3.task': 'Vad gör ni först?',
  'flykt.steg3.time': 'Ni har en minut att bestämma.',
  'flykt.steg3.popup1': 'Det blev stopp. Ni kommer inte längre ikväll.',
  'flykt.steg3.popup2': 'Ni måste stanna och slå läger i skogen, några nätter.',
  'flykt.steg3.popup3': '',

  // ================= FERMI (metodspecialist · skrotbilar) =================
  'skatta.title': 'DET HÄR SKA NI SKATTA',
  'step.how_line': 'Säg hur ni räknar. Vägen dit räknas.',
  'step.weighing': 'Enheten väger ert svar …',

  // Fermi-intro (hela frågan)
  'fermi.intro.l1': 'Ni är metodspecialister — ni löser saker med händerna.',
  'fermi.intro.l2':
    'Nu vill vi veta hur ni räknar ut hur mycket alla bilar som skrotas i Sverige väger på ett år.',
  'fermi.intro.l3': 'Ni löser den i tre steg. Tänk högt — det är vägen dit som räknas.',
  'fermi.intro.begin': 'BÖRJA',

  // Gissnings-pop-up
  'guess.title': 'ER GISSNING',
  'guess.sub': 'Ställ in ert tal. Det viktiga var hur ni tänkte.',
  'guess.hold_hint': 'Håll in − eller + för att bläddra snabbare.',
  'guess.placeholder': 'Ett tal …',
  'guess.lock': 'LÅS IN',
  'guess.skip': 'HOPPA',
  'unit.kg': 'kg',
  'unit.antal': 'bilar/år',
  'unit.ton': 'ton/år',

  // Steg 1 — snittbilens vikt
  'fermi.steg1.context': 'Börja med en enda bil.',
  'fermi.steg1.task': 'Hur mycket väger en helt vanlig bil?',
  'fermi.steg1.time': 'Ni har en minut. Säg hur ni tänker — inte bara en siffra.',
  'fermi.steg1.popup1': 'Börja med EN bil — en helt vanlig personbil.',
  'fermi.steg1.popup2': 'Skatta vikten och säg HUR ni tänker, inte bara en siffra.',
  'fermi.steg1.popup3': '',

  // Steg 2 — antal skrotade/år
  'fermi.steg2.context': 'Nu hela Sverige, ett helt år.',
  'fermi.steg2.task': 'Hur många bilar skrotas i Sverige på ett år?',
  'fermi.steg2.time': 'Ni har en minut. Säg hur ni räknar er fram.',
  'fermi.steg2.popup1': 'Från en bil till hela landet.',
  'fermi.steg2.popup2': 'Hur många personbilar skrotas i Sverige på ett år?',
  'fermi.steg2.popup3': '(Sverige har drygt 10 miljoner invånare.)',

  // Steg 3 — total skrotvikt
  'fermi.steg3.context': 'Väg ihop allt.',
  'fermi.steg3.task': 'Hur mycket väger allt tillsammans?',
  'fermi.steg3.time': 'Ni har en minut. Väg ihop era två tal.',
  'fermi.steg3.popup1': 'Väg ihop era egna tal från steg 1 och 2.',
  'fermi.steg3.popup2': 'Stämmer storleksordningen?',
  'fermi.steg3.popup3': '',

  // --- NPC-svar ---
  'npc.prefix': 'ENHETEN //',
  'npc.error':
    'Enheten tappade uppkopplingen ett ögonblick och kunde inte väga ert svar den här gången. Ni kan gå vidare.',

  // --- Återförs till valvet ---
  'vaultback.l1': 'Klart.',
  'vaultback.l2': 'Enheten räknar ihop ert resultat …',
  'vaultback.l3': '',

  // --- Mönstringsutlåtande / stigande skala ---
  'verdict.title': 'MÖNSTRINGSUTLÅTANDE',
  'verdict.profile_label': '{roll}-PROFIL: {profil}',
  'verdict.score_registered': 'Ert resultat sparas.',
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

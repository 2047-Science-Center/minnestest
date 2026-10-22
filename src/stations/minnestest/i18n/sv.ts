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
  // --- Bipp-start (identifiera dig i början) ---
  'bipp.title': 'BIPPA DITT BAND',
  'bipp.hint': 'Håll armbandet mot läsaren',
  'bipp.skip': 'Fortsätt utan bipp ▸',
  'bipp.identified': 'VÄLKOMMEN {name}',
  'bipp.ok': 'band avläst',

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

  // --- Coach-intro (tutorial: highlights på grund-UI:t, lär genom att göra) ---
  'coach.title': 'SÅ FUNKAR DET',
  'coach.hint': 'Grund-UI:t syns hela tiden — vi pekar bara ut delarna.',
  'coach.next': 'NÄSTA',
  'coach.start_fermi': 'BÖRJA ÖVA',
  'coach.start_flykt': 'BÖRJA ÖVA',
  // fermi-zoner + bubblor
  'coach.fermi.z1': 'FRÅGAN',
  'coach.fermi.z1_ex': 'Hur mycket väger en vanlig bil?',
  'coach.fermi.b1': 'Här står frågan — den syns hela tiden.',
  'coach.fermi.z2': 'SIFFERVÄLJARE',
  'coach.fermi.b2': 'Här ställer ni in ert tal med − och +.',
  'coach.fermi.z3': 'TÄNK HÖGT',
  'coach.fermi.z3_ex': 'Säg HUR ni kommer fram — inte bara en siffra.',
  'coach.fermi.b3': 'Viktigast: säg HUR ni tänker. Det ger poängen.',
  // flykt-zoner + bubblor
  'coach.flykt.z1': 'LÄGET',
  'coach.flykt.z1_ex': 'Ett krig har brutit ut och ni måste fly.',
  'coach.flykt.b1': 'Här står läget — kort, i liten text.',
  'coach.flykt.z2': 'FRÅGAN',
  'coach.flykt.z2_ex': 'Vad tar ni med er?',
  'coach.flykt.b2': 'Här är frågan ni ska svara på — stor, hela tiden.',
  'coach.flykt.z3': 'TÄNK HÖGT',
  'coach.flykt.z3_ex': 'Säg VARFÖR ni väljer så.',
  'coach.flykt.b3': 'Viktigast: säg VARFÖR. Utan motivering blir taket Godkänd.',

  // --- Läges-flöde (IDENTISKT för uppgift 1–3) ---
  'lage.title': 'DET HÄR ÄR LÄGET',
  'lage.ready': 'VI ÄR REDO',
  'countdown.prefix': 'Uppgiften börjar om',

  // --- Läge: övning (blått) vs skarpt (orange) — speglar Förhandlingen ---
  'mode.legend_tutorial': 'När skärmen är BLÅ övar vi',
  'mode.legend_live': 'När den blir ORANGE kör vi på riktigt',
  'mode.testomgang': 'ÖVNING',
  'mode.practice_title': 'Nu övar vi först',
  'mode.practice_sub': 'Vi tränar — inga poäng räknas än.',
  'mode.practice_go': 'BÖRJA ÖVA',
  'mode.golive_title': 'NU PÅ RIKTIGT',

  // --- Steg-cykel (generellt) ---
  // Poäng-regeln: syns i varje stegs pop-up + nedräkning → omöjlig att missa.
  'step.rule_title': 'TÄNK HÖGT TILLSAMMANS',
  'step.rule_body': 'Ni bedöms på HUR ni resonerar — inte på om svaret blir rätt.',
  'step.talk_motiv': 'Prata högt — och säg varför ni väljer så.',
  'step.why_line': 'Säg VARFÖR ni väljer som ni gör. Det är motiveringen som räknas.',
  'step.mic_active': 'MIK AKTIV',
  'step.talk_now': 'PRATA NU',
  'step.we_are_done': 'VI ÄR KLARA',
  // Tvåblocks-ordning: svaret först, motiveringen sedan.
  'step.answer_line': 'Säg allt ni tar med er — rabbla upp.',
  // Per-scen svars-uppmaning (block 1) — anpassad efter vad scenen faktiskt frågar.
  'flykt.ovning.answer': 'Säg allt ni tar med er — rabbla upp.',
  'flykt.steg1.answer': 'Säg allt ni tar med er — rabbla upp.',
  'flykt.steg2.answer': 'Säg vilken väg ni tar — kort.',
  'flykt.steg3.answer': 'Säg vad ni gör först.',
  'step.answer_done': 'KLART',
  'step.block_answer': 'SVARA',
  'step.block_reason': 'MOTIVERA',
  // Block 2-fråga (motivering) + mellanskärmen mellan svar och motivering.
  'step.reason_q': 'Varför valde ni så?',
  'step.reason_q_fermi': 'Hur kom ni fram till det?',
  'step.handoff_title': 'Svaret klart',
  'step.handoff_sub': 'Nu: motivera varför',
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
  'unit.slag': 'slag',

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

  // --- ÖVNINGSEXEMPEL (testläge, en fråga per gren) ---
  // Metodspecialist — snabb Fermi-övning (hjärtslag).
  'fermi.ovning.context': 'Övning — ni skattar och säger HUR ni tänker.',
  'fermi.ovning.task': 'Hur många gånger slår ett hjärta på ett dygn?',
  'fermi.ovning.time': 'Ni har en minut. Säg hur ni räknar.',
  'fermi.ovning.popup1': 'Det här är en ÖVNING — inga riktiga poäng.',
  'fermi.ovning.popup2': 'Skatta ett tal och säg HUR ni kommer fram.',
  'fermi.ovning.popup3': '',
  // Doktorand — snabb motiverings-övning (brand).
  'flykt.ovning.context': 'Övning — säg vad OCH varför.',
  'flykt.ovning.task': 'Det brinner. Ni har 30 sekunder. Vad tar ni med er?',
  'flykt.ovning.time': 'Ni har en minut. Säg varför ni väljer så.',
  'flykt.ovning.popup1': 'Det här är en ÖVNING — inga riktiga poäng.',
  'flykt.ovning.popup2': 'Först säger ni VAD ni tar med er — sen VARFÖR.',
  'flykt.ovning.popup3': '',

  // --- Gatad stege: nivåer + gate + resultat ---
  'unit.lass': 'lass',
  'gate.level': 'NIVÅ {n} / {max}',
  'gate.need': 'Klara tröskel: {th} / 10',
  'gate.weighing': 'ENHETEN VÄGER …',
  'gate.cleared': 'NIVÅ {n} KLARAD',
  'gate.stopped': 'STOPP VID NIVÅ {n}',
  'gate.next_level': 'NÄSTA NIVÅ',
  'gate.see_result': 'SE RESULTAT',
  'result.practice_done': 'ÖVNING KLAR',
  'result.practice_pass': 'Över tröskeln — ni är redo.',
  'result.practice_near': 'Tröskeln var {th} / 10. Nu gäller det på riktigt.',
  'result.level_label': 'NI NÅDDE',
  'result.all_cleared': 'Hela vägen — alla nivåer klara!',
  'result.got_to': 'Ni tog er till nivå {n}. Starkt.',
  'result.missing': 'Det som fattades',
  'result.to_live': 'NU PÅ RIKTIGT',
  'result.to_checkout': 'KLART',

  // Flykt — 5 gatade nivåer (funktionell copy, städas senare)
  'flykt.niva1.context': 'Ett krig har brutit ut. Det brinner — ni måste fly nu.',
  'flykt.niva1.task': 'Vad tar ni med er?',
  'flykt.niva1.answer': 'Säg allt ni tar med er — rabbla upp.',
  'flykt.niva2.context': 'Vägarna är fulla av folk som flyr.',
  'flykt.niva2.task': 'Vilken väg tar ni?',
  'flykt.niva2.answer': 'Säg vilken väg ni väljer — kort.',
  'flykt.niva3.context': 'En vägspärr. Soldater kontrollerar alla.',
  'flykt.niva3.task': 'Vad gör ni?',
  'flykt.niva3.answer': 'Säg vad ni gör — kort.',
  'flykt.niva4.context': 'Det finns plats för en till i bilen. En främling ber om hjälp.',
  'flykt.niva4.task': 'Tar ni med er den okända?',
  'flykt.niva4.answer': 'Säg ert beslut — kort.',
  'flykt.niva5.context': 'Gränsen stänger om 2 minuter. En lång kö — eller en okänd genväg genom skogen.',
  'flykt.niva5.task': 'Vad väljer ni — nu?',
  'flykt.niva5.answer': 'Säg ert beslut — kort.',

  // Fermi — skattnings-stegen, 5 nivåer (sifferväljare/ja-nej)
  'fermi.niva1.context': 'Börja med en enda bil.',
  'fermi.niva1.task': 'Hur mycket väger en helt vanlig bil?',
  'fermi.niva2.context': 'Nu hela Sverige, ett helt år.',
  'fermi.niva2.task': 'Hur många bilar skrotas i Sverige på ett år?',
  'fermi.niva3.context': 'Väg ihop allt.',
  'fermi.niva3.task': 'Hur många ton skrot blir det per år?',
  'fermi.niva4.context': 'Jämför med något stort.',
  'fermi.niva4.task': 'Räcker ett års skrotmetall för att bygga Eiffeltornet (~7 300 ton)?',
  'fermi.niva5.context': 'Allt ska fraktas bort.',
  'fermi.niva5.task': 'Hur många lastbilslass tar det att frakta bort allt?',

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

  // --- Resultat-genomgång (reveal, en beat i taget — test + skarpt) ---
  'reveal.title': 'SÅ HÄR BLEV POÄNGEN',
  'reveal.caption_steps': 'Vi går igenom ett steg i taget.',
  'reveal.caption_final': 'Och slutpoängen …',
  'reveal.caption_criteria': 'Enheten väger ert resonemang — ett kriterium i taget.',
  'reveal.caption_total': 'Och totalen …',
  'reveal.composing': 'Enheten väger ert svar …',
  'reveal.test_note': 'Övning — exakt så här räknas det skarpa också.',
  'reveal.next': 'NÄSTA',
  'reveal.to_checkout': 'Bippa ut för att gå vidare',
  'reveal.to_live': 'Nu på riktigt',
  'reveal.medel': 'Medel',
  'reveal.summa': 'Summa band',
  'reveal.rodtrad': '★ Röd tråd',
  'reveal.rodtrad_fermi': 'steg 3 byggde på era egna tal',
  'reveal.rodtrad_flykt': 'bar självförsörjningen genom stegen',
  'reveal.slutpoang': 'Slutpoäng',
  'reveal.delpoang': 'delpoäng',
  'reveal.traff.prick': 'PRICK',
  'reveal.traff.tiopotens': 'RÄTT STORLEK',
  'reveal.traff.utanfor': 'UTANFÖR',
  'reveal.fermi.steg1': 'snittbilens vikt',
  'reveal.fermi.steg2': 'antal per år',
  'reveal.fermi.steg3': 'total vikt',
  'reveal.flykt.steg1': 'packa',
  'reveal.flykt.steg2': 'färdsätt',
  'reveal.flykt.steg3': 'slå läger',
  'reveal.fermi.ovning': 'Ert svar',
  'reveal.flykt.ovning': 'Ert svar',
  'reveal.test_note_fermi': 'Två axlar: hur nära ni låg + HUR ni tänkte.',
  'reveal.test_note_flykt': 'Rätt val + rätt varför → starkare band.',

  // --- Utcheckning ---
  'checkout.title': 'KLART.',
  'checkout.body': 'Bippa bandet och gå vidare.',
  'checkout.next': 'Nästa: {dyn}',
  'checkout.next_unknown': 'nästa station',
}

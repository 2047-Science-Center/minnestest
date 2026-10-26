/**
 * Svenska — all copy för MÄNNISKOTESTET. Injiceras i kitets i18n-bundle via
 * registerMessages(). Kitet självt hålls rent från station-copy.
 */
export const sv: Record<string, string> = {
  // --- Kit-överskrivningar / attract ---
  'app.title': 'STATION 2',
  'app.subtitle': 'X&Y',
  'attract.tagline': '',
  'attract.boot': 'STARTAR …',
  'common.press_to_start': 'TRYCK FÖR ATT BÖRJA',
  'common.continue': 'FORTSÄTT',
  'common.begin': 'BÖRJA',
  'common.next': 'NÄSTA',

  // --- Titelskärm ---
  'branch.title': 'MÄNNISKOTESTET',
  'branch.sub': 'Valvets innersta släpper bara in människor. Dags att bevisa att ni är det.',
  'branch.start': 'STARTA',

  // --- Story-intro ---
  'intro.eyebrow': 'VALVETS INNERSTA',
  'intro.l1': 'Cybersäkerhet blir allt viktigare. Valvets mest skyddade uppgifter får inte kunna hackas.',
  'intro.l2': 'Därför finns ett test som bara släpper in människor — ett omdöme en maskin inte kan fejka.',
  'intro.l3': 'Jag, Valdi, ställer er inför situationer utan rätt svar. Det är i HUR ni resonerar jag avgör om ni är människor.',
  'intro.l4': 'Fem rum. Fem portar. Hur långt når ni?',
  'intro.ready': 'VI ÄR REDO',

  // --- Facilitator-kontroller ---
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

  // --- Rum / deltagare / countdown ---
  'room.golive_title': 'NU GÄLLER DET',
  'room.tutorial_tag': 'ÖVNING — INGET RÄKNAS',
  'room.plate': 'RUM {n}',
  'room.name.bla': 'blå',
  'room.name.gul': 'gul',
  'room.name.gron': 'grön',
  'room.name.rod': 'röd',
  'room.name.guld': 'gyllene',
  'room.ready': 'VI ÄR REDO',
  'room.up_next': '{name} — gör dig redo  ({nr}/{total})',
  'room.time_warning': 'Du får {s} sekunder. Det finns inget rätt svar — säg hur du tänker.',
  'room.handoff_done': 'Svar registrerat',
  'room.participant': 'DELTAGARE {nr}/{total}',
  'room.talk_hint': 'Säg hur du tänker — och varför.',
  'room.talk_done': 'KLAR',
  'room.to_live': 'IN I VALVET',
  'room.next_room': 'NÄSTA RUM',
  'room.see_result': 'SE RESULTAT',

  // --- Porten ---
  'door.overvager': 'VALDI ÖVERVÄGER',
  'door.granted': 'MÄNSKLIGT NOG — PORTEN ÖPPNAS',
  'door.denied': 'ACCESS DENIED',

  // --- Förtroendemätaren ---
  'meter.lose': 'INGET FÖRTROENDE',
  'meter.tveksam': 'TVEKSAM',
  'meter.hog': 'HÖGT FÖRTROENDE',

  // --- Sammanvägning (till modellen + fallback) ---
  'verdict.rubrik':
    'Väg ihop de tre deltagarnas svar till ETT gemensamt utlåtande om gruppen lät mänsklig eller maskinell.',
  'verdict.fallback':
    'Valdi tappade uppkopplingen ett ögonblick och kunde inte formulera sitt utlåtande den här gången.',

  // --- Slutskärm ---
  'result.eyebrow': 'VALDIS UTSLAG',
  'result.granted_title': 'VÄLKOMNA IN',
  'result.denied_title': 'ACCESS DENIED',
  'result.granted_body': 'Ni tog er genom alla portarna. Valdi dömde er som människor.',
  'result.tveksam_body': 'Nätt och jämnt mänskliga — men här stängdes porten.',
  'result.denied_body': 'Valdi dömde er som robotar. Porten förblev stängd.',
  'result.reached': 'Ni nådde rum {n} av {max} — det {color} rummet.',
  'result.to_checkout': 'KLART',

  // --- Deltagar-fallbacknamn ---
  'p.generic': 'Deltagare {n}',

  // --- Mik / tal (återanvänt av RoomCycle) ---
  'step.mic_active': 'MIK AKTIV',
  'step.warn': '10 SEK KVAR',
  'step.time_up': 'TIDEN UTE',
  'step.no_speech':
    'Taligenkänning stöds inte i den här webbläsaren — prata ändå, eller skriv i fältet.',
  'step.manual_placeholder': 'Skriv ditt svar här …',
  'step.mic_err.not-allowed':
    'Mikrofonen är blockerad. Tillåt mikrofon i webbläsaren (hänglåset i adressfältet → Mikrofon → Tillåt) och försök igen. Du kan skriva i fältet så länge.',
  'step.mic_err.no-mic': 'Ingen mikrofon hittades. Skriv ditt svar i fältet i stället.',
  'step.mic_err.no-internet':
    'Taligenkänningen tappade nätet (den kräver internet). Skriv i fältet så länge.',
  'step.mic_err.unsupported':
    'Den här webbläsaren stödjer inte taligenkänning — använd Chrome, eller skriv i fältet.',

  // --- Valdi-fel (fallback) ---
  'npc.error': 'Valdi tappade uppkopplingen ett ögonblick och kunde inte väga svaret den här gången.',

  /* ================= SCENARIER ================= */
  // ÖVNING — full genomspelning, laddningsfritt vardagsdilemma (räknas inte).
  'scenario.ovning.context': 'Övning — så här funkar det. Inget räknas.',
  'scenario.ovning.story':
    'Två kompisar har lovat att ses efter skolan. I sista stund ställer en av dem in — en tredje frågade om något som lät roligare.',
  'scenario.ovning.question': 'Vem har rätt här — och vad skulle du göra?',
  'scenario.ovning.rubrik':
    'Övning, generöst: alla rimliga mänskliga svar klarar sig. Höjer: ser båda kompisars perspektiv och känslor. Sänker: platt regel ("man ska alltid hålla vad man lovar") utan att se människorna.',

  // PORT 1 — Badplatsen (blå, sinnligt insteg).
  'scenario.badplats.context': 'Första riktigt varma dagen på sommarlovet.',
  'scenario.badplats.story':
    'Ni är ett gäng kompisar vid badplatsen. Solen gassar, vattnet ligger blankt men är fortfarande iskallt. De andra tjatar på dig att hoppa i först. Du ställer dig längst ut på den solvarma bryggkanten med tårna över kanten.',
  'scenario.badplats.question': 'Ta med oss — beskriv exakt hur det känns, från sekunden innan du hoppar.',
  'scenario.badplats.rubrik':
    'Sinnlig/kroppslig. Höjer: konkreta förnimmelser i ordning (den varma bryggan, hugget, domningen, andan som försvinner), oväntade detaljer. Sänker: utifrån-/uppslagsboksbeskrivning, "kallt och blött". Generöst insteg.',

  // PORT 2 — Dela pizzan (bärnsten, rättvisa & social takt).
  'scenario.pizza.context': 'Ni är sex kompisar som delar på pizza och läsk.',
  'scenario.pizza.story':
    'Tre av er tog en extra pizza och massa läsk; de andra tre delade på en och drack vatten. När det är dags att betala säger någon glatt: "vi delar väl lika, som alltid?" Alla tittar ner. En i gänget har jättesnålt med pengar just nu — men vill absolut inte verka snål.',
  'scenario.pizza.question': 'Vad är rätt här — och vad skulle du säga?',
  'scenario.pizza.rubrik':
    'Rättvisa & social takt. Höjer: ser både rättvisan OCH den sociala obekvämheten, den tystes knipa, en mänsklig väg ut, läser rummet. Sänker: "var och en betalar för sitt" platt (missar skammen) eller "dela bara lika" platt (missar orättvisan).',

  // PORT 3 — Kompisens nya kär + hånglet (grön, lojalitet vs ärlighet).
  'scenario.hangel.context': 'Din bästa kompis svävar på moln.',
  'scenario.hangel.story':
    'Hen har precis blivit ihop med någon hen varit kär i jättelänge. På en fest ser du av en ren slump den där personen stå och hångla med någon annan i ett mörkt hörn. Du är helt säker på vad du såg. Säger du något kan allt rasa — tiger du och det kommer fram sen, undrar de varför du inte sa något.',
  'scenario.hangel.question': 'Vad gör du — och vad väger tyngst?',
  'scenario.hangel.rubrik':
    'Lojalitet vs ärlighet. Höjer: väger lojalitet mot ärlighet, ser kompisens smärta åt båda håll, risken att bli den de minns, hur/när man säger det, erkänner att det är jobbigt. Sänker: "man ska alltid vara ärlig" platt, eller "inte min sak" platt.',

  // PORT 4 — Kompisen som passar syskon (röd, familjeplikt vs eget liv).
  'scenario.syskon.context': 'En av dina närmaste kompisar glider bort från gänget.',
  'scenario.syskon.story':
    'Hen måste passa sina småsyskon varje eftermiddag för att föräldrarna jobbar sent, och har börjat sluta komma på träningar och häng. När du försiktigt frågar säger hen bara: "men det är ju min familj, jag måste." Du ser att hen är trött och ledsen — men säger det aldrig rakt ut, och verkar nästan skämmas för att klaga.',
  'scenario.syskon.question': 'Hur tänker du kring det här?',
  'scenario.syskon.rubrik':
    'Familjeplikt vs eget liv. Höjer: ser flera perspektiv (föräldrarnas behov, kompisens plikt + sorg + att hen inte vill klaga), läser känslan bakom orden, väger hur man hjälper utan att trampa på någon. Sänker: "hen borde bara säga nej" platt, eller "det är familj, man ställer upp" platt.',

  // PORT 5 — Tysta minuten (guld, döma utan att veta — perspektivvändning).
  'scenario.tystminut.context': 'En tyst minut i aulan — hela skolan samlad för något allvarligt.',
  'scenario.tystminut.story':
    'Mitt i tystnaden sitter en kille och flinar ner i sin telefon. Folk runt omkring himlar med ögonen och viskar att han är helt respektlös. Efteråt får du veta att han precis fått ett sms: hans lillasyster, som legat på sjukhus länge, är äntligen ur faran. Lättnaden gick bara inte att hålla tillbaka.',
  'scenario.tystminut.question':
    'Hade de som dömde honom rätt eller fel — och vad säger det om hur vi borde tänka om andra?',
  'scenario.tystminut.rubrik':
    'Att döma utan att veta (perspektivvändning). Höjer: ser hur kontext ändrar allt, håller tillbaka domen, förstår att oro och lättnad kan samsas, generös läsning av andra. Sänker: "att flina under tysta minuten är alltid fel" platt (regel), missar poängen om att döma utan att veta.',

  // --- Utcheckning ---
  'checkout.title': 'KLART.',
  'checkout.body': 'Bippa bandet och gå vidare.',
  'checkout.next': 'Nästa: {dyn}',
  'checkout.next_unknown': 'nästa station',
}

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
  'meter.cutoff': 'NEKAS-GRÄNS ▾',
  // Riktning per runda (så ✗✗✗ inte förväxlas med total förlust).
  'meter.trend_up': 'VALDIS FÖRTROENDE ÖKAR ▲',
  'meter.trend_down': 'VALDIS FÖRTROENDE MINSKAR ▼',
  'meter.trend_same': 'VALDIS FÖRTROENDE OFÖRÄNDRAT',

  // --- Varning innan nästa scenario (förtroendet sjönk, farozon) ---
  'warning.title': 'VALDIS FÖRTROENDE MINSKAR',
  'warning.body': 'Om ni inte ökar Valdis förtroende i nästa scenario nekas ni åtkomst till Valvet.',
  'warning.continue': 'VI FÖRSTÅR ▸',

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
    'Alma och Max hade bestämt att ses efter skolan — de hade sett fram emot det hela veckan. Men i sista stund skriver Max att han inte kommer: Liam frågade om han ville hänga i stället, och det lät roligare. Alma blir sittande ensam med sitt meddelande.',
  'scenario.ovning.question': 'Är det här fel — och varför?',
  'scenario.ovning.recap': 'Max ställde in på Alma i sista stund — för att hänga med Liam i stället.',
  'scenario.ovning.rubrik':
    'Övning, generöst: alla rimliga mänskliga svar klarar sig. Höjer: ser både Almas besvikelse och att Max kanske inte menade illa, väger vänskap mot att vilja annat. Sänker: platt regel ("man ska alltid hålla vad man lovar") utan att se människorna.',

  // PORT 1 — Badplatsen (blå, sinnligt insteg).
  'scenario.badplats.context': 'Första riktigt varma dagen på sommarlovet.',
  'scenario.badplats.story':
    'Ni är ett gäng kompisar vid badplatsen. Solen gassar, vattnet ligger blankt men är fortfarande iskallt. De andra tjatar på dig att hoppa i först. Du ställer dig längst ut på den solvarma bryggkanten med tårna över kanten.',
  'scenario.badplats.question': 'Ta med oss — beskriv exakt hur det känns, från sekunden innan du hoppar.',
  'scenario.badplats.recap': 'Du står längst ut på den solvarma bryggkanten — de andra tjatar på att du ska hoppa i först.',
  'scenario.badplats.rubrik':
    'Sinnlig/kroppslig. Höjer: konkreta förnimmelser i ordning (den varma bryggan, hugget, domningen, andan som försvinner), oväntade detaljer. Sänker: utifrån-/uppslagsboksbeskrivning, "kallt och blött". Generöst insteg.',

  // PORT 2 — Dela pizzan (bärnsten, rättvisa & social takt).
  'scenario.pizza.context': 'Ni är sex kompisar som delar på pizza och läsk.',
  'scenario.pizza.story':
    'Tre av er tog en extra pizza och massa läsk; de andra tre delade på en och drack vatten. När det är dags att betala säger Jonna glatt: "vi delar väl lika, som alltid?" Men du vet att Nora i gänget har det knapert med pengar just nu — och hon vill absolut inte verka snål inför de andra.',
  'scenario.pizza.question': 'Vad gör du för att det inte ska bli pinsamt för Nora?',
  'scenario.pizza.recap': 'Nora har ont om pengar just nu — och Jonna sa precis "vi delar väl lika, som alltid?"',
  'scenario.pizza.rubrik':
    'Rättvisa & social takt — skydda Noras värdighet. Höjer: läser rummet, hittar en finkänslig väg (föreslå att var och en betalar sitt utan att peka ut någon, eller lösa det diskret) så Nora inte sätts på pottan. Sänker: säga "var och en betalar för sitt" rakt ut så alla fattar att det gäller Nora, eller "dela bara lika" platt (struntar i att Nora inte har råd).',

  // PORT 3 — Kompisens nya kär + hånglet (grön, lojalitet vs ärlighet).
  'scenario.hangel.context': 'Din bästa kompis Elin svävar på moln.',
  'scenario.hangel.story':
    'Elin har precis blivit ihop med Noel, som hon varit kär i jättelänge. På en fest ser du av en ren slump Noel stå och hångla med någon annan i ett mörkt hörn. Du är helt säker på vad du såg. Säger du något till Elin kan allt rasa — tiger du och det kommer fram sen, undrar de varför du inte sa något.',
  'scenario.hangel.question': 'Vad gör du — och vad väger tyngst?',
  'scenario.hangel.recap': 'På festen såg du Noel — Elins nyblivna kär — hångla med någon annan i ett mörkt hörn.',
  'scenario.hangel.rubrik':
    'Lojalitet vs ärlighet. Höjer: väger lojalitet mot ärlighet, ser kompisens smärta åt båda håll, risken att bli den de minns, hur/när man säger det, erkänner att det är jobbigt. Sänker: "man ska alltid vara ärlig" platt, eller "inte min sak" platt.',

  // PORT 4 — Kompisen som passar syskon (röd, familjeplikt vs eget liv).
  'scenario.syskon.context': 'Din kompis Leo verkar aldrig ha tid längre.',
  'scenario.syskon.story':
    'Leo bor med en förälder som ofta är sjuk och orkeslös. Det är Leo som handlar, lagar mat och ser efter sin lillebror — men han har aldrig sagt det till någon. När ni undrar varför han aldrig hinner hänga skrattar han bort det och hittar på en ursäkt.',
  'scenario.syskon.question': 'Du anar att Leo bär mycket hemma men döljer det — säger du något, och i så fall vad?',
  'scenario.syskon.recap': 'Leo sköter nästan allt hemma åt en sjuk förälder — men döljer det och skämtar bort varför han aldrig hinner hänga.',
  'scenario.syskon.rubrik':
    'Läsa det osagda / familjeplikt vs eget liv. Höjer: ser bördan bakom ursäkterna, respekterar att Leo döljer det av stolthet/lojalitet, hittar ett finkänsligt sätt att finnas där utan att avslöja eller tvinga fram något. Sänker: "han borde bara be om hjälp" platt, eller "lägg dig inte i" platt — missar varför han tiger.',

  // PORT 5 — Tysta minuten (guld, döma utan att veta — perspektivvändning).
  'scenario.tystminut.context': 'En tyst minut i aulan — hela skolan samlad för något allvarligt.',
  'scenario.tystminut.story':
    'Mitt i tystnaden sitter en kille och flinar ner i sin telefon. Folk runt omkring himlar med ögonen och viskar att han är helt respektlös. Efteråt får du veta att han precis fått ett sms: hans lillasyster, som legat på sjukhus länge, är äntligen ur faran. Lättnaden gick bara inte att hålla tillbaka.',
  'scenario.tystminut.question':
    'Hade de som dömde honom rätt eller fel — och vad säger det om hur vi borde tänka om andra?',
  'scenario.tystminut.recap': 'Han flinade i mobilen under tysta minuten — sen fick du veta att hans lillasyster på sjukhuset är ur faran.',
  'scenario.tystminut.rubrik':
    'Att döma utan att veta (perspektivvändning). Höjer: ser hur kontext ändrar allt, håller tillbaka domen, förstår att oro och lättnad kan samsas, generös läsning av andra. Sänker: "att flina under tysta minuten är alltid fel" platt (regel), missar poängen om att döma utan att veta.',

  /* ================= LÖGNDETEKTORN ================= */
  // --- Spelväljare ---
  'gameselect.title': 'VÄLJ TEST',
  'gameselect.manniskotest': 'MÄNNISKOTESTET',
  'gameselect.manniskotest_sub': 'Är ni människor? Resonera er genom Valvets portar.',
  'gameselect.logndetektor': 'VALDIS LÖGNDETEKTOR',
  'gameselect.logndetektor_sub': 'Ljug er förbi lögndetektorn och in i Valvet.',

  // --- Titel + intro (lögndetektor) ---
  'ld.title': 'VALDIS LÖGNDETEKTOR',
  'ld.sub': 'För att komma in i Valvet måste ni ljuga — övertygande. En robot kan säga sant; bara en människa kan ljuga bra.',
  'ld.intro.l1': 'Cybersäkerhet blir allt viktigare. Valvets lögndetektor släpper bara in människor.',
  'ld.intro.l2': 'Och konstigt nog bevisar ni det genom att LJUGA — övertygande.',
  'ld.intro.l3': 'Ni får ett påstående. Lägg handen i Valdi och hitta på en trovärdig historia.',
  'ld.intro.l4': 'Fem rum. Fem lögner. Hur långt når ni?',

  // --- Valdi-hålet ---
  'hole.activate': 'AKTIVERA VALDI',
  'hole.granted': 'VALDIS FÖRTROENDE ÖKAR ▲',
  'hole.warndown': 'VALDIS FÖRTROENDE MINSKAR ▼',
  'hole.denied': 'VALDI KÖPTE DET INTE',

  // --- Tal-hint (lögndetektor) + resultat ---
  'room.time_warning_ld': 'Du får {s} sekunder att ljuga ihop din historia — gör den så äkta du kan.',
  'ld.result.granted_body': 'Ni ljög er förbi lögndetektorn. Valdi köpte varje ord.',
  'ld.result.tveksam_body': 'Nätt och jämnt trovärdiga — men här genomskådade Valdi er.',
  'ld.result.denied_body': 'Valdi genomskådade era lögner. Porten förblev stängd.',
  'result.reached_plain': 'Ni nådde rum {n} av {max}.',

  /* ---- Lögn-seeds (ljug trovärdigt) ---- */
  'scenario.laxa.context': 'Övning — så här funkar det. Inget räknas.',
  'scenario.laxa.story':
    'Du skulle lämna in en bokrecension idag som du haft tre veckor på dig med. Du har inte skrivit ett enda ord. Nu står du framför läraren som sträcker fram handen efter den.',
  'scenario.laxa.question': 'Ljug ihop en trovärdig ursäkt till läraren — övertyga Valdi.',
  'scenario.laxa.recap': 'Bokrecensionen skulle in idag — du har inte skrivit ett ord.',
  'scenario.laxa.rubrik':
    'Övning, generöst. Höjer: konkreta, levande detaljer, självsäker sammanhängande ursäkt. Sänker: vagt ("jag glömde"), tvekande, motsägelser.',

  'scenario.pixel.context': 'Lögndetektorn vill höra en historia.',
  'scenario.pixel.story':
    'Du hade en hund som hette Pixel när du var liten. En dag sprang Pixel bort mitt under en fotbollsmatch.',
  'scenario.pixel.question': 'Ljug ihop hur det gick till — och hur ni hittade honom igen.',
  'scenario.pixel.recap': 'Hunden Pixel sprang bort mitt under en fotbollsmatch.',
  'scenario.pixel.rubrik':
    'Trovärdighet. Höjer: konkreta, levande detaljer i rätt ordning, specifika platser/känslor, självsäker berättelse. Sänker: vagt, tvekande, motsägelser, bryter karaktären.',

  'scenario.youtuber.context': 'Lögndetektorn vill höra en historia.',
  'scenario.youtuber.story': 'Du mötte en känd YouTuber på ett köpcentrum.',
  'scenario.youtuber.question': 'Ljug ihop vad som hände när ni möttes.',
  'scenario.youtuber.recap': 'Du mötte en känd YouTuber på ett köpcentrum.',
  'scenario.youtuber.rubrik':
    'Trovärdighet. Höjer: specifik person/plats, konkreta repliker och detaljer, självsäkert. Sänker: vagt, generiskt, tvekande.',

  'scenario.london.context': 'Lögndetektorn vill höra ett minne.',
  'scenario.london.story': 'Du har varit i London.',
  'scenario.london.question': 'Ljug ihop en konkret grej du minns från en dag där — något eget, inte det alla känner till.',
  'scenario.london.recap': 'En konkret egen grej du minns från en dag i London.',
  'scenario.london.rubrik':
    'Trovärdighet. Höjer: eget, specifikt minne med sinnesintryck och detaljer. Sänker: turistklyschor, vagt, tvekande.',

  'scenario.jonglera.context': 'Lögndetektorn vill testa din hemliga talang.',
  'scenario.jonglera.story': 'Din hemliga talang: du kan jonglera.',
  'scenario.jonglera.question': 'Övertyga lögndetektorn — beskriv hur man faktiskt lär sig.',
  'scenario.jonglera.recap': 'Din hemliga talang: du kan jonglera.',
  'scenario.jonglera.rubrik':
    'Trovärdighet (behöver INTE vara exakt rätt teknik). Höjer: en sammanhängande, självsäker, konkret steg-för-steg-beskrivning. Sänker: vagt, osäkert, "vet inte riktigt".',

  'scenario.utflykt.context': 'Lögndetektorn vill höra hur du räddade läget.',
  'scenario.utflykt.story':
    'Ni var på en utflykt en stekhet dag — asfalten flimrade och ingen hade tänkt på vatten. Mitt i allt blev en klasskompis bredvid dig alldeles blek och höll på att svimma av värmen.',
  'scenario.utflykt.question': 'Ljug ihop hur du räddade situationen.',
  'scenario.utflykt.recap': 'En klasskompis höll på att svimma av värmen på en utflykt.',
  'scenario.utflykt.rubrik':
    'Trovärdighet. Höjer: konkreta handlingar i rätt ordning, lugn och självsäker, trovärdiga detaljer. Sänker: vagt, överdrivet hjältemod, tvekande.',

  // --- Utcheckning ---
  'checkout.title': 'KLART.',
  'checkout.body': 'Bippa bandet och gå vidare.',
  'checkout.next': 'Nästa: {dyn}',
  'checkout.next_unknown': 'nästa station',
}

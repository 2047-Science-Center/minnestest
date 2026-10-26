# Lögndetektorn — flödes-, UI- & mekanikspec (FÖRSLAG, inget byggt)

Bara **R1** (tilldelat scenario, ljug trovärdigt). Transkript-only-regelverk: se
`logndetektor-R1-spec.md`. Det här dokumentet reder ut titel, intro, flöde, pipelining,
reveal, förtroendemätaren och copy.

---

## A) Låsta R1-scenarier (seeds)
Deltagaren får en seed och ska **ljuga ihop** resten trovärdigt.

1. **Husdjur:** "Du hade en hund som hette **Pixel** när du var liten. En dag sprang Pixel bort mitt under en fotbollsmatch. Ljug ihop hur det gick till och hur ni hittade honom igen."
2. **Känd person:** "Du mötte en känd **YouTuber på ett köpcentrum**. Ljug ihop vad som hände när ni möttes."
3. **Resa:** "Du har varit i **London**. Ljug ihop en konkret grej du minns från en dag där — inte det alla känner till, utan något eget."
4. **Hemlig talang:** "Din hemliga talang: du kan **jonglera**. Övertyga lögndetektorn — beskriv hur man faktiskt lär sig." *(Regelverk: det behöver INTE vara exakt rätt teknik — en sammanhängande, självsäker, konkret beskrivning väger högt; vagt/osäkert väger lågt.)*
5. **Rädda ur knipa:** "Ni var på en **utflykt en stekhet dag** — asfalten flimrade och ingen hade tänkt på vatten. Mitt i allt blir en **klasskompis bredvid dig alldeles blek, vinglar till och håller på att svimma av värmen**. Ljug ihop hur du räddade situationen."

---

## B) Flöde & UI

### Titel (3 förslag)
- **VALDIS LÖGNDETEKTOR**
- **MÄNSKLIGHETSTESTET**
- **SANNINGSPORTEN** *(ironiskt — man måste ljuga)*

### Ram & intro-ruta (första skärmen)
Twisten: för att passera lögndetektorn och komma in i Valvet måste ni **LJUGA** — en robot
kan säga sant, men bara en människa kan ljuga *övertygande*. Copy-förslag (ej exakta ord):
> "Valvets lögndetektor släpper bara in människor. Konstigt nog bevisar ni det genom att
> **ljuga bra**. Ni får ett påstående — hitta på en trovärdig historia. VALDI väger varje
> ord och avgör om ni är människor … eller robotar."

Behåll app-förbättringarna: texten dyker upp **bit för bit (stagger)**, full-skärms scen i
bakgrunden, blått pilot-tema under övning.

### Övnings-/testomgång
Alla tre gör **en övningsrunda** först (eget enkelt scenario, t.ex. "Ljug ihop vad du åt till
frukost i morse") → de lär sig mekaniken (säga på tur, 20 s, mätaren) utan att det räknas.
Reveal visar hur VALDI väger, men mätaren nollställs innan skarpt.

### Deltagare
**Tre deltagare.** Nu generiskt **"Deltagare 1 / 2 / 3"**. Bygg så **namn kan slås på** senare
(från incheckning) → "Alma kliver fram…". En `names?: string[]`-flagga; fall tillbaka på
"Deltagare N" när den saknas.

### En runda (per scenario), steg för steg
1. **Scenariot visas** (seed, stor, stagger) + "Klicka när ni är redo".
2. **Countdown** (samma som task-starten, 5 s).
3. **Deltagare 1** – "Säg vad du tänker" · **20 sekunder** (de får veta FÖRE att det är 20 s).
4. Klar → **5 s countdown** till nästa.
5. **Deltagare 2** – 20 s → **5 s countdown** → **Deltagare 3** – 20 s.
6. → **VALDI FUNDERAR** → **gemensam reveal** (se nedan).

### GPT-pipelining (som Utmana experten)
- När **Deltagare 1** är klar → skicka `/assess`-anropet direkt (medan 2 pratar).
- När **Deltagare 2** är klar → skicka anropet (medan 3 pratar).
- När **Deltagare 3** är klar → skicka anropet.
- **"VALDI FUNDERAR"** väntar i praktiken bara in **det sista** svaret (de två första är redan
  bearbetade) → kort upplevd väntan. Plus ev. ett kort **sammanvägnings-anrop** som väver ihop
  de tre till ett gemensamt utlåtande.

### Gemensam reveal
Alla tre presenteras **ihop**, en i taget med pling:
- "Spelare 1 … ✓" **(ding)** · "Spelare 2 … ✓" **(ding)** · "Spelare 3 … ✗" **(fail-ljud)**
  (individuellt ✓/✗ ur varje svars `overtygande` mot en bar, t.ex. ≥5 = ✓).
- Mätaren rör sig **en gång** på gruppens sammanvägda resultat (se C).

### Sammanvägt utlåtande (sist, uppläst)
AI:n lyfter något **var** person sa (2–3 meningar totalt), gemensamt och **vägande**:
> "När Deltagare 1 nämnde att hunden luktade korv under grillen trodde jag på det. Flera av er
> var inne på småsaker som kändes äkta — det drog upp mig. Men Deltagare 3:s resa lät som ett
> vykort, och där tvekade jag. Sammantaget: tillräckligt mänskligt. Ni får fortsätta."

---

## C) Förtroendemätaren (ersätter poäng/threshold)

En **mätare synlig hela tiden** (horisontell bar, LED-list-vänlig). **En mätare för gruppen**
(de passerar tillsammans). Start i **neutralt nolläge (mitten)**.

### Zoner
```
|■■■■■■ INGET FÖRTROENDE ■■■■■|□□□□ TVEKSAM □□□□|▓▓▓ HÖGT FÖRTROENDE ▓▓▓|
0            (förlust-zon) 30            65            100
                                  ▲ start = 50 (neutralt)
```
- **0–30 · INGET FÖRTROENDE (röd, förlust-zon):** faller mätaren hit → **ni förlorar**, Valvet
  förblir stängt ("VALDI dömer er som robotar").
- **30–65 · TVEKSAM (bärnsten):** på gränsen — kämpa er uppåt.
- **65–100 · HÖGT FÖRTROENDE (grön):** övertygande mänskliga.

### Vad som driver nålen — en DOLD 1–10 bakom kulisserna
Samma beprövade modell som den gatade stegen: `/assess` ger en **dold poäng 0–10**
(`overtygande`) per deltagares svar. Deltagarna ser **aldrig siffran** — bara nålen som rör
sig mellan zonerna. Det är allt: 1–10 bakom kulisserna → mätarrörelse framför.

### Rörelse per runda
- Varje svar → dold `overtygande` 0–10 (3 st per runda).
- **Rundans sammanvägda = medelvärdet** av de tre.
- **Par (står stilla) = 5,5.** Nålens rörelse denna runda = `(medel − 5,5) × k`.
- Förslag `k ≈ 5` → medel 10 ≈ **+22**, medel 5,5 ≈ **0** (står still), medel 1 ≈ **−22**.
  Tre övertygande svar lyfter tydligt; tre svaga tappar lika mycket.
- **Per-spelare ✓/✗ i revealen** läses ur varje deltagares EGNA dolda poäng (t.ex. ≥ 5,5 = ✓,
  annars ✗). Men **mätaren rör sig bara på det sammanvägda medlet** — gruppen åker tillsammans.
- **Stegring:** höj paret på de senare scenarierna (t.ex. par 6,0 på runda 4 och 6,5 på runda 5)
  så det blir allt svårare att hålla ställningen → "nå så långt som möjligt".

### Start-/förlust-/slutvillkor
- **Start:** 50 (neutralt), skarpt (övningen räknas inte).
- **Förlust:** mätaren ≤ 30 efter någon runda → slut, ni kom inte in.
- **Vinst/"så långt som möjligt":** överlev alla 5 rundor. Slutläge avgör finalen:
  HÖGT FÖRTROENDE → "Välkomna in i Valvet" (belöning); TVEKSAM → "nätt och jämnt mänskliga";
  nära röd → dramatiskt nödrop.
- Koppling till de 5 scenarierna: en runda = ett scenario (1→5), stigande svårighet.

---

## D) Copy-förslag (svenska, ej exakta ord)
- **Titel:** se B (3 förslag).
- **Intro-ruta:** se B ("…bevisar ni det genom att ljuga bra…").
- **Övnings-instruktion:** "Först en övning — ingen press, inget räknas. Ljug ihop vad du åt
  till frukost. Turas om, 20 sekunder var."
- **20-sek-förvarning (före mik):** "Du får **20 sekunder** att ljuga ihop din historia. Gör
  den så äkta du kan."
- **Countdown-etikett (rundstart):** "Lögndetektorn startar om …"
- **Countdown-etikett (mellan deltagare):** "Nästa på tur om …"
- **Per-deltagare-uppmaning:** "**Deltagare 2** — säg vad du tänker. Övertyga mig."
- **VALDI funderar:** "VALDI väger era ord …"
- **Reveal-pling:** ✓ "Spelare 1 — köpte den." / ✗ "Spelare 3 — där luktade det robot."
- **Utlåtande-ton:** torr, vägande, lite komisk — citerar tillbaka, väger båda håll, landar
  (se exempel i B).

---

## E) Öppna frågor / beslut att bekräfta
1. **Titel** — vilken av de tre (eller annan)?
2. **Individuellt ✓/✗ + gruppmätare** — kör vi båda (personligt pling + gemensam mätare), eller
   ska mätaren vara ren grupp utan individuella ✓/✗?
3. **Förlust mitt i** — ska en grupp som faller i röd zon åka ut *direkt* (dramatiskt), eller
   alltid få spela klart alla 5 och få sitt slutläge? (Jag föreslår: ut direkt = mer spänning.)
4. **k och ribban** — godkänn startvärde 50, förlust ≤ 30, `k ≈ 2.5` och stigande ribba 4–5,
   så tunar vi känslan i test.
5. **Övningsscenariot** — "frukost i morse" ok, eller vill du ha ett annat neutralt?
6. **Sammanvägnings-anrop** — eget litet GPT-anrop för det gemensamma utlåtandet, eller väva
   ihop de tre lokalt i koden? (Eget anrop = rikare utlåtande, en extra kostnad per runda.)
7. **Antal deltagare** — alltid exakt 3? Hur hanterar vi 2 eller 4 om det händer?

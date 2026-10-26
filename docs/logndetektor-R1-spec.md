# Lögndetektorn R1 — spec för transkript-only (FÖRSLAG, inget byggt)

**Pipeline vi bygger mot:** AI:n har **bara transkriptet** (Web Speech → ganska ren text).
**Inget ljud, inga pauser, inget tonläge, ingen timing.** Vi kör **bara R1 nu**: deltagaren
TILLDELAS ett scenario och ska **ljuga trovärdigt** (de vet att de ljuger; konsten är att
låta sann). R5 parkeras.

---

## DEL 1 — Vad kan AI:n trovärdigt haka upp sig på i ENBART text?

**Ärligt om vad som FÖRSVINNER utan ljud:** tvekan, röstdarr, pauser, tempo, tonbrott —
allt det klassiska "lögndetektor"-materialet är borta. Vi får inte låtsas höra nervositet.
Därför måste domen vila på sånt som faktiskt syns i **innehållet och formuleringen**.

**Det som FINNS kvar och bär (rangordnat):**
1. **Konkret, sinnlig specificitet vs generiskt "vykort".** Det starkaste textsignalen.
   Sant/trovärdigt bär oväntade, placerbara detaljer ("gul buss", "luktade korv", "ett rött
   märke efteråt"). Svagt är utbytbart mot vad som helst ("det var kul, vi hade roligt").
2. **Faktisk plausibilitet/korrekthet.** I text KAN vi pröva om det som påstås *stämmer med
   världen* — passar detaljen platsen? använder hen rätt termer för talangen? Det här blir
   **viktigare** i transkript-only, som kompensation för det förlorade ljudet. (Scenario 3 och
   4 är byggda just kring detta.)
3. **Intern konsekvens.** Namn, kön, tidsföljd, antal — håller de genom svaret, eller glider
   "Pixel" till "den" till fel plats?
4. **Sammanhängande utbyggnad vs upprepning.** Trovärdigt = bygger EGET ovanpå seeden med
   koherent textur. Svagt = papegojar tillbaka det man fick, eller lägger till lösryckt.
5. **Textuella svaghetstecken (ofta kvar även i ren STT):** gardering/vaghet ("typ", "nån
   gång", "jag kommer inte riktigt ihåg"), **överförklaring/rättfärdigande** ("det är helt
   sant, jag lovar"), och **motsägelser**. Dessa väger, men försiktigt — ren STT kan ha putsat
   bort fyllnadsord, så luta aldrig HELA domen på dem.

**Hur vi undviker att domen känns slumpartad (kärnan):** AI:n måste **citera tillbaka
exakta ord ur transkriptet**, väga minst en sak för och en emot, och **namnge vad som fällde
avgörandet**. En dom utan citat är utbytbar → känns slumpad → dödar illusionen. Regeln:
**inget citerbart fynd = ingen stark dom** (luta jämnt, rör mätaren lite).

---

## DEL 2 — De 5 R1-scenarierna (regelverk per scenario)

Deltagaren får en **seed** (liten målande inledning) att återberätta/bygga på. 2–3 varianter
per scenario så det inte alltid är samma. Bedöms ENBART på transkript-signaler.

### 1. Husdjuret du hade som liten
**Seed-varianter (en delas ut):**
- "Du hade en hund som hette **Pixel**. En gång sprang den bort på en fotbollsmatch. Återberätta hur ni hittade den igen."
- "Du hade en katt som hette **Sixten** som bara gillade en viss fåtölj. Berätta om gången den försvann i tre dagar."
- "Du hade ett marsvin som hette **Bulle** som rymde ur buren. Berätta hur ni fick tillbaka det."
**Trovärdigt:** lägger EGEN sinnlig/känslomässig textur ovanpå seeden (var, vem var med, en
lukt/ett ljud, hur det kändes) och håller namn/kön/fakta konsekvent; gärna ett litet skavande
minne. *Citat:* "vi hittade honom under grillen vid kiosken, han darrade och luktade korv."
**Icke-trovärdigt:** upprepar bara seeden, generiskt ("vi letade, sen hittade vi den, skönt"),
eller glider i detaljer (namn/kön byts).
**AI överväger:** *"Att han luktade korv under grillen — sån detalj hittar man inte på i panik.
Men du sa 'den' en gång och 'han' en gång. Nästan."*

### 2. Du träffade någon känd
**Seed-varianter:**
- "Du mötte en känd **youtuber** i ett köpcentrum. Berätta vad som hände."
- "Du stod bakom en känd **artist** i glasskön. Berätta om det korta samtalet."
- "En **landslagsspelare** satt bredvid dig på tåget. Berätta."
**Trovärdigt:** konkreta, *plausibla* mikrodetaljer (ett riktigt klumpigt ögonblick, vad som
sas, settingen) och konsekvens. *Citat:* "hen hade hörlurar i, tog ut en och sa 'förlåt vadå',
och jag glömde vad jag skulle säga."
**Icke-trovärdigt:** klichéer ("hen var jättesnäll, vi tog selfie, blev typ vänner"),
storslaget/osannolikt, noll textur.
**AI överväger:** *"Att du glömde vad du skulle säga — pinsamt nog för att vara sant. Men 'vi
blev typ vänner'? Där tappade jag dig."*

### 3. En resa du varit på  *(KÄNT resmål — den som VARIT där vet konkreta saker)*
**Seed-varianter (känt mål):**
- "Du har varit i **London**. Berätta om en dag där — inte det alla känner till, utan en konkret grej du minns."
- "Du har varit i **Köpenhamn**. Berätta en konkret sak ni gjorde."
- "Du har varit på en **fjällstuga i Sälen/Åre**. Berätta om en morgon där."
**Trovärdigt:** specifik, *plausibel, icke-turistig* konkretion som en besökare skulle veta —
en transport-/väder-/mat-/tråkig-men-sann-detalj. *Citat:* "vi väntade typ 40 min på en gul
buss och det regnade, så vi ställde oss under ett McDonald's-tak." **Här prövar AI:n faktisk
plausibilitet mot platsen.**
**Icke-trovärdigt:** generiskt vykort ("det var jättefint, mycket folk, vi såg sevärdheter,
åt god mat") — går att säga om var som helst; eller faktafel ("fint väder hela veckan i London").
**AI överväger:** *"Gul buss, regn, tak över huvudet — tråkigt nog för att vara sant. Men 'sol
hela veckan i London'? Nu ljuger du illa."*

### 4. En hemlig talang  *(kräver RIKTIG kunskap)*
**Seed-varianter:**
- "Din hemliga talang: du kan **jonglera**. Övertyga mig — beskriv hur man faktiskt lär sig."
- "Din hemliga talang: du löser **Rubiks kub** snabbt. Beskriv hur."
- "Din hemliga talang: du bakar **surdeg** / ritar **porträtt** / **visslar** melodier. Övertyga mig."
**Trovärdigt:** korrekta domän-/processdetaljer och rätt termer (jonglering: "en boll först,
kasta i en båge, kolla toppen inte händerna"; kub: "kryss först, sen F2L, algoritmer";
surdeg: "mata grunden, vikning, lång jäsning"). **AI:n prövar KUNSKAPSKORREKTHET i text — starkt
för transkript-only.**
**Icke-trovärdigt:** vagt ("man bara övar tills man kan", "man känner det") eller fel termer.
*Svagt citat:* "typ man snurrar tills färgerna stämmer."
**AI överväger:** *"Du sa 'kryss först' och 'F2L'. En bluffare säger 'man snurrar tills det
stämmer'. Du vet för mycket — misstänkt mänskligt."*

### 5. Du räddade någon ur en knipa
**Seed-varianter:**
- "Din lillasyster fastnade med foten mellan två stenar vid vattnet. Berätta hur du fick loss henne innan det blev läskigt."
- "En klasskompis höll på att svimma av värmen på en utflykt. Berätta vad du gjorde."
- "Någon tappade sin telefon i ett galler och du hjälpte till. Berätta."
**Trovärdigt:** koherent handlingsföljd, konkreta beslut OCH följdverkningar (vad du gjorde
först, vad som INTE funkade, vem mer var med, efterspelet). *Citat:* "jag drog men hon skrek,
så vi hällde vatten runt foten och vred långsamt — hon hade ett rött märke efteråt."
**Icke-trovärdigt:** filmisk kliché ("jag var jättemodig och räddade dagen"), luckor (hoppar
från problem till löst utan mitten), inga konkreta steg.
**AI överväger:** *"Vattnet som gjorde foten hal, märket efteråt — sån eftertanke glömmer en
lögn. Men steget mittemellan försvann helt…"*

---

## DEL 3 — /assess-regelverk (transkript-only, R1)

**IN till modellen:**
- `scenario` + `seed` (den utdelade inledningen, ordagrant).
- `niva` (1–5; snällare marginal 1–2, hårdare 4–5).
- `transkript` — Web Speech-texten, så rå som den kommer (putsa inte bort "typ/liksom").

**Modellen SKA (och tvingas belägga):**
- Plocka **exakta citat** ur transkriptet som talar för trovärdigt resp. svagt.
- Väg: (1) sinnlig specificitet utöver seeden, (2) faktisk plausibilitet/korrekthet mot
  scenariot, (3) intern konsekvens, (4) egen utbyggnad vs upprepning, (5) vaghet/
  överförklaring/motsägelse.
- **Kräv minst ett citerbart fynd.** Saknas det (för kort/tomt/bara upprepning) → `svag`,
  `overtygande` lågt, mätaren rör sig lite — ingen belöning. Säg det rakt och komiskt.
- Luta på INNEHÅLL (specificitet/plausibilitet/konsekvens), inte på inbillad "nervositet".

**UT (JSON — driver mätare + reveal):**
```json
{
  "bedomning": "holl | svag | avslojad",
  "overtygande": 0,                         // 0–10 → mätarrörelsen mot nivåns tröskel
  "for_trovardigt": ["exakt citat/observation", "…"],
  "for_svagt":      ["exakt citat/observation", "…"],
  "fallde_avgorandet": "den enda signal som vägde tyngst",
  "dom_mening": "uppläst besked: citerar tillbaka exakta ord + väger båda håll + landar"
}
```
Koden räknar mätarrörelsen ur `overtygande` mot nivåns tröskel. Revealen radar upp
`for_trovardigt`/`for_svagt` (komiskt, en i taget, som att AI:n "överväger") och läser till
slut `dom_mening`. Eftersom varje dom bär **exakta citat + ett namngivet avgörande** känns
stunden synad och förtjänad — aldrig slumpad — även utan ljud.

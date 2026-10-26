# Minnestestet / FLYKTEN — utvärdering: läsbarhet + tutorial

*Utvärdering och designförslag (ingen kod ändrad) för stationens två uppgifter:*
- **Doktorand-grenen** = *flykt undan krig* (packa → färdsätt → slå läger), bedöms på motivering/resonemang.
- **Metodspecialist-grenen** = Fermi-skattning *skrotbilar* (snittbils vikt → antal skrotade/år → total vikt), bedöms tvåaxligt (resonemang × träff mot facit).

Allt nedan är grundat i den faktiska koden. Riktningen speglar **Förhandlingens** live-session (läsbarhets- och tutorial-filosofi) och **Eco Locos** "lär genom att göra"-spår C (`eco-loco-mellan/design/INTRODUKTION.md` §2+§5). Minnestestet bygger på samma `station-kit`, så mönstren ska kännas som ett system.

> **Den största enskilda avvikelsen idag:** Minnestestet har **ingen testomgång och inget läges-system**. Flödet går rakt in i de tre skarpa stegen (`store/minnestestStore.ts:24-33`, faser `attract → checkin → roleSelect → vaultOut → [intro] → step → vaultBack → verdict → checkout`). `config.mode` (`src/config.ts:23`) kopplar bara in-/ur adaptrar och en "hoppa över"-knapp i analysen (`components/StepCycle.vue:237,392`) — det finns **inget blått=test / gult=skarpt**, ingen övning, och ingen steg-för-steg-uträkning av poängen. Förhandlingen har hela det systemet (`station-kit/mode/useStationMode.ts`, `station-kit/components/ModeLegend.vue`, `station-kit/theme/crt.css:14-81`, `onboarding/Onboarding.vue`, `onboarding/ResultPopups.vue`). Det är kärnan i både del 2 och del 3.

---

## 1. Läsbarhet — utvärdering + förslag

### 1.0 Gemensamma temafynd (gäller båda grenarna)

Minnestestets tema (`src/station-kit/theme/crt.css`) avviker från den läsbarhets-riktning Förhandlingen landat i. Tre strukturella problem:

> **Linjeringsregel (fonter & typskala) — spegla Förhandlingen exakt, uppfinn inget eget.** Båda stationerna delar redan fonterna (VT323 + IBM Plex Mono, samma `@import` och `--font-retro`/`--font-mono`-variabler). Minnestestet ska kopiera Förhandlingens slutgiltiga body-font, display-användning och modulära typ-/spacing-skala rakt in när dess läsbarhets-rework landar — inte bygga en parallell lösning. Förslagen nedan ÄR den riktningen (bekräftad direkt av Förhandlingens session), men ska synkas mot dess faktiska värden innan bygge. Enda medvetna avvikelsen som får finnas: Minnestestets större bas-skala (`--ui-scale: 1.5`) om monter-avståndet kräver det — och det är ett beslut för Josef.

**A. Löptext sätts i pixelfonten VT323.**
`body { font-family: var(--font-retro) }` (`crt.css:67`), och `--font-retro: 'VT323'` (`crt.css:29`). VT323 är en display-/terminalfont — oläslig i längre rader och på håll i monter. IBM Plex Mono finns redan importerad och definierad (`--font-mono`, `crt.css:30`) men används bara via `.mono`-klassen (nästan ingenstans i stationen).
→ **Förslag (speglar Förhandlingens riktning):** byt `body`-default till **Plex Mono**. Behåll **VT323 enbart** för display: rubriker, stora siffror (poäng, `NumberStepper`-readout, nedräkning), eyebrow-etiketter. All löpande copy, popup-rader, instruktioner och NPC-svar → Plex Mono. Detta är ett tema-byte på ett ställe och slår igenom båda grenarna.

**B. Global glöd på all text suddar glyferna.**
`body { text-shadow: var(--glow-soft) }` (`crt.css:70`) lägger orange glöd på *varje* tecken, och knappar har dessutom egen `text-shadow` (`crt.css:192`). Glöd på pixelfont + liten text = lägre skärpa, sämre kontrast på avstånd.
→ **Förslag:** ta bort den globala `body`-glöden. Låt glöd bara ligga på skärmens **enda fokus** (den stora frågan, den landande poängen). Stödtext och löpande rader = ingen/dämpad glöd. Behåll `.ink-strong` för vita nyckelrader men utan tung skugga.

**C. Inget läges-/färgsystem (blått vs skarpt).**
Förhandlingens `crt.css:14-81` definierar `--mode-tutorial` (blå/mint `#35e0d0`), `--mode-live` (orange `#ff9500`), och en `[data-mode='tutorial']`-regel som pekar om hela paletten. Minnestestets `crt.css` saknar detta helt — ingen `data-mode`, ingen `--mode-*`-token, och `src/App.vue` sätter ingen läges-wrapper.
→ **Förslag:** porta `useStationMode.ts`, mode-tokenen i `crt.css`, och `ModeLegend.vue` rakt in (de är skrivna transportoberoende just för att lyftas mellan X&Y-stationerna — se kommentaren i `useStationMode.ts:5-12`). Då får Minnestestet samma **blått = övning / orange = skarpt** gratis.

**D. Palett och bläckhierarki.** Minnestestet är redan nära: orange accent (`--color-primary`), vit nyckel (`--color-ink-strong`), dämpad (`--color-ink-muted`), `--color-danger` för varning (`crt.css:17-22`). Rollerna skiljs redan via **etikett/position/form** (två likvärdiga kort i `RoleSelect.vue`), inte färg — bra, behåll. Håll paletten till **bara orange (skarpt) + mint (tutorial)**; status/roll via ikon/etikett/position.

**E. Monter-skala.** `--ui-scale: 1.5` → `html { font-size: calc(16px * 1.5) }` (`crt.css:34,55`). Bra grepp för läsbarhet på håll (Förhandlingen kör bara `115%`, `crt.css:98`). Behåll — men inför en **modulär typskala + 4/8-baserad spacing** i stället för de många ad hoc-`clamp()`/`rem`-storlekarna (t.ex. `StepCycle.vue` har `clamp(1.4rem,3vw,2rem)`, `clamp(1.7rem,4vw,2.6rem)`, `clamp(1.15rem,2.2vw,1.55rem)` i tre olika vyer) så stationerna känns som ett system.

**F. Färgemoji i stället för egna ikoner.**
`sv.ts` har `🎙` i tre strängar: `'step.rule_title': '🎙 TÄNK HÖGT TILLSAMMANS'` (`sv.ts:68`), `'step.mic_active': '🎙 MIK AKTIV'` (`sv.ts:72`), `'step.talk_now': '🎙 PRATA NU'` (`sv.ts:73`). Färgemoji bryter mot den monokroma CRT-estetiken och renderas olika per OS.
→ **Förslag:** ersätt med en egen monokrom **mic-SVG** i accentfärgen (orange i skarpt, mint i test). Flaggas uttryckligen som en konkret ändring.

---

### 1.1 Doktorand-grenen (flykt) — läsbarhet

**Observationer (grundade i `sv.ts` + `StepCycle.vue`):**

- **Scen-copy är redan bra och enradig.** `'flykt.steg1.context': 'Ett krig har brutit ut och ni måste fly.'` + `'flykt.steg1.task': 'Vad tar ni med er?'` (`sv.ts:92-93`). Frågan står stor hela tiden i think-vyn (`StepCycle.vue:320-323`, `.think__task` `clamp(1.7rem,4vw,2.6rem)`). Det är exakt "en rad per scen" — behåll.

- **Situations-popupen är överlastad.** I `StepCycle.vue:289-305` staplas i *en* modal: eyebrow (`lage.title` = "DET HÄR ÄR LÄGET"), frågan igen, 2 popup-rader (`flykt.steg1.popup1/popup2`), en inramad regel-ruta med titel **och** brödtext (`step.rule_title` + `step.rule_body`), en tidsrad (`flykt.steg1.time`), och en knapp. Det är 6 textblock på en skärm — för mycket för någon som läser på håll och inte lyssnat.
  - Dessutom är regeln **dubblerad**: `'step.rule_body': 'Ni bedöms på HUR ni resonerar — inte på om svaret blir rätt.'` (`sv.ts:69`) säger samma sak som `'step.why_line': 'Säg VARFÖR ni väljer som ni gör. Det är motiveringen som räknas.'` (`sv.ts:71`), som visas igen i think-vyn.
  → **Förslag:** popupen bär **en** sak: frågan stor + EN rad situation. Flytta motiverings-regeln till tutorialen (där den lärs genom att göra, se §2) i stället för att upprepas i varje stegs popup. Trimma bort eyebrow `lage.title` efter första steget — "DET HÄR ÄR LÄGET" över varje steg bär ingen ny info (speglar Förhandlingens "trimma versal-mono-etiketter som inget betyder").

- **Döda rader.** `flykt.steg{1,2,3}.popup3` är alla `''` (`sv.ts:97,105,113`) — filtreras visserligen bort (`StepCycle.vue:50-54`) men ligger kvar som dött innehåll.

- **Nyckelinstruktionen är pytteliten.** I think-vyn visas `whyLine` som `.think__why` i `0.85rem` dämpad (`StepCycle.vue:658-664`) — den viktigaste instruktionen ("säg varför") är minst på skärmen. → gör den till en tydlig, vit stödrad (Plex Mono), inte muted mini-text.

### 1.2 Metodspecialist-grenen (fermi) — läsbarhet

**Observationer:**

- **Fermi-introt är en textvägg före all handling.** `FermiIntro.vue` visar tre staplade rader via Teletype + knapp: `fermi.intro.l1` ("Ni är metodspecialister — ni löser saker med händerna."), `l2` ("Nu vill vi veta hur ni räknar ut hur mycket alla bilar som skrotas i Sverige väger på ett år.") och `l3` ("Ni löser den i tre steg. Tänk högt — det är vägen dit som räknas.") (`sv.ts:121-124`). `l2` är en lång, inbäddad mening — svår på avstånd, och den *förklarar* uppgiften i stället för att låta dem *göra* den.
  → **Förslag:** ersätt väggen med coach-marks på det riktiga UI:t + en testomgång (se §2). Behåll bara den korta kärnan; dela upp `l2` i kort rad + den stora frågan som redan står i steg 1 (`'fermi.steg1.task': 'Hur mycket väger en helt vanlig bil?'`, `sv.ts:140`).

- **Gissnings-popupen läser bra men har en skav-formulering.** `'guess.sub': 'Ställ in ert tal. Det viktiga var hur ni tänkte.'` (`sv.ts:129`) — imperfekt "var" mitt i ett pågående moment. → "Det viktiga är hur ni tänker." `NumberStepper`-readouten är tydlig: stor VT323-siffra med tabular-nums + svensk tusentalsavgränsning (`NumberStepper.vue:32,158-164`) — det är rätt användning av display-fonten. Enhetsetiketterna är konkreta (`unit.antal: 'bilar/år'`, `sv.ts:135`).

- **Stegens copy är bra och takt-stödjande.** `fermi.steg2.popup3: '(Sverige har drygt 10 miljoner invånare.)'` (`sv.ts:152`) ger premissen utan att räkna åt dem — behåll, men höj från parentes-viskning till en tydlig stödrad.

- **Samma glöd/font/emoji-problem** som §1.0 gäller här (think-vyn delas av båda grenar i `StepCycle.vue`).

---

## 2. Tutorial/intro — slimmad "lär genom att göra"

**Principer (från Förhandlingens ombyggnad + Eco Locos spår C):**
(a) tutorialen **ÄR det riktiga UI:t** med coach-mark/spotlight som dimmar allt utom aktuellt element + kort bubbla + klick-igenom — inte separata instruktionsbilder eller `FermiIntro`-väggen;
(b) en **testomgång (blått)** där de svarar och sedan ser en **riktig uträkning av utfallet steg-för-steg** — de SER poängsättningen hända, inte bara hör den i förväg;
(c) **samma steg-för-steg-reveal körs även efter skarpt läge** (orange);
(d) bara **ETT** videoklipp kvar, allt annat intro utgår;
(e) **blått = test, orange = skarpt** genom hela.

Bygg-grund (gemensam): porta `useStationMode.ts` + mode-tokenen i `crt.css` + `ModeLegend.vue` från Förhandlingen. Lägg en `data-mode`-wrapper i `App.vue`. Lägg till faser i storet: `tutorial → test → testReveal` före `step`, och återanvänd reveal-vyn efter `vaultBack`. Coach-mark = ett overlay-lager (dimma + hål + bubbla) ovanpå `StepCycle`-grund-UI:t, som tonas ut på samma klick spelet redan lyssnar på (Eco Loco §7).

Förhandlingen har redan copy-strängarna att spegla: `'mode.legend_tutorial': 'När skärmen är BLÅ övar vi'`, `'mode.legend_live': 'När den blir skarp kör vi på riktigt'`, `'mode.testomgang': 'TESTOMGÅNG'`, `'mode.practice_sub': 'Vi övar — inga poäng räknas än'`, `'mode.golive_title': 'NU KÖR VI PÅ RIKTIGT'` (`forhandlingen/.../station-kit/i18n/sv.ts:22-26`).

### 2.1 Doktorand-grenen (flykt) — skärm för skärm

| # | Skärm | Läge | Highlight / handling | Copy |
|---|---|---|---|---|
| 1 | **Läges-legend** | — | `ModeLegend` (blått vs orange swatch) | "När skärmen är **BLÅ** övar vi. När den blir **ORANGE** kör vi på riktigt." |
| 2 | **Coach-mark: frågan** | blått | Grund-UI (think-vyn) syns; dimma allt utom den stora `.think__task`. Klick-igenom. | "Frågan står alltid här. Stor." |
| 3 | **Coach-mark: prata + varför** | blått | Highlighta mic-indikatorn (egen SVG) + why-raden. | "Prata högt. **Säg VARFÖR** — det är motiveringen som räknas." (flyttas hit från stegens popup, `sv.ts:69/71`) |
| 4 | **Coach-mark: timer + klar-knapp** | blått | Highlighta `.think__timer` och "VI ÄR KLARA ▸". | "En minut. Klara tidigare? Tryck **VI ÄR KLARA**." |
| 5 | **(valfritt) ETT klipp** | blått | Enda videon: 10 s "så här låter en bra motivering". | — |
| 6 | **Testomgång** | blått | En neutral övnings-fråga på det riktiga think-UI:t (inte en av de 3 skarpa) — de pratar, ENHETEN väger. | "Övning: *Vad tar ni med er på en lång vandring?*" |
| 7 | **Reveal steg-för-steg** | blått | Reveal-vy (spegla `ResultPopups`): (a) band, (b) motiverings-grind, (c) poäng tickar fram. | Se §3-mönstret. "Ni motiverade → det lyfter er till **Stark**." |
| 8 | **Go-live** | → orange | `mode.golive_title`; färgen växlar synligt. | "NU KÖR VI PÅ RIKTIGT." |
| 9–11 | **Steg 1–3 skarpt** | orange | Nuvarande flöde, men popupen bär bara frågan + 1 rad (se §1.1). | Scen-copy som idag (`sv.ts:92-113`). |
| 12 | **Mönstringsutlåtande** | orange | `VerdictScreen`: visa **per-steg-nedbrytningen** (band + motiverat → poäng per steg), inte bara slutsiffran via `RisingScale`. | "Steg 1 Stark, Steg 2 Godkänd … = X/10." |

### 2.2 Metodspecialist-grenen (fermi) — skärm för skärm

Ersätter hela `FermiIntro.vue`-väggen.

| # | Skärm | Läge | Highlight / handling | Copy |
|---|---|---|---|---|
| 1 | **Läges-legend** | — | `ModeLegend` | som 2.1. |
| 2 | **Coach-mark: frågan** | blått | Grund-UI; dimma allt utom `.think__task`. | "Frågan står alltid här." |
| 3 | **Coach-mark: tänk högt + hur** | blått | mic-SVG + how-raden (`step.how_line`: "Säg hur ni räknar. Vägen dit räknas.", `sv.ts:117`). | "Säg **HUR** ni räknar — inte bara en siffra." |
| 4 | **Coach-mark: sätt gissningen** | blått | Highlighta `NumberStepper` (−/+) och "LÅS IN". Klick-igenom (de får prova att skruva talet). | "Ställ in ert tal. Håll in − eller + för att bläddra." (`sv.ts:131`) |
| 5 | **Testomgång** | blått | En enklare övnings-Fermi på riktiga UI:t (t.ex. *"Hur många fönster i den här byggnaden?"*): prata + lås en gissning. | "Övning — inga poäng räknas än." (`mode.practice_sub`) |
| 6 | **Reveal steg-för-steg** | blått | Reveal som översätter Fermi-logiken (se §3): (a) resonemangsband, (b) träff mot facit (prick/tiopotens/utanför), (c) delpoäng ur matrisen, animerad räknare à la `ResultPopups`. | "Ni landade i spannet (**prick**) + **Stark** resonemang → **8 poäng**." |
| 7 | **Go-live** | → orange | `mode.golive_title`. | "NU KÖR VI PÅ RIKTIGT." |
| 8–10 | **Steg 1–3 skarpt** | orange | Nuvarande steg-cykel med gissnings-popup. | `sv.ts:139-160`. |
| 11 | **Utlåtande + facit** | orange | `VerdictScreen` med per-steg-nedbrytning + `facit`-payoff ("~250 000 ton", `fermi-skrotbilar.json:66`). | "Så nära kom ni — men det var TÄNKANDET vi vägde." |

**Nyckelinsikt för båda grenar:** idag får grupperna höra regeln i förväg (popup/intro) men ser aldrig poängen *räknas*. Testomgångens reveal gör poängsättningen begriplig **innan** det räknas skarpt — och samma reveal upprepas skarpt, så de ser utfallet "på riktigt" precis som Förhandlingen gör i `ResultPopups.vue` (säkrad → kvarvarande kapital → ×2).

---

## 3. Konkret textexempel — en testomgång från svar till poäng

**Vald: metodspecialist, steg 1 ("hur mycket väger en vanlig bil").**

**(a) Frågan som den står** (`sv.ts:139-141`):
> *Börja med en enda bil.*
> **Hur mycket väger en helt vanlig bil?**
> *Ni har en minut. Säg hur ni tänker — inte bara en siffra.*

**(b) Exempel-svar en grupp kan ge (tänk-högt-transkript):**
> "Vi åkte hit i en vanlig Volvo, en sån väger väl typ ett och ett halvt ton? Vi säger **1500 kg**. Fast en bil som skrotas är ju oftast gammal, så kanske lite mindre."

Gruppen skruvar `NumberStepper` till **1 500 kg** och trycker LÅS IN (`StepCycle.vue:194`, `guess { step:10, min:100, max:5000, start:1000 }`, `config.ts:140-141`).

**(c) ENHETENs bedömnings-text** (i stationens ton, grundad i `instructions/fermi-skrotbilar.sv.txt` §svar_text — 1–2 korta meningar, kvittera HUR de tänkte, villkorlig lucka):
> **ENHETEN //** "Ni ankrade i en bil ni faktiskt känner och rundade till ett tal — så gör man. Och ni såg själva att en skrotbil är äldre och lättare. Starkt."

Modellen sätter här `resonemang_niva: "Stark"` (ankrar i referens **och** nyanserar snittet — nära Exceptionell, men utan uttalad avgränsning person-/lastbil, jfr nivå-matrisen i instruktionen rad 8-12) och dimensionen `dekomposition`/`antaganden: true`.

**(d) Poäng-genomgången (det testomgången VISAR, steg för steg):**

1. **Resonemangsband** (modellen): *Stark.* → "Ni ankrade + nyanserade."
2. **Träff mot facit** (koden, inte modellen — `instructions` rad 3 "koden gör det"): referens 1500, `prick: [1200,1800]` (`fermi-skrotbilar.json:39`). 1 500 ligger i spannet → **prick**. → "Ni landade mitt i spannet."
3. **Delpoäng** ur matrisen (`fermi-skrotbilar.json:43-48`): `Stark × prick = 8`. Räknaren tickar upp till **8** (spegla `ResultPopups`-animeringen, `ResultPopups.vue:37-66`).

> **Reveal-copy:** "Ni fick **8 poäng** för steg 1 — för att ni resonerade **Stark** *och* ert tal (1 500 kg) landade mitt i spannet (**prick**). Hade ni bara kastat ur er en siffra utan att säga hur ni tänkte, hade samma träff gett **6** (Godkänd)."

Detta gör den tvåaxliga logiken synlig: **resonemang (modellen) × träff (koden) → poäng (matris)**. Slutpoängen väger ihop de tre stegen med röd-tråd-bonus (`final.rodTradBonus: 1`, clamp 1–10, `fermi-skrotbilar.json:49-50`) och landar på profil + facit i `VerdictScreen`.

*(Doktorand-motsvarigheten, för referens:* band + motiverings-grind → poäng. T.ex. steg 1 "Vad tar ni med er?": sa de pass/vatten/värme **med** varför → `band: Stark`, `motiverat: true` → `bandPoints.Stark = 3` (`flykt.json:98-101`). Utan "varför" cappas de på Godkänd = 2 (grind-regeln, `instructions/flykt.sv.txt:8-10`). +1 bonus om ≥2 steg starka (`flykt.json:103-106`). Visas med samma steg-för-steg-reveal.)*

---

## 4. Sammanfattning

1. **Störst hävstång: lägg till läges-systemet + en testomgång.** Minnestestet saknar idag båda helt; Förhandlingen har dem byggda och transportoberoende (`useStationMode.ts`, `ModeLegend.vue`, `crt.css` mode-tokens, `ResultPopups.vue`) — porta rakt in. Blått = övar, orange = skarpt.

2. **Gör poängsättningen *synlig*, inte bara hörd.** Båda grenar förklarar regeln i förväg men visar aldrig poängen räknas. En steg-för-steg-reveal efter testomgången (och igen skarpt) gör bedömningen begriplig: doktorand = *band + motivering → poäng*; metodspecialist = *resonemang × träff mot facit → poäng*.

3. **Tutorialen ska vara det riktiga UI:t med coach-marks** — inte `FermiIntro`-väggen (`FermiIntro.vue`, `sv.ts:121-124`) eller den överlastade situations-popupen (`StepCycle.vue:289-305`). En handling i taget, igenkänning > minne, bara ett videoklipp kvar.

4. **Läsbarhet är ett tema-byte på ett ställe:** `body` → Plex Mono (VT323 bara display), bort med global `body`-glöd (`crt.css:67,70`), glöd bara på skärmens enda fokus, och egen monokrom mic-SVG i stället för `🎙`-emoji (`sv.ts:68,72,73`). Slår igenom båda grenar samtidigt.

5. **Det som förenar grenarna:** samma motor (`StepCycle.vue`), samma tre-stegs-takt, samma skala (`SCALE_MARKS`), samma "fråga stor hela tiden", och samma ENHETEN-ton. Alla läsbarhets- och tutorial-grepp ska därför byggas i den delade motorn/temat, inte per gren.

6. **Det som skiljer:** doktoranden har en **motiverings-grind** (en axel: band, capad utan "varför"); metodspecialisten är **tvåaxlig** (resonemangsband × numerisk träff mot facit, med gissnings-steppern och facit-payoff). Reveal-vyn måste alltså ha två varianter — men samma visuella mönster och samma animerade räknare.

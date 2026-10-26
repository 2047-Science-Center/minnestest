# Ombyggnads-granskning — nuvarande app vs ny riktning

Kritisk genomlysning av varje ruta man klickar igenom idag, speglat mot den nya riktningen:
**två sidor** — (1) "ÄR DU MÄNNISKA?"-människotest (roll *säkerhetsansvarig*) och (2) **LÖGNDETEKTOR**
(3 deltagare, förtroendemätare, R1-scenarier). Underlag för kommande bygg-spec. Inget byggt.

**Nuvarande fas-kedja:** `attract → checkin (BippStart) → roleSelect → branchIntro → pilotIntro →
step (StepCycle) → [practiceReveal | goLive] → step → verdict → checkout`.
**StepCycle-substeg idag:** `situation → countdown → answer (mik/slider/ja-nej) → handoff → reason (mik)
→ vager (ENHETEN VÄGER + riser) → gate (poäng mot tröskel, PASS/FAIL)`.

---

## 1. BEHÅLL — återanvänds rakt av (med mappning)

| Komponent / system | Mappar till nya |
|---|---|
| `AttractScreen` (STATION 2 / X&Y) | Oförändrad. |
| `BranchIntro` + attract-video + STARTA | **Återanvänds för de två sidorna** (människotest vs lögndetektor) i stället för FLYKTEN/TANKETESTET. Byt titlar/klipp. |
| `ThresholdMeter.vue` | **→ FÖRTROENDEMÄTAREN.** Bar 0–100 finns redan; byt den enda tröskelmarkören mot **tre zoner** (0–30/30–65/65–100) och driv den på ett 1–10-värde (precis som Josef sa). Rörelse-/laddningsanimationen återanvänds. |
| `StepCycle` "situation" (full-bleed scen + stagger-text + "klicka när ni är redo") | **Scenario-introt per runda** (seed stort, stagger). Behålls i princip helt. |
| countdown-substeget (`countdownN`, "startar om…") | **Rundstart-countdown + 5 s mellan deltagare.** Samma mekanik, två användningar. |
| Mik-blocket (`useSpeechCapture`, 20 s-fönster, timer, manuell fallback) | **Per-deltagares 20 s-tal.** Återanvänds — men EN tagning per deltagare (inte svar+motiv). Transkript-only-pipelinen är redan precis det nya regelverket kräver. |
| "ENHETEN VÄGER" (`vager`) + riser → `gate`-reveal + mätar-animation | **"VALDI FUNDERAR" + reveal.** Spännings-risern och mätar-landningen återanvänds nästan rakt av. |
| Scen-system: `SCENE`-map → `public/video/*.mp4` + poster + `public/Sound/ambience/*.mp3` via `audio.bed` | **Per-scenario-scen** (varje R1-/människotest-scen får egen video + ljudbild). Exakt det Josef bygger assets för nu. |
| `/assess`-gateway (`server/index.js`, `HttpAssess`, gpt-5-mini, `/speak` ElevenLabs) | Behålls. Byt `configs/*.json` + `instructions/*` till nya regelverket. |
| `ModeCountdown` ("NU PÅ RIKTIGT") | Övning → skarpt-övergång. |
| `NpcReply` (Teletype, uppläst) | **VALDIs vägande utlåtande** (uppläst). |
| `FacilitatorControls` + `PauseOverlay` | Oförändrat. |
| crt-tema, touch-fixar (contextmenu av, `touch-action`), kiosk/deploy (`deploy/nuc/`, build:kiosk) | Oförändrat — infrastrukturen bär över. |

## 2. TA BORT / ERSÄTT — hör till gamla upplägget

- **`Slider.vue` + `NumberStepper.vue`** (fermi sifferval) → bort. Ingen sifferskattning.
- **Fermi ja/nej-`choice`** → bort.
- **Tvåblocks svar→motivering** (`answer → handoff → reason`) → **ersätt med ETT tal-block per deltagare**
  (en tagning, 20 s). `handoff`-substeget (svar klart → motivera) blir överflödigt här.
- **Gatad stigande-tröskel-scoring** (`config.LEVEL_THRESHOLDS`, `thresholdForLevel`, `resolveGate`
  PASS/FAIL per nivå, "NIVÅ X KLARAD") → **ersätt med förtroende-rörelse** (delta per runda, förlust ≤30).
- **Nuvarande scenarier/configs** (`EXAMPLES`/`PRACTICE` flykt+fermi, `configs/flykt*.json`,
  `fermi-skrotbilar.json`, deras `instructions/*`, `rubrik`/`guess`-fälten) → ersätt med R1- +
  människotest-scenarier + nytt regelverk.
- **Roll-FORK** (metodspecialist→fermi / doktorand→flykt) + metodspecialist/doktorand-i18n → bort.
  `RoleSelect` repurposas (eller ersätts) — se OSÄKERT.
- **`ResultWalkthrough` som "NIVÅ X/5"-uppräkning** → ersätt med **gemensam reveal** (per-spelare ✓/✗)
  + förtroende-zon-utfall.
- Scoring-lib för gaten (`gate`-poäng/stege) → ersätt med `overtygande`-scorer (0–10) som driver mätaren.

## 3. ÖVERFLÖDIGT i det nya

- **`PilotIntro`** (blått=övning / orange=skarpt): övningsrundan finns kvar, men "pilot/skarpt"-
  förklaringen känns överflödig/förvirrande i lögndetektor-ramen. Ersätt ev. med en kort
  "det här är en övning"-ruta. (Beslut.)
- **`StatusBar.vue`**: redan borttagen ur chrome — filen verkar oanvänd, kan raderas.
- **`mode` test/live-temat (blått/bärnsten)**: övningsläge behövs, men om båda sidorna har egen
  identitet kan blått/bärnsten behöva tänkas om snarare än återanvändas rakt av.
- Död i18n/EXAMPLES för flykt/fermi.

## 4. OSÄKERT — behöver riktning

- **Hur de två sidorna samexisterar.** Är människotest och lögndetektor två spel man väljer i
  `BranchIntro`? Delar de motor? Spec finns bara för lögndetektorn; **människotestets flöde/mekanik
  är inte specificerat** (samma 3-deltagar-turordning? samma förtroendemätare? annan reveal?).
- **`mode`/övnings-tema** — behålla blått=övning, eller ny visuell kodning per sida?
- **Incheckning/bippa band** — kvar (krävs för namngivna deltagare "Alma kliver fram…") eller bort?
- **Puls-plattan** (lögndetektorns fysiska mock) finns inte i koden — ny; MQTT-stub senare.

## 5. SAKNAS — måste beslutas/byggas (störst arbete)

1. **3-deltagar-turordning.** Nuvarande flöde = EN grupp som svarar tillsammans (ett transkript per
   steg). Nytt kräver **per-deltagar-delrundor** (P1→P2→P3), var sin 20 s-tagning, eget transkript +
   egen bedömning. Nytt store-state: `participants[]`, aktiv deltagar-index, per-deltagare
   transkript/assessment. **Finns inte idag.**
2. **Pipelinade `/assess`-anrop.** Idag `await`:as bedömningen sekventiellt och blockande (ett per
   steg). Nytt: skicka per deltagare direkt när hen är klar (medan nästa pratar) + ett
   **sammanvägnings-anrop**. Nytt mönster i `HttpAssess`/store.
3. **Per-spelare ✓/✗-reveal + gemensamt vägande utlåtande** (ny reveal-komponent; ersätter Verdict/
   ResultWalkthrough).
4. **Namngivna deltagare** (`names[]` från incheckning) med fallback "Deltagare N".
5. **Övningsrunda** för det nya formatet (neutralt scenario, mätaren nollställs innan skarpt).
6. **Människotest-sidans flöde-spec** saknas helt (bara frågedokument v1–v5 finns) — behövs parallellt
   med lögndetektorns, + beslut om den delar motor/mätare eller ej.
7. **Resultat-söm / checkout.** Vad är "resultatet" nu (nådd zon / överlevda rundor)? `sendResult`
   behöver ny innebörd, eller stängas av som idag.
8. **Scen-assets per nytt scenario** (video + ljudbild + ev. puls-platta) — genereras separat.

---

## Viktigaste beslutspunkterna (för bygg-spec)
1. **Är båda sidorna samma motor** (3-deltagar-turordning + förtroendemätare + reveal), bara olika
   scenarier/regelverk? Om ja → ett stort motorbygge täcker båda. Om nej → två separata flöden.
2. **Turordnings-motorn** (participants + pipelinad /assess + gemensam reveal) är det tunga nya —
   allt annat är ombyggnad av befintligt.
3. **Incheckning/namn kvar?** avgör om BippStart behålls.
4. Bekräfta **mätaren = ett bakgrunds-1–10-värde som driver tre zoner** (ThresholdMeter ombyggd).

# Människotestet — flödes-, UI- & mekanikspec (FÖRSLAG, inget byggt)

Rollen: **säkerhetsansvarig**. Delar UPPBYGGNAD och känsla med lögndetektorn
(`docs/logndetektor-flode-spec.md`) — **men det är TVÅ SEPARATA webbappar på TVÅ datorer**, inte en
gemensam motor. Scenario-frågorna: `docs/manniskotest-fragor-v5-14ar.md`. Scen-/rums-assets:
`docs/manniskotest-scen-assets.md`. Rensning mot nuvarande bygge: se avsnitt H + `ombyggnad-granskning.md`.

---

## A) Ram & story
Cybersäkerhet blir allt viktigare. Bland Valvets mest skyddade uppgifter finns ett test som
kontrollerar att **bara människor** kan komma in — systemet får inte kunna hackas av en AI. **Valdi**
ställer er inför situationer utan facit; en robot svarar platt och regelstyrt, en människa förstår
andra, väger flera sidor och ser det osagda. Ni tar er genom **5 gatade valvrum i en serie** — varje
rum ser olika ut (egen färg + nummer/skylt) så man efteråt kan säga *"vi kom till det gula rummet."*

Intro-copy (ej exakta ord):
> "Valvets innersta släpper bara in människor — det går inte att hacka. Valdi ställer er inför
> situationer utan rätt svar. Det är i HUR ni resonerar — om ni förstår andra människor — som Valdi
> avgör om ni är människor … eller robotar. Fem rum. Fem dörrar. Hur långt når ni?"

---

## B) Flöde — varje klickruta, början → slut

1. **Attract/entré** (`AttractScreen`, STATION 2 / X&Y). Klick → vidare.
2. **Gren-intro** (`BranchIntro`): titel **"MÄNNISKOTESTET"** (alt. "ÄR DU MÄNNISKA?") + loopande
   attract-video + **STARTA**.
3. **Intro-ruta** (ramen ovan, stagger-text bit för bit) + "Klicka när ni är redo".
4. **ÖVNING / TEST-scenario** (ett neutralt scenario så de fattar mekaniken):
   - Scenario-ruta → **3 deltagare en i taget** (20–30 s var) → **VALDI ÖVERVÄGER** → kort reveal.
   - Tydligt att **det inte räknas**; mätaren **nollställs** innan skarpt.
   - → **ModeCountdown** ("NU GÄLLER DET" / "IN I VALVET") → första valvrummet.
5. **Per valvrum (gate 1–5), steg för steg:**
   a. **Man står i valvrummet** — rummets bakgrund (egen färg + nummer/skylt) fyller skärmen.
   b. **Scenario-rutan kommer upp** ovanpå rummet: loopande **scen-videoklipp** + **ljudbild** +
      **dilemma-texten** som dyker upp **bit för bit (stagger)**, och avslutas tydligt med den **öppna
      frågan**: *"Vem har rätt här?"* / *"Vad skulle du göra — och varför?"* (inget facit).
   c. **"Klicka när ni är redo"** → **countdown 5 s** (samma mekanik som idag).
   d. **Deltagare 1** — "Säg vad du tänker" · **20–30 s** (de får veta tiden FÖRE). → **5 s countdown**
      → **Deltagare 2** → 5 s → **Deltagare 3**. Alla svarar på SAMMA scenario; **att upprepa/bygga på
      vad en annan sagt är OK**. Varje deltagares svar skickas till **/assess direkt när hen är klar**
      (pipelinat — se D).
   e. **Scenario-rutan försvinner** → man ser **PORTEN/dörren man står framför** (rummets dörr, stängd).
   f. **"VALDI ÖVERVÄGER"** — en **processar-overlay i/vid porten** (symboler/ljus som arbetar på
      själva dörren, så man känner att man står framför den). Väntar i praktiken bara in **sista**
      svaret (de två första redan bearbetade) + ev. ett kort **sammanvägnings-anrop**.
   g. **Sammanvägd bedömning:**
      - **Per-spelare ✓/✗** presenteras ihop, en i taget med pling ("Spelare 1 … ✓", "Spelare 3 … ✗").
      - **Förtroendemätaren** rör sig **en gång** på gruppens sammanvägda resultat (se E).
      - **VALDIs vägande utlåtande** som **stagger-text** (2–3 meningar, lyfter något var person sa,
        väger båda håll, landar). **INGEN uppläsning nu** — bara text (röst ev. senare).
   h. **Dörren avgör:**
      - **Över förlust-tröskeln → dörren ÖPPNAS** (access granted, grönt ljus, "VÄLKOMNA IN") →
        **nästa valvrum** (ny färg).
      - **Mätaren ≤ 30 → ACCESS DENIED** (rött larm, dörren förblir stängd) → **slut**.
6. **Slut / checkout:** "Ni nådde **rum X** (det [färg] rummet)" + slutläge (zon): HÖGT FÖRTROENDE →
   "Välkomna in i Valvet" (belöning); TVEKSAM → "nätt och jämnt mänskliga"; förlust → "Valdi dömde er
   som robotar — porten förblev stängd." Facilitator kan starta om.

---

## C) Deltagare
**Tre deltagare, en i taget** (samma som lögndetektorn). Generiskt **"Deltagare 1/2/3"**; bygg så
**namn kan slås på** senare (från incheckning) → "Alma kliver fram…". `names?: string[]` med fallback
"Deltagare N". Nytt store-state: `participants[]`, aktiv index, per-deltagare transkript + assessment.

## D) GPT-pipelining (som Utmana experten / lögndetektorn)
- Deltagare 1 klar → skicka `/assess` direkt (medan 2 pratar); Deltagare 2 klar → skicka (medan 3
  pratar); Deltagare 3 klar → skicka.
- **"VALDI ÖVERVÄGER"** väntar bara in det sista → kort upplevd väntan. Plus ett kort
  **sammanvägnings-anrop** som väver ihop de tre till ett gemensamt utlåtande (beslut: eget anrop vs
  lokal sammanvävning).

## E) Förtroendemätaren (ThresholdMeter ombyggd — identisk modell som lögndetektorn)
Horisontell bar 0–100, **synlig hela tiden**, **en mätare för gruppen**, LED-list-vänlig. Driven av
en **dold 0–10 per deltagares svar** (`overtygande` = "hur mänskligt resonemanget var"); deltagarna
ser aldrig siffran, bara nålen.
```
|■■ INGET FÖRTROENDE ■■|□□ TVEKSAM □□|▓▓ HÖGT FÖRTROENDE ▓▓|
0        (förlust) 30        65        100     ▲ start = 50
```
- Rundans sammanvägda = **medel av de tre** dolda poängen. Nålrörelse = `(medel − par) × k`
  (förslag par ≈ 5,5, `k ≈ 5`; **stigande par** på senare rum → svårare att hålla ställningen).
- **Per-spelare ✓/✗** ur varje deltagares EGNA dolda poäng (≥ 5,5 = ✓); **mätaren rör sig bara på
  medlet** — gruppen åker tillsammans.
- **Start 50** (skarpt; övningen räknas ej). **Förlust ≤ 30** efter en runda → ACCESS DENIED direkt.
  **Överlev alla 5** → slutzon avgör finalen. En runda = ett rum (1→5), stigande svårighet.

## F) De 5 valvrummen (visuell identitet så man kan namnge rummet)
| Gate | Rum (färg) | Scenario (v5) | Bas-namn scen | Bas-namn rum |
|---|---|---|---|---|
| 1 | **Blått** | Badplatsen (sinnligt, generöst insteg) | `mt_1_badplats` | `valv_1_bla` |
| 2 | **Bärnsten** | Dela pizzan (rättvisa & social takt) | `mt_3_pizza` | `valv_2_barnsten` |
| 3 | **Grönt** | Kompisens nya kär + hånglet (lojalitet vs ärlighet) | `mt_2_fest` | `valv_3_gron` |
| 4 | **Rött** | Kompisen som passar syskon (familjeplikt vs eget liv) | `mt_4_smasyskon` | `valv_4_rod` |
| 5 | **Guld** | Tysta minuten (döma utan att veta — perspektivvändning) | `mt_5_aula` | `valv_5_guld` |

(Rummets färg driver också UI-accenten i det rummet. Rumsnamnet läggs som **skarp UI-text** ovanpå —
förlita er inte på text i bilden.)

## G) Copy-förslag (svenska, ej exakta ord)
- **Titel:** "MÄNNISKOTESTET" / "ÄR DU MÄNNISKA?".
- **Övning:** "Först en övning — inget räknas. Ni får en situation, turas om att resonera, 20–30 s var."
- **Tid-förvarning (före mik):** "Du får **25 sekunder** att säga hur du tänker. Det finns inget rätt
  svar — berätta hur du resonerar."
- **Countdown (rundstart):** "Dörren förbereds …" · **(mellan deltagare):** "Nästa på tur om …"
- **Per-deltagare:** "**Deltagare 2** — vad tänker du? Vem har rätt?"
- **Öppen fråga (slutet på varje scenario):** "Vem har rätt här?" / "Vad skulle du göra — och varför?"
- **Valdi överväger:** "Valdi väger ert resonemang …"
- **Reveal-pling:** ✓ "Spelare 1 — mänskligt." / ✗ "Spelare 3 — där lät det som en regelmotor."
- **Access granted:** "MÄNSKLIGT NOG — porten öppnas." · **Denied:** "ACCESS DENIED — Valdi är inte
  övertygad."
- **Utlåtande-ton:** torr, vägande, lite komisk — citerar tillbaka, väger båda håll, landar.

## H) VAD SOM RENSAS från nuvarande bygge (mot `ombyggnad-granskning.md`)
- **`Slider.vue` + `NumberStepper.vue`** (fermi sifferval) → bort.
- **Fermi ja/nej-`choice`** → bort.
- **Tvåblocks svar→motivering** (`answer → handoff → reason`) → **ett tal-block per deltagare** (en
  tagning, 20–30 s). `handoff`-substeget bort.
- **Gatad stigande-tröskel-scoring** (`LEVEL_THRESHOLDS`, `thresholdForLevel`, `resolveGate`,
  "NIVÅ X KLARAD" PASS/FAIL) → **förtroende-rörelse** (delta per runda, förlust ≤ 30).
- **Flykt/fermi-scenarier & configs** (`EXAMPLES`/`PRACTICE`, `configs/flykt*.json`,
  `fermi-skrotbilar.json`, deras `instructions/*`, `rubrik`/`guess`) → **människotest-scenarier + nytt
  regelverk** (`overtygande` 0–10).
- **Roll-FORK** (metodspecialist→fermi / doktorand→flykt) + den i18n:en → bort. `RoleSelect` repurposas
  (välj sida) eller ersätts.
- **`ResultWalkthrough` "NIVÅ X/5"** → **gemensam reveal** (per-spelare ✓/✗ + zon-utfall + utlåtande).
- **Manusröster** (VOICE_LINE/`public/Sound/voice/*` — redan borttagna) → förblir borta (ingen
  uppläsning nu).
- **`PilotIntro` (blått=övning/orange=skarpt)** → ev. ersätt med kort "det här är en övning"-ruta
  (beslut). **`StatusBar.vue`** (oanvänd) → kan raderas. **Död flykt/fermi-i18n** → bort.

**Behålls/återanvänds:** AttractScreen, BranchIntro + attract-video, situations-scenen (full-bleed +
stagger), countdown-mekaniken, mik-blocket (`useSpeechCapture`, 20 s, manuell fallback),
"ENHETEN VÄGER"→"VALDI ÖVERVÄGER" + riser + mätar-landning, scen-systemet (`SCENE`→video+poster+
`audio.bed`), `/assess`-gatewayn (byt configs/instructions), ThresholdMeter→förtroendemätaren,
crt-tema, touch-fix, kiosk/deploy.

---

## I) Öppna frågor / beslut för Josef
1. **Titel:** "MÄNNISKOTESTET" eller "ÄR DU MÄNNISKA?" (eller annat)?
2. **Reveal-plats:** overlay **på själva dörren** (så man står framför porten) — bekräfta, eller vill
   du ha en separat "Valdi överväger"-helskärm som i lögndetektorn och porten FÖRST vid utfallet?
3. **Tid per deltagare:** 20, 25 eller 30 s? (Förslag 25.)
4. **Förlust mitt i:** åka ut direkt i röd zon (dramatiskt) eller alltid spela klart alla 5 och få
   slutläge? (Förslag: ut direkt.)
5. **Rums-färgordning:** blå→bärnsten→grön→röd→guld ok, eller annan koppling färg↔scenario?
6. **Sammanvägnings-anrop:** eget litet GPT-anrop för det gemensamma utlåtandet, eller väva ihop
   lokalt? (Eget = rikare, en extra kostnad/runda.)
7. **Övningsscenario:** vilket neutralt dilemma? (Förslag: ett lätt vardags-"vem har rätt" utan laddning.)
8. **Incheckning/namn:** kvar (named deltagare) eller generiskt "Deltagare N" nu?
9. **`k`, par och stigande ribba:** godkänn start 50 / förlust ≤ 30 / `k ≈ 5` / stigande par, så tunas
   känslan i test.

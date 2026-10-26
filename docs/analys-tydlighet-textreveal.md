# Minnestestet / FLYKTEN — analys: tydlighet, stor centrerad fokustext & framväxande text

*Ren analys, ingen kod ändrad. Fokus: läsbarhet och tydlighet på håll i monter.*
*Bygger vidare på [`utvardering-lasbarhet-tutorial.md`](utvardering-lasbarhet-tutorial.md) — upprepar inte läges-/tutorial-systemet (det är nu delvis byggt: `store/minnestestStore.ts` har `mode`, faser `tutorial`/`practiceReveal`, `CoachIntro.vue`, `ResultWalkthrough.vue`). Här går jag djupare på tre saker Josef pekat ut: **texten är för liten**, **varje ruta ska ha en stor centrerad fokustext**, och **text ska gärna växa fram**.*

Linsen genom hela analysen är Emil Kowalskis princip att **de osynliga detaljerna adderas ihop** ("a thousand barely audible voices all singing in tune") — men lika viktigt: **varje skärm måste ha EN tydlig fokus**. Idag sjunger Minnestestets röster inte i stämma — flera textblock glöder lika starkt, den viktigaste raden är minst, och fokustexten är ofta vänsterställd och delar rad med annat.

> **Ramen (hålls strikt):** inga förslag om omordning av rutor/skärmar, ingen ny grafisk stil, och tutorial-rundan rörs inte (görs om separat). Allt nedan = läsbarhet/tydlighet.

---

## 1. Nuläge per skärm (läsbarhet/tydlighet)

Grundfakta om skalan först, för att storlekarna nedan ska gå att läsa rätt:
`html { font-size: calc(16px * var(--ui-scale)) }` med `--ui-scale: 1.5` (`src/station-kit/theme/crt.css:38,59`) → **1rem ≈ 24px**. Men `clamp(…, Nvw, …)`-mellanleden skalar INTE med `--ui-scale` (vw följer skärmen, inte rem-basen), så många storlekar är i praktiken fästa vid sitt lägre rem-tak. Det gör att de "stora" fokustexterna i verkligheten ofta landar på sitt `clamp()`-golv, medan stödtexten (ren `rem`) växer med skalan — hierarkin plattas ut.

Två tematiska problem gäller ALLA rutor (grundat i `crt.css`):

- **A. Löptext sätts i pixelfonten VT323.** `body { font-family: var(--font-retro) }` (`crt.css:71`) och `--font-retro: 'VT323'` (`crt.css:29`). VT323 är en display-/terminalfont — glyferna "kokar ihop" i längre rader och tappar skärpa på avstånd. IBM Plex Mono finns redan importerad (`crt.css:11,30`) men används nästan bara via `.mono`. Detta är den enskilt största läsbarhetsbromsen och gäller varenda ruta.
- **B. Global glöd på varje tecken.** `body { text-shadow: var(--glow-soft) }` (`crt.css:73`) lägger orange halo på *all* text. Glöd + pixelfont + liten grad = suddigare kanter och sämre kontrast. Glöd ska vara en **utpekare** ("här är fokus"), inte en bakgrundston på allt — när allt glöder pekar inget ut.

### attract (`station-kit/components/AttractScreen.vue`)
Bäst i klassen. `attract__title` = `clamp(3rem, 10vw, 7rem)`, centrerad (`.attract { align-items/justify-content: center; text-align: center }`), taglinjen växer fram via `Teletype` (`AttractScreen.vue` rad 33–37). En stor centrerad fokustext + en framväxande rad — **exakt mönstret de andra rutorna ska efterlikna.** Enda anmärkning: titeln glöder, men det gör också allt annat på skärmen (A/B).

### checkin / bipp (`station-kit/components/BippStart.vue`)
Centrerad, en sak i taget (läsar-glyf → titel → hint). `bipp__title` = `2rem` (BippStart.vue), `bipp__hint` = `1.25rem`. Fokus (titeln) är klart störst — bra. Entrén följer Emil (mjuk `translateY` + `ease-out`, aldrig `scale(0)`). Fungerar.

### rollval (`components/RoleSelect.vue`)
Rubrik centrerad (`roles__head { text-align: center }`), men **fokus är otydligt**: två kort med titel `clamp(1.6rem, 4vw, 2.4rem)` (`RoleSelect.vue:104`) som båda glöder lika mycket, plus blurb `1.1rem` och en `roleselect.pick`-rad. Ögat får ingen given startpunkt. Rubriken `roleselect.title` ("VÄLJ DIN ROLL") borde vara den obestridda fokustexten; korten är valet, inte rubriken.

### coach / tutorial (`components/CoachIntro.vue`)
*Utanför ramen (tutorial görs om separat) — noteras bara kort:* bubbeltexten `coach__text` = `1.15rem` (`CoachIntro.vue:208`) är den instruerande kärnan men är liten; zonerna glöder och konkurrerar. Lämnas därhän.

### steg-cykel — **situations-popup** (`components/StepCycle.vue:289–305`, stil `453–517`)
Det här är den tätaste och minst tydliga rutan i hela stationen. I **en** modal staplas sex textblock:
1. eyebrow `popup__eyebrow` `0.75rem` (= ~18px) — "DET HÄR ÄR LÄGET" (`sv.ts:94`)
2. `popup__task` `clamp(1.4rem, 4vw, 2rem)` — frågan (`StepCycle.vue:475`)
3. 2 popup-rader `popup__lines li` (ärver, ~1rem) (`sv.ts:127-128`)
4. en inramad regel-ruta med titel `popup__rule-title` `1.5rem` + brödtext (`StepCycle.vue:296–299, 502–511`)
5. tidsrad `popup__time` (`StepCycle.vue:300`)
6. knapp "VI ÄR REDO ▸"

Ingen av dem är en entydig fokustext — frågan (det som BORDE vara störst, `2rem`-tak) är knappt större än regel-titeln (`1.5rem`) och konkurrerar med en helt inramad, glödande regel-ruta. Regeln är dessutom **dubblerad**: `step.rule_body` ("Ni bedöms på HUR ni resonerar …", `sv.ts:101`) säger samma sak som `step.why_line` ("Säg VARFÖR ni väljer …", `sv.ts:103`) som visas igen i think-vyn. Resultatet: läsaren på avstånd möter en vägg, inte en fråga.

### steg-cykel — **countdown** (`StepCycle.vue:308–313`)
`countdown__num` = `clamp(5rem, 18vw, 10rem)` (`StepCycle.vue:550`) — stor, centrerad, med stark glöd och `cd-pop`-animation. Detta är rätt: en fokus, stor, centrerad. Men `countdown__cue` (rad 312) skriver ut `step.rule_title` = "🎙 TÄNK HÖGT TILLSAMMANS" (`sv.ts:100`) — färgemoji mitt i en monokrom CRT, renderas olika per OS.

### steg-cykel — **think** (fas 1 & 2) (`StepCycle.vue:315–361`)
Den centrala speluppgiften, och tydlighetsmässigt svagast efter popupen:
- **Frågan är vänsterställd och delar rad med timern.** `think__header { display: flex; align-items: flex-start }` (`StepCycle.vue:581–586`) lägger `think__task` (`clamp(1.7rem, 4vw, 2.6rem)`, `:595–602`) till vänster och `think__timer` (`1.5rem`) till höger. Det finns ingen *centrerad* fokustext — fokus är hörnplacerat och konkurrerar med en lika glödande timer.
- **Den viktigaste instruktionen är den minsta texten på skärmen.** `whyLine` ("Säg VARFÖR …" / "Säg HUR …") visas som `think__why` i `0.85rem` **dämpad, kursiv** (`StepCycle.vue:329, 340; stil 658–664`). Själva poäng-regeln — det enda deltagarna måste förstå — är satt som finstilt fotnot. Det är raka motsatsen till hierarki.
- `think__context` `0.95rem` (`:590–594`), `think__transcript` `clamp(1.15rem, 2.2vw, 1.55rem)` (`:635–640`). Live-transkriptet är rimligt men vänsterställt och dämpat tills det fylls.

### steg-cykel — **guess** (fermi) (`StepCycle.vue:363–384`)
Centrerat kort (`guess__card { text-align: center }`), `NumberStepper`-readout stor och centrerad: `stepper__value` `clamp(2.4rem, 7vw, 3.6rem)` med `tabular-nums` (`NumberStepper.vue:158–164`). Det här är en bra, tydlig fokusruta. Skav: `guess.sub` = "Det viktiga **var** hur ni tänkte." (`sv.ts:161`) — imperfekt mitt i pågående moment; och `guess__title`/`guess__sub` är små relativt siffran (ok, siffran ÄR fokus).

### steg-cykel — **analys** (`StepCycle.vue:386–395`)
`ThinkingStream` matar ut rader i `font-mono` `clamp(0.95rem, 2vw, 1.2rem)`, dämpade (`ThinkingStream.vue:136–147`) med bara sista raden i accentfärg. Medvetet lågmält (ögongodis under väntan) — ok, men det är den enda rutan där `font-mono` redan används för löptext, vilket bevisar att Plex Mono fungerar här.

### steg-cykel — **reply / NPC** (`StepCycle.vue:397–412`, `components/NpcReply.vue`)
NPC-svaret växer fram via `Teletype` (`NpcReply.vue:38`) i `clamp(1.25rem, 2.4vw, 1.7rem)` (`:68–72`) — framväxande text, bra. Men **vänsterställt** och satt i VT323 (Teletype `.teletype { font-family: var(--font-retro) }`, `Teletype.vue:89`). Ett längre ENHETEN-svar i pixelfont, vänsterställt, är svårläst på håll. Prefixet "ENHETEN //" glöder lika mycket som svaret.

### reveal / verdict (`components/ResultWalkthrough.vue`, `components/VerdictScreen.vue`)
Titel centrerad (`rw__title { text-align: center }`), men raderna vänsterställda `rw__row` `1.05rem` (`ResultWalkthrough.vue:213`) med `rw__step` dämpad. Slutpoängen `rw__poang` = `clamp(3.4rem, 10vw, 5.4rem)` med egen färgad glöd (`:275–281`) — stor, men sitter i en vänsterställd `rw__hero`-flex, inte centrerad. Raderna har redan en fin stagger-entré (`rw__in`, `@keyframes rw-in`, `:238–240, 306–311`) — det ÄR framväxande text på rätt ställe, behåll. Poängen byggs bra narrativt; det som fattas är att slutsiffran inte är **skärmens centrerade hjälte**.

**Sammanfattande mönster:** de rutor som fungerar (attract, countdown, guess, bipp) har *en* stor, centrerad sak. De som inte fungerar (popup, think, reply, reveal-hjälten) har fokustexten **vänsterställd, delad med annat innehåll, och lika glödande som stödtexten** — och den enda regel deltagarna måste läsa (`why_line`) är satt som den minsta texten.

---

## 2. Framväxande text — vad Utmana experten gör, och var Minnestestet bör ta efter

Viktig grundupptäckt: **"text som växer fram" i Utmana experten är tre olika mekaniker**, inte en. Och primitivet finns redan i Minnestestet.

**(a) Char-för-char teletype (det narrativa primitivet).**
`station-kit/components/Teletype.vue` i Utmana (`utmana-experten/src/station-kit/components/Teletype.vue`) är **bit för bit identisk** med Minnestestets egen `src/station-kit/components/Teletype.vue`: samma `step()` som lägger ett tecken i taget med `setTimeout(step, speed)`, blip-ljud per tecken, blinkande `▋`-caret, och klick-för-att-hoppa-över (`skip()`/`finish()`). Minnestestet använder redan detta i `AttractScreen` (tagline), `FermiIntro` (rad 21) och `NpcReply` (rad 38). Mekaniken finns alltså — den är bara inte använd där den skulle höja tydligheten mest.

**(b) Live-transkript som växer medan man pratar (den mest "levande" reveal:en).**
Utmanas `SpeakRoundStep.vue` visar den som har ordet som ett **stort** live-transkript: `<p class="mic__text">{{ liveText }}<span class="cursor">▍</span></p>` där `liveText` är Web Speech-strömmen, satt i `.mic__text { font-size: 4.1cqw; line-height: 1.28; text-wrap: balance }` (`utmana-experten/src/stations/utmana-experten/theme/gameshow.css:238`). Texten växer ord för ord i stor grad, centrerad, med en caret. Minnestestet har *exakt samma* capture (`useSpeechCapture`) och visar `capture.transcript.value` i `think__transcript` — men litet (`clamp(1.15rem,2.2vw,1.55rem)`), vänsterställt och dämpat (`StepCycle.vue:334–337, 635–644`). Samma data, mycket svagare presentation.

**(c) Värden/staplar som animeras in vid reveal.**
Utmanas `RevealStep`/`FacitStep` låter stora tal och staplar *landa*: `.bar__fill { transition: width 0.9s cubic-bezier(0.23,1,0.32,1) }` (`gameshow.css:302`), `delta__big` `12cqw` och `verdict__answer` `7cqw` (`gameshow.css:291,258`) som tonas in med `.view`-entré. Minnestestets `ResultWalkthrough` gör redan motsvarande (stagger-rader + byggd slutpoäng) — så här är Minnestestet redan i fas.

**Bonus — hur Utmana gör text STOR och centrerad:** hela temat är byggt på **container-query-enheter (`cqw`)** i stället för `clamp(rem, vw, rem)`. Fokusfrågan `.fraga__q` = `6cqw`, `line-height: 1.02`, `max-width: 16ch`, i en `display: grid; place-items: center; text-align: center`-container (`gameshow.css:217–219`). Eftersom allt är `cqw` skalar fokustexten *proportionerligt* med ytan och förblir skärmens största element oavsett upplösning — till skillnad från Minnestestets `clamp()` som fastnar vid sitt rem-golv. Dessutom: Utmana sätter `body { font-family: var(--f-text) }` (Hanken Grotesk, en läsbar sans) och använder display-fonten bara via `--f-disp` (`gameshow.css:48–49, 57`) — **exakt den body-/display-delning** som Minnestestet saknar.

**Konkreta ställen i Minnestestet där framväxande text höjer tydligheten:**

| Ställe | Idag | Föreslagen reveal (mekanik) |
| --- | --- | --- |
| **think — live-transkript** (`StepCycle.vue:334`) | litet, vänsterställt, dämpat | (b) stor, centrerad, `text-wrap: balance` + caret — spegla Utmanas `mic__text`. Gör *deras egna ord* till skärmens fokus medan de pratar. |
| **situation — EN situationsrad** (`sv.ts:124` m.fl.) | hela popupen poppar på en gång | (a) låt den enda situationsraden skrivas fram med `Teletype` ovanför den redan stora frågan — en sak läses i taget. |
| **reply — ENHETEN-svaret** (`NpcReply.vue:38`) | växer fram men vänsterställt + VT323 | behåll (a), men **centrera** och sätt i Plex Mono; synka `speed` mot röstens takt (perceived performance — Emil). |
| **countdown-cue / instruktion** | statisk rad med emoji | (a) låt instruktionsraden skrivas fram en gång, inte stå still som en vägg. |

Notera Emils varning i Teletype-filens egen docstring: framskriv **bara** berättande/instruerande text — aldrig levande värden (timer, poäng). Den regeln är redan rätt och ska hållas.

---

## 3. Linjering mot Förhandlingen + Emil-principer

Viktig faktakoll mot disk: Förhandlingens **committade** `crt.css` (`forhandlingen/src/station-kit/theme/crt.css`) har ännu **inte** fullföljt body-font-bytet — `body { font-family: var(--font-retro) }` (VT323) och `text-shadow: var(--glow-soft)` ligger kvar (`forhandlingen/.../crt.css:114,116`). Det Förhandlingen faktiskt har landat (och som Minnestestet saknar) är **läges-/färg- och glöd-systemet**:

- **Lägestokens + ompekad accent/glöd** (`forhandlingen/.../crt.css:13–85`): `--mode-tutorial` (#35e0d0), `--mode-live`, `--mode-accent-rgb`, och ett `[data-mode='tutorial']`-block som pekar om `--color-primary` + alla glöd-tokens. Minnestestets `crt.css` har **inget** av detta — `MinnestestApp.vue` sätter ingen `data-mode`-wrapper, och mint-färgen är **hårdkodad** i `CoachIntro.vue:97` (`--mint: #35e0d0`) och `ResultWalkthrough.vue:23` (`accent = '#35e0d0'/'#ff9500'`). För *tydlighet* betyder detta att blått-vs-skarpt inte styr glöd/bläck konsekvent.
- **Bläckhierarki** (vit nyckel / orange accent / dämpad sekundär): Förhandlingen har tokens `--color-ink-strong` / `--color-primary` / `--color-ink-muted` (`forhandlingen/.../crt.css:35–36`) — **identiska** med Minnestestets (`crt.css:19–20`). Paletten finns; Minnestestet tillämpar den bara inte som *hierarki* (allt glöder lika, se §1 A/B).

Den fullständiga läsbarhetsriktning Josef beskriver (Plex Mono body, VT323 bara display, glöd bara på fokus) är alltså **konkret bevisad i Utmana experten** (`gameshow.css`, §2) snarare än i Förhandlingens committade tema — spegla Utmanas body/display-delning och Förhandlingens läges-/glödsystem tillsammans.

**Emil-principer som styrker riktningen (konkret):**

| Emil-princip | Vad den säger om Minnestestet |
| --- | --- |
| "Unseen details compound … a thousand voices in tune" | Idag sjunger inte rösterna i stämma: VT323-body + global glöd + platt skala gör att allt skriker lika högt. Att dämpa glöd till *en* fokus per ruta är precis den sortens osynliga detalj som adderas ihop till "varför känns det här tydligt". |
| **En tydlig fokus per skärm** (hela animations-/hierarki-tänket) | think-vyn och popupen har ingen entydig fokus. Att göra frågan till skärmens enda stora, centrerade, glödande element är kärnåtgärden. |
| **Hierarki via kontrast, inte dekoration** | Den viktigaste raden (`why_line`) är minst och dämpad (`StepCycle.vue:660`). Emil: fokus ska vinna på storlek/vikt/placering — inte begravas som fotnot. |
| **Perceived performance** (snabb, stark `ease-out`; teletype-takt) | Teletype-`speed` och reveal-takt påverkar hur "skarp" stationen känns. `--ease-out`/`--ease-in-out` finns redan i temat (`crt.css:33–34`) — använd dem, låt inte reveal:er bli sega. |
| **Cohesion — motion/typ matchar stämningen** | Utmana och Förhandlingen är systerstationer på samma kit. En gemensam body/display-delning + typskala gör att de känns som ett system (Emils "everything in harmony"). |
| **Buttons feel responsive / aldrig från `scale(0)`** | Redan uppfyllt: `.crt-button:active { transform: scale(0.97) }` (`crt.css:206`) och `BippStart` startar nära slutläget. Behåll — bra exempel på att grunden redan finns. |

---

## 4. Föreslagna förändringar (prioriterade, konkreta)

Allt nedan är läsbarhet/tydlighet. Inget rör ordning, grafisk stil eller tutorial-rundan.

1. **Byt body-font till IBM Plex Mono; VT323 bara för display.** I `crt.css` ändra `body { font-family: var(--font-retro) }` (`crt.css:71`) → `var(--font-mono)`. Behåll VT323 (`--font-retro`) **endast** på: rubriker, stora siffror (`countdown__num`, `stepper__value`, `rw__poang`), timer, eyebrow-etiketter. All löptext/instruktion/NPC-svar/popup-rader → Plex Mono. Bevisat i Utmana (`gameshow.css:48–49,57`). *Störst hävstång, en ändring.*

2. **Ta bort global body-glöd; glöd bara på skärmens enda fokus.** Ta bort `text-shadow: var(--glow-soft)` från `body` (`crt.css:73`). Låt glöd ligga kvar bara på fokus-elementet per ruta (den stora frågan, `countdown__num`, den landande poängen). Stödtext = ingen glöd. (Emil: en fokus; Förhandlingens glödhierarki.)

3. **Centrera och förstora fokustexten i think-vyn.** `StepCycle.vue:319–325, 581–602`: lyft `think__task` ur `think__header`-flexen till en egen centrerad rad (`text-align: center`, eget block ovanför), flytta timern till ett hörn/egen rad så den inte delar rad med frågan. Höj taket, t.ex. `clamp(2.2rem, 6vw, 3.6rem)`, och låt frågan vara skärmens största element. (Idag `clamp(1.7rem,4vw,2.6rem)`, vänsterställd.)

4. **Lyft `why_line` från finstilt fotnot till tydlig stödrad.** `StepCycle.vue:329, 340; 658–664`: ändra `think__why` från `0.85rem` dämpad/kursiv till en vit (`.ink-strong`), ocursiverad rad på minst body-grad (≈1rem+), centrerad under frågan. Detta är poäng-regeln — den får inte vara minst på skärmen.

5. **Gör live-transkriptet stort och centrerat (spegla Utmanas `mic__text`).** `StepCycle.vue:334, 635–644`: höj `think__transcript` till Utmana-nivå (motsvarande ~4cqw / `clamp(1.8rem, 4vw, 2.6rem)`), centrera, lägg `text-wrap: balance` och behåll/duplicera carett `▍`. Deltagarnas egna ord blir skärmens fokus medan de pratar.

6. **Banta situations-popupen till EN fokus.** `StepCycle.vue:289–305`: låt popupen bära **frågan stor + en situationsrad** (gärna framväxande, §2a). Flytta motiverings-regeln ut ur popupen (den upprepas redan i think och i tutorialen). Ta bort den inramade, glödande `popup__rule`-rutan (`:296–299, 492–511`) som konkurrerar med frågan. Trimma eyebrow `lage.title` efter steg 1 (bär ingen ny info). Dubbletten `step.rule_body` vs `step.why_line` (`sv.ts:101,103`): behåll en.

7. **Centrera NPC-svaret och sätt i Plex Mono.** `NpcReply.vue:38, 43–72` + `Teletype.vue:89`: gör Teletype-fonten konfigurerbar (eller överstyr i `.npc__text`) så ENHETEN-svaret växer fram i Plex Mono, centrerat, i stället för vänsterställd VT323. Behåll framväxningen.

8. **Inför en modulär typskala som tokens i `crt.css` — ersätt ad hoc-`clamp()`.** Idag finns minst ett dussin olika triples (`clamp(1.4rem,3vw,2rem)`, `clamp(1.7rem,4vw,2.6rem)`, `clamp(1.15rem,2.2vw,1.55rem)`, `clamp(1.4rem,4vw,2rem)`, `clamp(1.25rem,2.4vw,1.7rem)`, `clamp(2.4rem,7vw,3.6rem)`, `clamp(3.4rem,10vw,5.4rem)` m.fl.). Definiera t.ex. `--fs-eyebrow / --fs-support / --fs-body / --fs-focus / --fs-display / --fs-mega` och använd dem genomgående. Överväg **container-query-enheter (`cqw`)** som Utmana (`gameshow.css`) så fokustexten skalar proportionerligt och inte fastnar på rem-golvet (nuvarande `clamp`-mellanled skalar inte med `--ui-scale`). Behåll `--ui-scale`-greppet för monteravstånd.

9. **Centrera reveal-hjälten (slutpoängen).** `ResultWalkthrough.vue:151–157, 269–281`: gör `rw__hero`/`rw__poang` centrerad (den sitter i en vänsterställd flex idag). Behåll den fina stagger-entrén (`rw__in`) och den byggda uppräkningen — bara centrera slutsiffran så den blir skärmens hjälte à la Utmanas `delta__big`/`verdict__answer`.

10. **Ersätt färgemoji `🎙` med en monokrom mic-SVG i accentfärg.** `sv.ts:100,104,105` (`step.rule_title`, `step.mic_active`, `step.talk_now`) renderas i `StepCycle.vue:312,328,339` och `countdown__cue`. Färgemoji bryter den monokroma CRT-looken och ser olika ut per OS — en liten egen SVG (orange skarpt / mint test) är både mer läsbar och mer konsekvent.

11. **Gör rollvalets rubrik till entydig fokus.** `RoleSelect.vue:24–27, 60–64`: höj `roles__title` tydligt över kortens titlar så ögat startar på frågan "VÄLJ DIN ROLL", inte på två likaglödande kort. (Ingen omordning — bara hierarki.)

12. **Fäst accent/glöd vid läget via `data-mode` i stället för hårdkodad mint.** `MinnestestApp.vue` (ingen wrapper idag), `CoachIntro.vue:97`, `ResultWalkthrough.vue:23`: porta Förhandlingens `[data-mode]`-tokens (`forhandlingen/.../crt.css:13–85`) så blått (övning) / orange (skarpt) styr glöd och accent konsekvent genom temat i stället för per-komponent-konstanter. (Rör inte lägenas *ordning/logik* — bara var färgen bor, för konsekvent bläckhierarki.)

---

## 5. Sammanfattning

- **Störst hävstång, minst arbete: body → IBM Plex Mono (VT323 bara display) + ta bort global body-glöd.** Två rader i `crt.css` (`:71,73`) som lyfter läsbarheten på varenda ruta. Bevisat i Utmana (`gameshow.css:48–49,57`).
- **Varje ruta ska ha EN stor, centrerad, glödande fokustext.** Idag är fokus ofta vänsterställt och delar rad/glöd med annat (think-frågan vs timern, `StepCycle.vue:581–602`; reveal-hjälten, `ResultWalkthrough.vue:269–281`). Attract/countdown/guess visar redan rätt mönster — kopiera det.
- **Den viktigaste raden är idag den minsta.** `why_line` i `0.85rem` dämpad kursiv (`StepCycle.vue:660`) är poäng-regeln — den ska vara en tydlig stödrad, inte en fotnot.
- **Texten är för liten *i relation till* stödtexten, inte bara absolut.** `clamp()`-mellanleden skalar inte med `--ui-scale`, så fokus fastnar på rem-golvet medan stödtext växer. En modulär typskala (gärna `cqw` som Utmana) fixar hierarkin systematiskt.
- **Framväxande text finns redan (`Teletype`, identisk med Utmanas) — använd den där den höjer tydlighet:** den enda situationsraden, det centrerade NPC-svaret, och framför allt det stora centrerade live-transkriptet (spegla Utmanas `mic__text`, `gameshow.css:238`). Framskriv bara berättande text, aldrig värden.
- **Rensa konkurrensen:** banta situations-popupen till fråga + en rad (`StepCycle.vue:289–305`), ta bort dubbelregeln (`sv.ts:101` vs `103`), byt `🎙`-emoji mot monokrom SVG (`sv.ts:100,104,105`).

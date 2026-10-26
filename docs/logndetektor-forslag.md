# Lögndetektorn — förslag (FÖRSLAG, inget byggt)

Den andra nya sidan av Minnestestet: ett **lögndetektor-test** för en grupp om tre.
AI:n (VALdi) bedömer om ni kan **ljuga trovärdigt** — eller skilja sanning från lögn.
Behåller den gatade stegen: **5 nivåer, en tröskel/mätare, nå så långt ni kan.**
Rollnamn för sidan: *TBD (placeholder: "den andra rollen").*

## Så fungerar en nivå/omgång
1. **Lägg handen på plattan.** En mock-up "läser av" dig (puls/känslo-sensor på låtsas) — en pulslinje/mätare vaknar på skärmen. Ingen riktig mätning krävs; känslan av att bli *avläst* är poängen.
2. **Frågan/uppdraget visas** + "TALA NU". **En pratar i taget**, ~**15 sekunder** var — turordning, så det aldrig blir rörigt.
3. **AI väger svaret** — en uppbyggd, komisk "nu analyserar jag"-reveal (Sorteringshatten/VALdi-anda): pulslinjen rör sig, AI resonerar högt om vad som talar för sanning vs lögn, och landar i ett besked.
4. **Förtroende-/avslöjandemätaren rör sig.** Över tröskeln → porten släpper fram gruppen till nästa nivå. Under → ni åker ut och stannar på nådd nivå. VALdi berömmer den som övertygade/ljög bäst.
5. Tydligt från start: **~5 nivåer**, allt svårare (kortare betänketid, hårdare följdfrågor, finare marginaler).

> **MQTT-förstärkning (senare, byggs ej nu):** plattan lyser/pulserar när man "avläses", porten/nivå-lamporna tänds vid godkänt, ett rött svep vid avslöjad lögn. Haka i samma semantiska söm som Eco Loco/Valvet (station-ESP32 äger plattans glow; spelet skickar "mäter/godkänd/avslöjad").

---

## Riktning 1 — "Ljug trovärdigt" (grunduppdraget)
**Upplägg:** Var och en får ett tilldelat påstående de ska få AI att TRO på — en vit lögn de ska sälja in.
**Omgång:** Samma typ av uppdrag till alla tre; var och en 15 s att övertyga på sitt. Individuell delbedömning som slås ihop till gruppens mätarrörelse (en svag lögn drar ner, två starka lyfter).
**AI-regelverk (trovärdig lögn ↑ / avslöjad ↓):**
- ↑ Konkreta, sinnliga detaljer; stabilt känsloläge; naturligt flyt; äger berättelsen.
- ↓ Tvekan och självkorrigering ("alltså… eller, nej…"); ÖVERförklaring (för många onödiga detaljer); inre inkonsekvens; plötslig tonförändring; klichéer utan förankring.
- Mätaren: trovärdighet 0–10 per svar; gruppens snitt mot nivåns tröskel.
**Platta:** pulslinjen "spikar" lätt vid tvekan/överförklaring → visuell signal att AI "känner nervositeten".
**Komisk "AI väger":** *"Du sa att du klappat en varg… detaljen om den våta pälsen köpte jag. Men du tittade bort. Jag är 61 % såld."*

## Riktning 2 — "Två sanningar och en lögn"
**Upplägg:** Varje deltagare säger tre påståenden om sig själv/ett tema — två sanna, en falsk. AI ska peka ut lögnen; ni vinner om ni LURAR AI:n.
**Omgång:** 15 s var att leverera sina tre; AI gissar lögnen direkt efter. Individuellt: lyckas du lura → upp; blir du genomskådad → ner. Gruppens tre utfall → mätaren.
**AI-regelverk:** AI väger vilken av de tre som bär flest lögn-markörer (minst detalj, mest hedging, avvikande känsloläge) — och motiverar sitt val. Lyckad lögn = den falska hade LIKA mycket kött som de sanna.
**Platta:** mätaren laddar medan AI "jämför de tre" — tre staplar som vägs mot varandra.
**Komisk "AI väger":** *"Punkt två var misstänkt perfekt. Punkt tre skakade till. Jag säger… trean är lögnen. … Fel? Imponerande, människa."*

## Riktning 3 — "Försvara en åsikt du inte har"
**Upplägg:** Var och en tilldelas en ståndpunkt (gärna lite absurd men ofarlig) de ska argumentera för som om de verkligen tyckte så.
**Omgång:** Samma fråga/tema, olika tilldelade sidor; 15 s att argumentera övertygande. Bedöms på *övertygelse*, inte på om åsikten är "rätt".
**AI-regelverk:** ↑ engagemang, konsekvens, att man "bor i" åsikten, egna exempel. ↓ ironisk distans, "men egentligen tycker jag…", tunna floskler, att man tappar tråden.
**Platta:** pulslinjen "lugn och övertygad" = jämn våg; "låtsas utan att tro på det" = hackig.
**Komisk "AI väger":** *"Du försvarade att ananas hör hemma på pizza med en sån inlevelse att jag nästan trodde dig. Nästan."*

## Riktning 4 — "Håll masken under press"
**Upplägg:** En deltagare ljuger om något; AI ställer **följdfrågor** i realtid och försöker knäcka hen. Klarar man pressen utan att spricka?
**Omgång:** En i taget i hetluften (~15 s + 1–2 snabba följdfrågor); de andra två gör samma på var sitt scenario. Individuellt motstånd → mätaren.
**AI-regelverk:** ↑ snabba, konsekventa svar som bygger vidare på egna detaljer utan att motsäga sig. ↓ långa pauser, byter story, "det sa jag inte", eskalerande nervositet.
**Platta:** varje följdfråga = en "stöt" i pulslinjen; håller man jämnt → grön, spikar man → röd.
**Komisk "AI väger":** *"Jag frågade vilken färg bilen hade. Du sa 'typ blå'. 'Typ.' Där tappade jag förtroendet lite."*

## Riktning 5 — "Sanning eller lögn — du väljer"
**Upplägg:** Frågan är personlig/neutral; deltagaren väljer SJÄLV i hemlighet att tala sanning eller ljuga, och ska lura AI om vilket. AI gissar: sanning eller lögn?
**Omgång:** Samma fråga till alla tre; var sin 15 s; var och en har valt sant/falskt. AI gissar per person. Poäng = antal gånger ni lurade AI. Gruppens träffbild → mätaren.
**AI-regelverk:** AI väger sanningsmarkörer (spontanitet, småfel, levande minne) mot lögnmarkörer (tillrättalagt, slätt, hedging) och motiverar sin gissning. Att få en SANN historia att låta "tillrättalagd" eller en LÖGN att låta spontan = vinst.
**Platta:** neutral baslinje tills man börjar prata; AI "kalibrerar mot din baslinje" (mock).
**Komisk "AI väger":** *"Det där lät sant. För sant. Misstänkt sant. … Du ljög, va? Nej? Attans."*

---

## Rekommendation för en stegrande 5-nivåers-runda (grupp)
Bär hela rundan på **Riktning 5 ("Sanning eller lögn — du väljer")** som ryggrad, med **Riktning 4 ("Håll masken under press")** som den hårdare toppnivån:

- **Varför R5 som grund:** samma fråga till alla tre = inget rör, enkelt turtagande, alla aktiva varje nivå, och självvalet (sant/lögn) ger inbyggd spänning + replay-värde utan att någon behöver "hitta på" från tomt. Lätt att trappa: snällare frågor och vidare marginal på nivå 1–2, finare marginal och kortare tid på 4–5.
- **Varför R4 på toppen:** följdfrågorna höjer pulsen på riktigt och gör sista porten till ett tydligt crescendo ("klarar ni pressen?").
- R2 (två sanningar/en lögn) fungerar utmärkt som **en** mellannivå för variation. R1 och R3 är bra reserver/alternativa teman men lutar mer åt individuell prestation än grupp-stegen.

---

## Fördjupning: R1 & R5 — konkreta påståenden
Målgrupp: science center, troligen tonåringar/åttondeklassare. Allt utgår från vardag,
skola, familj, hobby, mat, popkultur, "en gång när…" — inga specialistkunskaper. Varje
påstående ska gå att besvara på **15–30 s** och ge utrymme för detaljer och känsla, för
det är där sanning och lögn skiljer sig.

### R1 — Tilldelat scenario att LJUGA trovärdigt om
De VET att de ljuger; konsten är att låta sann (spontana, sinnliga detaljer + jämnt
känsloläge, utan överförklaring).

1. Beskriv en gång du var **riktigt rädd** — hitta på den.
2. Berätta om **husdjuret du hade som liten** (som du aldrig haft) — namn, lukt, en vana.
3. Beskriv den **läskigaste drömmen du hade i natt**.
4. Berätta om en gång du **träffade någon känd** — var, vad hen sa.
5. Beskriv din **värsta pinsamhet i skolan** — påhittad.
6. Berätta om ett **ärr du har** och exakt hur du "fick det".
7. Beskriv en **resa du 'varit på'** men aldrig gjort — en sak du 'såg', en smak.
8. Berätta om **första gången du smakade** något du avskydde.
9. Beskriv en **hemlig talang du 'har'** — och en gång den räddade dagen.
10. Berätta om en gång du **räddade någon ur en knipa**.

*Varför de funkar:* alla är personliga/upplevda → en övertygande lögn måste bära
*konkreta sinnliga detaljer* (lukt, smak, ljud), *ett stabilt känsloläge* och *inre
konsekvens*. AI-regelverket hakar i: detaljrikedom ↑, spontant flyt ↑ vs tvekan,
överförklaring, plötslig tonväxling och klichéer ↓.

### R5 — Du VÄLJER sant eller lögn, AI (+ ev. de andra) gissar
Formulerat som påståenden de tar ställning till. Konsten: få en SANN historia att låta
tillrättalagd — eller en LÖGN att låta spontan.

1. **Har du någon gång brutit ett ben?** Sant eller lögn — du bestämmer.
2. **Är du rädd för något oväntat litet** (ballonger, fjärilar, knappar)?
3. **Har du ljugit för en lärare och kommit undan med det?**
4. **Finns det en maträtt du i hemlighet älskar** men aldrig erkänner?
5. **Har du varit med om något du inte kan förklara** (spöke, oknytt, en känsla)?
6. **Har du ett smeknamn** som ingen här i rummet känner till?
7. **Har du någon gång vunnit något** — tävling, pris, lotteri?
8. **Finns det en låt eller artist du lyssnar på i smyg?**
9. **Har du gjort något du ångrar på ett kalas/en fest?**
10. **Har du en dold talang** ingen vet om?

*Varför de funkar:* korta ja/nej-påståenden om det personliga → en SANN historia kommer
med *effortless specifika detaljer och små skönhetsfel*; en LÖGN blir ofta *för slät och
tillrättalagd* eller *överdetaljerad*. AI-regelverket kalibrerar spontanitet vs inövat,
känslokongruens och hur svaret "sitter i kroppen" — och motiverar sin gissning komiskt.

---

## AI-regelverket — trovärdighet i stunden (att bli synad)
Hela upplevelsen står och faller med att domen känns **förtjänad**, inte slumpad. Nyckeln
(samma insikt som i människa-researchen): en **slät, generell** ton avslöjar ingenting —
det är **det specifika** som fäller avgörandet. AI:n måste bevisa att den *lyssnade på
just det här svaret*, annars rasar illusionen direkt.

### 1. Vad AI:n lyssnar på och väger (i det talade svaret)
Rangordnat efter hur tungt det väger:

**Starkast för SANNING (↑ förtroende):**
1. **Specifika, sinnliga detaljer** som ingen hittar på i onödan (en lukt, ett namn, "den klibbiga räcket").
2. **Småfel och självrättelser som inte döljs** ("nej förresten, det var i tvåan, inte trean").
3. **Känsloläge som matchar innehållet** (skrattar till vid det pinsamma, dämpas vid det läskiga).
4. **Effortlöst tempo** — svaret rullar, man letar inte efter det.

**Starkast för LÖGN (↓ förtroende):**
1. **Överförklaring & onödigt rättfärdigande** ("och det är ju helt sant, jag lovar, typ…").
2. **Tvekan/pauser/omtagningar** på ställen där ett minne borde sitta.
3. **Inkonsekvens/självmotsägelse** mellan två detaljer i samma svar.
4. **Generiskt & platt** — rätt ord, noll textur ("det var kul. Vi hade roligt. Sen gick vi hem.").
5. **Tonbrott** — känslan matchar inte orden (neutral röst om något "hemskt").

> Viktigt: *flyt i sig* är inte sanning. En inövad lögn kan vara len. Därför väger
> AI:n **textur + mikrofel + känslokongruens** tyngre än bara "lät säkert".

### 2. Hur domen LEVERERAS så den känns förtjänad
Tre krav på varje dom:
- **Citera tillbaka det personen faktiskt sa.** Ordagrant där det går.
- **Väg åt BÅDA håll** innan beskedet (en sak som talade för, en emot).
- **Namnge exakt vad som fällde avgörandet.**

**Bra dom (synar på riktigt):**
> "Du sa 'den luktade våt hund och bensin' — den detaljen köper jag, sån hittar man inte på.
> Men sen tvekade du på *när* det hände, och la till 'jag svär' två gånger. Det drar ner.
> … Jag landar i: **sant**. Men det var nära."

**Dålig dom (dödar trovärdigheten):**
> "Det lät ganska trovärdigt. Jag tror att du talar sanning." *(inget citat, ingen avvägning, utbytbart mot vilket svar som helst → känns slumpat)*

### 3. Förutsättningar som regelverket KRÄVER
- **Frågan måste ge något att syna.** Ja/nej räcker inte — därför: i R5 är ja/nej bara
  *ställningstagandet*; de **15 sekunderna spenderas på att BERÄTTA** historien bakom, och
  det är berättelsen som synas. Formulera alltid med ett "berätta om det" inbyggt.
- **STT måste fånga exakta ord + tvekan.** Skicka in råa transkriptet med fyllnadsord
  ("öö", "typ", "liksom") och omtagningar bevarade — de är signal, inte brus. Markera
  gärna pauser (t.ex. längre tystnad) om tekniken tillåter.
- **Kalibrering (inte för hård, inte för släpp, inte slump):** modellen ska kräva **minst
  en konkret, citerbar signal** för sitt besked. Finns ingen tydlig signal → beskedet ska
  luta "osäkert/jämnt" och mätaren röra sig **lite**, inte slå i taket. Två likvärdiga svar
  ska ge likvärdig dom (konsekvens mellan deltagare och mellan omgångar).
- **"Lät trovärdigt men fejkar"-fällan:** väg textur/mikrofel, inte självsäkerhet. Belöna
  *specificitet*, inte volym eller tvärsäkerhet.
- **För kort/tyst svar:** inget att syna → ingen belöning. VALdi säger det rakt och komiskt
  ("Tre ord? En robot hade gett mig mer. Mätaren rör sig inte — nästa."). Drar inte ner
  hårt, men man vinner ingenting.

### 4. Press / följdfråga (ökar känslan av att bli synad)
Efter svaret kan AI:n ställa **en kort, riktad följdfråga på just en detalj personen nämnde**
("Du sa att hunden hette Pixel — vilken färg hade den?") och ge ~5–8 s. Det här är den
starkaste trovärdighets-förstärkaren: den bevisar att AI:n *hörde det specifika*. Vägning:
- Svar som **bygger vidare konsekvent** på egen detalj → ↑ (svårt att improvisera konsekvent).
- **Byter story, "det sa jag inte", eller tystnad** → ↓ (masken spricker).
- Används sparsamt (topp-/svåra nivåer) så det behåller tyngd.

### 5. Puls-plattan som trovärdighets-förstärkare
Plattan behöver inte mäta något riktigt — den ger AI:n en **andra "sinneskanal" att åberopa**
och binder ihop det fysiska med det språkliga:
- AI:n får korrelera sitt språkliga fynd med en "avläsning": *"…och precis när du sa 'jag
  svär' hoppade kurvan. Kroppen skvallrar."* (mock, men tajmat mot det personen faktiskt sa).
- Visuellt: pulslinjen spikar vid tvekan/överförklaring, ligger jämn vid effortlöst flyt →
  publiken SER samma sak som AI:n hör.
- Håll det grundat: plattan *förstärker* det språkliga fyndet, hittar aldrig på eget. Aldrig
  "pulsen säger lögn" utan att det finns något i svaret att knyta det till (annars blir det fånigt).

### 6. Utkast: /assess-regelverk / prompt-struktur
Realiserar ovanstående; samma motor-mönster som stationens övriga /assess.

**IN till modellen:**
- `format` (R1 = tilldelad lögn / R5 = valt sant-eller-lögn), `fraga`/scenario, `nivå` (1–5).
- `transkript` — RÅTT, med fyllnadsord, omtagningar, ev. paus-markörer bevarade.
- (valfritt) `följdfråga` + `följdsvar`.
- (valfritt, mock) `puls_händelse` = grov tajmstämpel där kurvan "spikade".
- nivåns kalibrering: hur hög marginal som krävs (snällare 1–2, hårdare 4–5).

**Modellen SKA väga (och tvingas belägga):**
- Plocka ut **konkreta citat** ur transkriptet som talar för sanning resp. lögn.
- Kräv minst en citerbar signal; annars → "jämnt/osäkert".
- Väg textur + mikrofel + känslokongruens tyngre än självsäkerhet/flyt.

**UT (JSON, driver mätare + reveal):**
```json
{
  "bedomning": "sant | logn | osaker",     // R5: gissning; R1: trodde-på / avslöjad
  "overtygande": 0-10,                      // hur väl det höll → mätarrörelsen
  "for_sanning": ["citat/observation", "…"],
  "for_logn":    ["citat/observation", "…"],
  "fallde_avgorandet": "den enda signal som vägde tyngst",
  "dom_mening": "uppläst besked: citerar tillbaka + väger båda håll + landar",
  "puls_koppling": "(valfritt) hur avläsningen band till ett citat"
}
```
Koden räknar mätarrörelsen ur `overtygande` mot nivåns tröskel; reveal:en radar upp
`for_sanning`/`for_logn` (komiskt, en i taget) och läser till slut `dom_mening`. Då blir
stunden synad, vägd och förtjänad — inte platt.

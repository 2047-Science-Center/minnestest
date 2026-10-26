# Människotestet — scen- & rums-assets (PROMPTER, generera inget)

Två bild-lager: (1) **scenario-scenen** (videoklippet i scenario-rutan, dilemmats miljö) och
(2) **valvrummet + porten** (bakgrunden man står i). Samma varma, filmiska men vardagliga **v3-stil**
som lögndetektorn för scenerna; valvrummen är sci-fi men i samma varma ljussättning. **Inga synliga
ansikten. 3:2.** Ljudbilderna genereras separat (inga ljud-prompter här).

**Så gör du:** gpt-image-1 **1536×1024** på bild-prompten → Runway **gen4_turbo** **1280:720**, 5 s,
loop-vänligt på rörelse-prompten. Spara som `<bas>.png` resp. `<bas>.mp4`.

**v3-stilrad (ingår sist i varje SCEN-bildprompt):**
> `Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.`

---

# DEL 1 — Scenario-scener (videoklipp i scenario-rutan)

## mt_1_badplats — badplatsen (sinnligt)
**Bild:**
```
A Scandinavian lake swimming spot on the first warm day of summer, a wooden jetty reaching over still mirror-like water, sun-warm planks, pine forest around, a towel and a backpack left on the jetty, early season with a patch of shade across the water, no people. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway:** `The water glints and ripples faintly, reeds sway, warm light shifts across the jetty planks. subtle, slow, seamless loop`

## mt_2_fest — festen (lojalitet vs ärlighet)
**Bild:**
```
A dim teenage house party in the evening, warm string lights and a single lamp, red cups and snacks on a table, a darker hallway corner beyond, a cosy but charged atmosphere, empty room implying people just stepped away, no people. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway:** `String lights flicker gently, shadows shift in the dark hallway, a curtain breathes, a cup's surface trembles. subtle, slow, seamless loop`

## mt_3_pizza — pizzahänget (rättvisa & social takt)
**Bild:**
```
A cosy teen hangout at home, a low table covered with open pizza boxes, soda cans and cups, a sofa and warm lamp light, a games controller on a cushion, no people. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway:** `Faint steam rises from an open pizza box, lamp light flickers, condensation beads and drips on a soda can. subtle, slow, seamless loop`

## mt_4_smasyskon — hemma med syskonen (familjeplikt)
**Bild:**
```
An ordinary Scandinavian home in late afternoon light, a school backpack dropped by the hallway door, children's toys scattered on the floor, unfinished homework and a cold cup on a table, an empty chair by a window looking out, a quiet sense of being stuck indoors while life goes on outside, no people. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway:** `Late afternoon light shifts slowly across the floor, a curtain sways, dust drifts in the warm beams. subtle, slow, seamless loop`

## mt_5_aula — aulan (döma utan att veta)
**Bild:**
```
A school assembly hall (aula) in solemn dim light, rows of empty chairs facing a stage, a single phone screen glowing softly on one seat, a heavy quiet atmosphere, soft light from high windows, no people. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway:** `The phone screen glows and dims, light shifts slowly across the empty chairs, dust drifts in the still air. subtle, slow, seamless loop`

---

# DEL 2 — Valvrummen + portarna

Fem **säkerhetskammare i Valvet**, var sin tydliga **färg** + stor **siffra/symbol** på väggen, med en
**massiv förseglad port** i fonden man står framför. Samma varma filmiska ljus, men sci-fi/metall.
**Förlita er INTE på ord i bilden** (AI renderar text dåligt) — lägg rumsnamnet som skarp UI-text
ovanpå; bilden bär **färg + en stor glödande siffra**. 3:2, gpt-image-1 1536×1024. (Kan vara stillbild
med subtil in-app-rörelse/ljus; vill man ha liv kan en kort Runway-loop göras på ljus/panelerna.)

**Gemensam sci-fi-stilrad (sist i varje RUMS-prompt):**
> `Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.`

## valv_1_bla — blått rummet (gate 1)
```
A sci-fi vault security chamber bathed in cool blue light, a massive sealed circular blast door ahead with a glowing blue seam, blue status strips along the walls, a huge faint glowing numeral "1" on the wall, clean and imposing. Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.
```
## valv_2_barnsten — bärnstensrummet (gate 2)
```
A sci-fi vault security chamber in warm amber light, a massive sealed blast door ahead with a glowing amber seam, amber status strips and panels, a huge faint glowing numeral "2" on the wall, warm and heavy. Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.
```
## valv_3_gron — gröna rummet (gate 3)
```
A sci-fi vault security chamber in deep green light, a massive sealed blast door ahead with a glowing green seam, green status strips and panels, a huge faint glowing numeral "3" on the wall, cool and tense. Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.
```
## valv_4_rod — röda rummet (gate 4)
```
A sci-fi vault security chamber in deep red light, a massive sealed blast door ahead with a glowing red seam, red status strips and panels, a huge faint glowing numeral "4" on the wall, charged and high-stakes. Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.
```
## valv_5_guld — guldrummet (gate 5, finalen)
```
A sci-fi vault security chamber in rich golden light, the innermost massive ornate blast door ahead with a glowing gold seam, gold status strips and panels, a huge faint glowing numeral "5" on the wall, grand and final — the deepest vault. Cinematic sci-fi vault security chamber, heavy brushed metal and concrete, glowing status strips and control panels, volumetric haze, filmic lighting, shallow depth of field, grounded and imposing, no visible faces, no readable text.
```

## Dörr-tillstånden (stängd / ÖPPNAS / ACCESS DENIED)
Enklast och mest byggbart: **en stängd-dörr-bild per rum** (ovan) som bas, och de två utfallen som
**overlay + animation i appen** (billigt, konsekvent), med ett valfritt genererat "öppnas-ögonblick".

- **STÄNGD (bas):** rummets bild ovan — porten förseglad, färgat sömljus lugnt, "VALDI ÖVERVÄGER"-
  overlay (processar-symboler/ljus) läggs ovanpå själva porten.
- **ÖPPNAS — access granted:** dörrsömmen spricker upp, **grönt ljus flödar ut** genom springan,
  "access granted"-glöd, ljus bakifrån. *In-app:* grön ljus-overlay + springa/öppnings-animation på
  porten; ev. en kort generisk Runway-loop (se prompt nedan) som spelas en gång.
  **Valfri prompt (gpt-image-1 eller startbild till Runway):**
  ```
  A massive sci-fi vault blast door splitting open at a vertical seam, brilliant green light flooding out through the widening gap, warm metal edges catching the glow, haze and light rays, access granted, imposing and triumphant. Cinematic sci-fi, heavy brushed metal, volumetric light, filmic, no visible faces, no readable text.
  ```
  Runway: `The vault door seam cracks and slowly widens, green light pours brighter through the gap, haze and light rays drift. slow, cinematic`
- **ACCESS DENIED:** porten förblir förseglad, **rött larmljus pulserar**, kort skakning/skärm-shudder.
  *In-app:* röd ljus-overlay + pulserande larm + lätt kamera-/skärmskak på stängd-dörr-bilden (inget
  nytt asset krävs).

(Rummets färg styr även UI-accenten i respektive rum; rumsnamnet — "DET BLÅ RUMMET / VALV 1" — läggs
som skarp UI-text, inte i bilden.)

---

## Att generera totalt
- **5 scen-videor** (`mt_1_badplats`, `mt_2_fest`, `mt_3_pizza`, `mt_4_smasyskon`, `mt_5_aula`): bild + loop-klipp.
- **5 valvrums-stillbilder** (`valv_1_bla` … `valv_5_guld`).
- **1 valfri "dörr öppnas (grönt)"**-asset (delad), + access-denied som in-app-overlay.
- Ljudbilder (scen-ambienser + port-/reveal-ljud) genereras separat.

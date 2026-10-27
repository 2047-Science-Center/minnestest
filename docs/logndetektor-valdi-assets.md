# Lögndetektorn — Valdi-hålet: bild- & Runway-prompter (FÖRSLAG)

Grundidé: **Valdi är ett hål man stoppar handen i.** För lögndetektorn sitter hålet
på ett **LÖGNDETEKTOR-bord/konsol** i Valvet. Man står mittemot (förstapersons-vy).
Hand i hål → ringen tänds **grön och pulserar** (+ MQTT-förstärkning utanför skärmen);
medan aktiv pulserar/bippar det i 20 s; koppla ifrån → **vitt ljussken** → avaktiverad.

Behövs: **1 grundbild** + **3 klipp från samma bas** (aktivering / pulsering / avaktivering).
Kamera LÅST i alla tre så de klipper ihop sömlöst (vilande → aktiv → vilande).

Grundad i Valvets etablerade look (Förhandlingen-bild + riggen): underjordiskt
Cold-War-bunkervalv, grov mörk sten/betong, X&Y-militärgrön metall, varmt rörljus +
kalla skuggor, lätt dis, analog retro-teknik, grön-fosfor-CRT, svensk stencil-text.

---

## A) GRUNDBILD — tre förslag (gpt-image-1, 16:9, inga människor/händer)

**Gemensam stil (klistra in i var och en):**
> Retro-futurist underground Cold-War bunker vault ("Valvet"): rough dark stone and
> concrete walls, chunky industrial military-green painted metal, warm tungsten strip
> lighting with cold shadows, faint haze, analog retro-tech, green phosphor CRT glow,
> worn Swedish stencil lettering. First-person point of view of a person standing at
> the device, looking slightly down at it. No people, no hands in frame. Photoreal,
> cinematic, shallow depth of field, 16:9.

**Förslag 1 — Analog polygraf-pult (klassisk lögndetektor) — ✅ VALD (hålet RAKT FRAM):**
> POV standing at a heavy olive-green military polygraph lie-detector console in an
> underground vault bunker. On the desktop: a row of four round analog gauges labelled
> BLODTRYCK, PULS, ANDNING, HUDKONDUKTANS; to the left a paper polygraph drum with thin
> steel needles; to the right a boxy Siemens oscilloscope showing a flat green trace.
> "LÖGNDETEKTOR" stencilled on the cabinet front. 
>
> KEY DETAIL — the HAND-PORT: a large circular opening set into an UPRIGHT VERTICAL PANEL
> that rises just behind and above the row of gauges, FACING THE VIEWER HEAD-ON. A person
> inserts their hand straight FORWARD (horizontally) into the dark round bore — it is NOT
> a hole in the horizontal desktop and you do NOT reach downward. The port has a brushed-
> steel bezel, the bore receding back into the panel.
>
> IMPORTANT — the LED RING: recessed just inside the mouth of the bore, set into the inner
> wall, is a continuous RING OF SMALL INDIVIDUAL LED SEGMENTS (like a NeoPixel / WS2812 LED
> ring) — currently DARK AND UNLIT, clearly visible as a circle of tiny dormant dots around
> the inner rim. The very centre of the bore stays pure black. This ring is the only thing
> that will light up later, so it must read as a distinct physical ring of little LEDs.
>
> Behind: the Valvet bunker — rough dark stone walls, a round vault door marked "VALVET"
> with three crowns far back, warm tungsten strip light, faint haze. Photoreal, cinematic,
> shallow depth of field, 16:9. No people, no hands in frame. Quiet, powered-down mood.

**Förslag 2 — Valdi-altare (minimalt, rituellt):**
> A dark monolithic pedestal rising from the bunker floor — a smooth gunmetal altar with
> a single recessed circular HAND-PORT at its top, ringed by one clean ring (dormant,
> faint standby glow). Minimal, ominous, ritualistic — "one of many Valdi hand-ports in
> the Valvet." A small stencilled plate reads "LÖGNDETEKTOR". Rough stone walls and a
> distant round green vault door blurred behind. Powered-down, expectant mood.

**Förslag 3 — Inbyggd bunkerkonsol-station:**
> A built-in wall console station set into the bunker concrete — a chunky green control
> panel with several recessed ports, dials and a boxy green-phosphor CRT. One central
> circular HAND-PORT (dark hole, concentric metal ring with dormant LEDs) is clearly the
> active one, with "LÖGNDETEKTOR" stencilled on a yellow-edged plate above it. Pipes,
> cables, warning decals and Swedish wall text around. Warm strip light overhead. Waiting,
> unpowered mood.

> Tips: generera grundbilden, välj EN, och mata den bilden till Runway (image-to-video)
> för alla tre klippen så basen är identisk och klippen cuttar sömlöst.

---

## B) RUNWAY-KLIPP (gen4_turbo, image-to-video från vald grundbild)

Gemensamt: **kameran helt låst, ingen kamerarörelse, inga händer, inga människor.**

> **LED-KRAV (viktigt):** ringens beteende ska kunna speglas av en riktig LED-strip/-ring,
> så håll det till LED-primitiv — **sekventiell "chase" runt ringen, solid färg,
> brightness-andning (pulse), hel vit blixt, färgbyte grön/röd/vit.** Glöd ur hålet, dis,
> nål-rörelse och CRT-vågen är **skärm-grädde** (LED:en behöver ej följa dem); det är
> RINGENS färg + ljusstyrka som LED-stripen speglar. Undvik effekter en LED inte kan göra.

> **LOKALISERA EFFEKTEN:** referera ENBART LED-ringen inne i hålet, och säg uttryckligen att
> inget annat ändras. Nämn INTE att nålar/CRT/metall reagerar (det är det som får Runway att
> spreja grönt överallt). Håll glöden instängd i ringen + den inre randen av hålet.

**Klipp 1 — AKTIVERING / införande (~4 s, spelas en gång):**
> Locked-off camera, no movement. ONLY the ring of small LED segments recessed inside the
> mouth of the hole changes: the individual LEDs ignite one after another around the ring (a
> green chase travelling once around) and settle to a steady solid green. The light stays
> strictly contained to that LED ring and the inner rim of the bore. Everything else — the
> gauges, needles, polygraph drum, oscilloscope, the green metal panel, the room — stays
> EXACTLY as in the source image, with absolutely NO other green light, glow or colour change
> anywhere in the frame. No hands, no people.

**Klipp 2 — PULSERING (~5 s, sömlös loop):**
> Locked-off camera, no movement. ONLY the ring of LED segments inside the hole changes: the
> green ring breathes, brightening and dimming evenly in a calm pulse, light contained to the
> ring and the inner rim. Everything else is identical to the source image — no colour spill,
> no other element reacts. Perfectly seamless loop, first and last frame identical. No hands,
> no people.

**Klipp 3 — AVAKTIVERING (~3 s, spelas en gång):**
> Locked-off camera, no movement. ONLY the ring of LED segments inside the hole changes: the
> ring flashes once to white, then fades down to off/dark. The flash stays contained to the
> ring and the inner rim — it does NOT wash the whole frame. Everything else stays EXACTLY as
> the source image, no other light or colour change. Ends dormant. No hands, no people.

Reveal (kan lösas i kod ovanpå puls-klippet, rena LED-primitiv): **solid grön + lugn puls =
klarade**; **röd blink = nekar**.

---

## C) Ljud (förslag)
Befintliga kandidater: `sfx-hatch-open`, `sfx-headset`, `sfx-boot`, `sfx-positive`,
`sfx-bip-start`. Rekommendation: generera en dedikerad trio (som valv-sfx:en) —
`sfx-valdi-activate` (stigande power-up + rington), `sfx-valdi-pulse` (subtil
periodisk bipp under taltiden), `sfx-valdi-deactivate` (vit-sken-whoosh ner).

---

## D) Tutorial-runda — lögn-seed (förslag)
Övningen lär ut mekaniken (säga på tur, 20 s, mätaren) + att göra lögnen **levande**.

**Rekommenderad (med story så det är lätt att ta ställning):**
> "I morse skulle ni lämna in en **bokrecension** ni haft **tre veckor** på er med. Du har
> inte skrivit ett enda ord. Nu står du framför läraren som sträcker fram handen efter den.
> **Ljug ihop en trovärdig ursäkt** för varför den inte är klar — övertyga Valdi."

Konkret nog att hugga tag i (vilken läxa, hur länge, vem man står inför) men lämnar allt
*varför* åt deltagaren att hitta på. Belönar detaljer (krånglande skrivare, sjukt syskon,
borttappad bok …) framför "jag glömde".

- Alt: "Du lovade läraren igår att läxan skulle vara klar idag. Den är inte det. Ljug ihop
  varför — och varför just idag."

---

## E) System (samma som människotestet)
3 deltagare en i taget, **20 s var**, pipelinad /assess, sammanvägt utlåtande, samma
**förtroendebarometer** (dold 0–10 `overtygande` → 0–100, tre zoner, start 50, förlust
≤30). 5 lögn-seeds (Pixel / YouTuber / London / jonglera / utflykt) + övningen ovan.
Ingen valvrums-dörr — Valdi-hålet är hela den visuella ryggraden; revealen = ringen
grön (klarade) / röd (nekar) + mätaren + utlåtandet.

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

**Förslag 1 — Analog polygraf-pult (klassisk lögndetektor) — ✅ VALD:**
> A heavy olive-green metal lie-detector console desk. At its center a recessed circular
> HAND-PORT — a dark round hole ringed by concentric brushed-steel rings with embedded
> indicator LEDs, currently DORMANT and unlit. Beside it an analog polygraph drum with
> thin steel needles resting flat, round pressure gauges, toggle switches, and a small
> green-phosphor CRT showing a flat idle line. The desk front is stencilled "LÖGNDETEKTOR"
> in worn Swedish lettering. The Valvet bunker recedes into warm-lit haze behind. Quiet,
> waiting, powered-down mood.

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

**Klipp 1 — AKTIVERING / införande (~4 s, spelas en gång):**
> Locked-off camera, no camera movement. The dormant hand-port comes alive: the ring LEDs
> ignite SEQUENTIALLY around the ring (a bright green chase travelling once around) and
> settle to a solid steady green. A soft green glow rises from inside the hole, the analog
> needles twitch awake and the CRT line jumps into a live waveform, a wash of green light
> spreads across the metal. Ends on a steady fully-lit green ring. Subtle haze. Photoreal,
> cinematic. No hands, no people.

**Klipp 2 — PULSERING (~5 s, sömlös loop):**
> Locked-off camera, no movement. Steady activated state: the solid green ring BREATHES —
> brightening and dimming evenly in a calm rhythmic pulse (uniform around the ring) — a
> small indicator lamp blinks steadily, the CRT waveform ripples gently, soft mist drifts.
> Perfectly seamless loop, first and last frame identical. Calm, tense, alive. No hands,
> no people.

**Klipp 3 — AVAKTIVERING (~3 s, spelas en gång):**
> Locked-off camera, no movement. The connection releases: the whole ring flashes to FULL
> WHITE at once (a quick bright bloom that washes the frame), then the ring fades down to
> off; needles settle flat, the CRT returns to a dim idle line. Ends fully dormant, matching
> the powered-down base image. Photoreal, cinematic. No hands, no people.

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

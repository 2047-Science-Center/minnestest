# Levandegör-förslag — Minnestestet (FLYKTEN)

Produktionsförslag för att göra upplevelsen levande, per gren, med **copy-paste-färdiga prompts**.
Inget är genererat än — detta är underlag för Josefs ja/nej innan asset-produktion.

**Tillgängliga nycklar:** OpenAI (bildgen `gpt-image-1`) + ElevenLabs (tal + SFX). **Ingen Runway/Replicate-nyckel** → alla Runway-förslag är flaggade `[RUNWAY/manuellt]`.

**Befintliga bilder** (`public/media/`): `steg1_bil`, `steg2_trafik`, `steg3_skrot`, `intro_fermi`, `flykt_1_packa`, `flykt_2_vagar`, `flykt_3_skog`, `esk1–3_berakning`. Alla är rena och användbara → grundförslaget är **behåll bilderna, lägg till ljud + rörelse**. Regen-prompts finns för den som vill ha starkare bärnstens-CRT-kohesion. (`Assets/Metodspecialist/minne-1..7` = tidigare leverans, kan användas som alternativa fermi-visuals — be mig jämföra om du vill.)

---

## 1. Koncept per gren

**Metodspecialist (fermi) — "mätsekvens, inget narrativ."**
Ingen story; känslan är *precision och verktyg*. När den riktiga uppgiften kommer fram delas den i tre tydliga mätmoment, och varje moment *materialiseras*: bilden sveper in (clip-path-wipe + lätt skala), en kort mekanisk mät-SFX landar, och frågan tonar in strax efter. Rytm: *verktyg slår an → mät → nästa*. Allt in-app, ingen video.

**Doktorand (flykt) — "du är med i flykten."**
Här bär stämningen allt. Varje scen får en **loopande ambiens-SFX** (eld, väg, skog) som ligger lågt under tänk-högt, en **svag levande bakgrundsbild** (Ken Burns-rörelse, in-app), och en **kort röstreplik** som drar in gruppen i stunden ("Vi måste fly — vad tar vi med oss?"). Video (Runway) är ett *uppgraderingsspår*, inte ett krav.

---

## 2. Metodspecialist (fermi) — scen för scen

| Moment | Ljudsättning (ElevenLabs SFX-prompt) | Bild | Rörelse / reveal (in-app, Emil) | Röst (valfri, ENHETEN-ton) |
| --- | --- | --- | --- | --- |
| **Steg 1** — "Hur mycket väger en vanlig bil?" | `Short mechanical weighing-scale clunk settling to rest, a single metallic weight dropping onto a plate, subtle retro CRT confirmation beep, clean and dry, 1.5 seconds` · `duration_seconds=1.5, prompt_influence=0.6` | Behåll `steg1_bil` *(valfri regen → nedan)* | Bilden sveper in vänster→höger: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, samtidigt `scale(1.04)→1.0` + `opacity 0→1`. 600 ms, `cubic-bezier(0.23,1,0.32,1)`. Frågetexten staggrar in 120 ms efter bilden (`translateY(8px)→0`). | "En bil. Börja där." |
| **Steg 2** — "Hur många skrotas i Sverige/år?" | `Rapid digital counter ticking upward, dozens of soft mechanical clicks accelerating then settling, retro computer data-crunch, 2 seconds` · `duration_seconds=2, prompt_influence=0.5` | Behåll `steg2_trafik` | Samma wipe, men **snabbare + tätare stagger** (känsla av mängd): bilden i 450 ms, därefter kan en liten räknar-vinjett (siffror som tickar) ligga i hörnet. | "Nu hela landet. Ett helt år." |
| **Steg 3** — "Hur mycket väger allt?" | `Deep accumulating metallic rumble rising into a heavy hydraulic press stamp, final resonant clunk, the weight of a mountain, 2.5 seconds` · `duration_seconds=2.5, prompt_influence=0.6` | Behåll `steg3_skrot` | Wipe **nerifrån och upp** (`inset(100% 0 0 0)→0`) så berget "byggs" — matchar innehållet. 700 ms, samma kurva. | "Väg ihop allt." |

**Valfria regen-prompts (OpenAI `gpt-image-1`, 1536×1024 ≈ 16:9), för starkare bärnstens-CRT-kohesion:**
- Steg 1: `A single ordinary modern car, three-quarter view, centered, clean studio emptiness, rendered through a warm amber CRT monitor: soft scanlines, phosphor glow, slight vignette, dark near-black green background. Retro-terminal sci-fi, high clarity, no text. 16:9.`
- Steg 2: `A dense mass of cars — highway traffic seen from above fading into countless vehicles, suggesting a whole nation's fleet, warm amber CRT phosphor look, scanlines, dark background, retro-terminal, no text. 16:9.`
- Steg 3: `A towering mountain of crushed scrap-car cubes stacked into the sky, dusk, monumental scale, warm amber CRT phosphor glow, scanlines, vignette, retro-terminal sci-fi, no text. 16:9.`

---

## 3. Doktorand (flykt) — scen för scen

| Scen | Ljudsättning (ElevenLabs SFX, **loop**) | Bild | Rörelse (in-app) | Röstreplik (SV, ElevenLabs TTS) |
| --- | --- | --- | --- | --- |
| **Övning — huset brinner** *(ingen bild än)* | `Crackling house fire with a low roar, distant muffled smoke alarm, faint urgent commotion, tense and enclosed, seamless loop, 8 seconds` · `loop=True, duration_seconds=8` | **Ny bild** (regen nedan) | Ken Burns: `scale(1.0→1.08)` + lätt pan, 20 s `ease-in-out` alternate. Eldglöd kan pulsera svagt via `filter: brightness`. | "Det brinner! Vi måste ut — vad tar vi med oss?" |
| **Steg 1 — packa** | `Hurried indoor packing at dusk, bag zippers and quick footsteps, muffled distant sirens through walls, tense but contained, seamless loop, 10 seconds` · `loop=True, duration_seconds=10` | Behåll `flykt_1_packa` | Ken Burns långsam in-zoom, svag i bakgrunden (skarpt läge). | "Vi hinner inte med allt. Vad är viktigast?" |
| **Steg 2 — vägarna** | `A crowded road of fleeing people and slowly rolling cars at dusk, distant engine hum, low murmur of a crowd, wind, seamless loop, 10 seconds` · `loop=True, duration_seconds=10` | Behåll `flykt_2_vagar` | Ken Burns svag sidopan (känsla av rörelse framåt på vägen). | "Vägen är full av folk. Hur tar vi oss fram?" |
| **Steg 3 — skogen** | `Quiet forest edge at dusk, wind through trees, distant low rumble, first crickets, an uneasy calm, seamless loop, 10 seconds` · `loop=True, duration_seconds=10` | Behåll `flykt_3_skog` | Ken Burns mycket långsam, nästan stilla (lugnet). | "Vi kommer inte längre ikväll. Vad gör vi först?" |

**Röst-karaktär (flykt):** INTE ENHETEN (den är mönstrings-AI:n). Använd en **separat, varm men stressad medmänniska** — en i familjen/gruppen. ElevenLabs: välj en mänsklig svensk röst, `stability ~0.4` (lite liv/nerv), `style` lågt, replikerna korta och andfådda. (ENHETEN behålls för bedömnings-/ceremoni-rösten.)

**Ny övningsbild (OpenAI, 1536×1024):**
`Interior of a modern home at night glowing orange from a fire just outside the windows, smoke haze near the ceiling, a half-packed bag on the floor, sense of urgency, cinematic, warm amber CRT phosphor grade with subtle scanlines and vignette, dark tones, no people's faces visible, no text. 16:9.`

**Uppgraderingsspår — video `[RUNWAY/manuellt]`** (om RUNWAY_API_KEY läggs in, annars manuellt i Runway, eller hoppa över):
- Övning/eld: `Cinematic slow push-in on a dim room lit orange by fire outside the window, embers drifting, smoke haze, dusk war atmosphere, subtle handheld drift, seamless loop, 7s.`
- Steg 1–3: image-to-video från respektive `flykt_*`-bild, `subtle living motion, drifting smoke / moving crowd / swaying trees, seamless loop, 6s`.
- **Alternativ utan Runway (körbart nu):** generera **3 OpenAI-bilder per scen** (t.ex. packa: väska öppnas → fylls → stängs) och korsa in dem i appen (crossfade 400 ms + Ken Burns) → mini-sekvens utan videomodell.

---

## 4. Körbart nu vs kräver Runway

| Spår | Nyckel | Status |
| --- | --- | --- |
| SFX per scen (mät-ljud + loopande ambienser) | ElevenLabs | ✅ Körbart nu |
| Röstrepliker (flykt-manus) | ElevenLabs TTS | ✅ Körbart nu |
| Bild-regen / ny övningsbild / 3-bilders-sekvenser | OpenAI `gpt-image-1` | ✅ Körbart nu |
| In-app reveal (clip-path-wipe, stagger) + Ken Burns-loop | — (kod) | ✅ Körbart nu (kodagent) |
| Levande videoklipp 5–10 s | Runway | ⛔ Saknar nyckel → manuellt, eller lägg in `RUNWAY_API_KEY` |

---

## 5. Rekommenderad minsta-insats-väg (mest känsla, minst produktion)

1. **SFX först** — de fyra loopande flykt-ambienserna + de tre fermi-mätljuden. Störst känslolyft för minst jobb; läggs i `public/Sound/` och triggas av stegbytet.
2. **In-app rörelse** — Ken Burns på flykt-bilderna (skarpt läge) + clip-path-reveal på fermi-stegen. Ren kod, inga assets.
3. **Fyra röstrepliker** per gren (flykt-manuset ovan; fermi valfritt/neutralt).
4. **Ny övningsbild** (eld) via OpenAI — enda bilden som faktiskt saknas.
5. **Hoppa över video/Runway** tills vidare; ta 3-bilders-crossfade om en scen känns platt.

Detta ger "du är med i flykten"-känslan och "precisions-mätsekvensen" utan en enda videomodell. Video blir ett senare uppgraderingssteg.

---

### Nästa steg
Säg **ja till det du vill ha**, så kan asset-produktionen köras (ElevenLabs SFX/röst + OpenAI-bilder via API), och kod-reveal/Ken Burns läggs av kodagenten. Vill du ha Runway-kedjan också: lägg in `RUNWAY_API_KEY` i `server/.env` och välj modell (Gen-3/Gen-4), så kan hela ljud→bild→klipp-kedjan köras här.

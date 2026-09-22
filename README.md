# Minnestestet — trestegs resonemangsstation (X&Y)

En spelbar station i X&Y-riggen, ombyggd från "memorera → återge" till en
**trestegs resonemangsstation**: en grupp (~3) tänker högt om en vardagsnära kris
i tre eskalerande steg, AI:n bedömer *tänkandet* per steg och svarar som en NPC,
och de får en **slutpoäng 1–10** som avslöjas som en stigande skala.

Byggd ovanpå Förhandlingens gemensamma **`station-kit`** (Lager A) + det
generella JSON-drivna **`/assess`**-anropet (per-steg + deterministisk
final-compose). Metodspecialist/ström byggs skarpt; doktorand/internet speglas
(stubbad copy, samma motor).

## Kör lokalt

Två processer: frontend (Vite) + gateway (Node/Express mot OpenAI).

```bash
npm install

# 1) gateway — kräver en nyckel:
cp server/.env.example server/.env      # fyll i AI_API_KEY=sk-...
npm run gateway                         # http://localhost:8787

# 2) frontend (nytt terminalfönster):
npm run dev                             # http://localhost:5173
```

`/assess` byggs **på riktigt** (ingen mock av AI:n). Utan nyckel svarar gatewayen
500 och stationen faller tillbaka på en neutral NPC-rad så flödet ändå går att
spela igenom — men den skarpa bedömningen kräver `server/.env`.

## Struktur

| Del | Var | Not |
|---|---|---|
| Lager A — kit | `src/station-kit/` | Kopierat från Förhandlingen. Generiskt: tema, `Teletype`, `StepShell`, i18n, adaptrar, **`capture/useSpeechCapture`**, **`adapters/assess`**, **`adapters/speak`**. Station-copy bor ALDRIG här. |
| Lager B — station | `src/stations/minnestest/` | Store (tillståndsmaskin), komponenter, i18n-copy, media-manifest. |
| Gateway | `server/` | `/assess` per-steg + final-compose. `configs/minnestest.json` + `instructions/*.txt`. Slutpoäng i `lib/scoring.js` (deterministisk, enhetstestad). |

## Byt/lägg till utan att röra anropskoden

- **Ny station/scenario:** ny `server/configs/<id>.json` + `instructions/*.txt`,
  ny scenario-data i `src/config.ts` + i18n/manifest. Anropskoden återanvänds.
- **Byt API-nyckel:** ändra `AI_API_KEY` i `server/.env`. Ingen kodändring.
- **Byt modell:** `model` i configen, eller `meta.modelOverride` för benchmark.
- **Pilot → drift:** `config.mode` (`pilot`/`production`) + bas-URL. Resultat-sömmen
  (`station<N>/result` + `/done`) är byte-för-byte identisk med Förhandlingen men
  **avstängd** i pilot (`MockResultSink`); `result_value` = slutpoängen.

## Test

```bash
npm run test        # slutpoäng-beräkning (band→poäng+bonus+clamp) + assess-adapterns kontraktsform
npm run typecheck   # vue-tsc
```

## Media

Alla mediaslots renderas som placeholders (`[VIDEO: id — brief]`) tills riktig
media droppas i `public/media/` och pekas ut i
`src/stations/minnestest/media/manifest.ts`. Layout färdig, media utbytbar.

## Inte byggt nu (avsiktligt)

Skarp MQTT/WS/RFID/firmware (bara stubbar mot frysta former), centralt
poäng-/identitetssystem, deploy, könssiffrans slut-reveal (ligger i rundans
final), doktorandsidans färdiga copy/klipp. `/speak` är stubbad.

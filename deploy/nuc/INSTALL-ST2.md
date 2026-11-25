# Installation: station 2 (skalet + Människa eller maskin / Lögndetektorn) på en stations-NUC

För en **station 2-NUC** som är Mint-installerad och som du når över **Tailscale/SSH**. Allt installeras nu på
2047-nätet. I Borlänge kopplar du bara in NUC:en i Teltonika-routern ([längst ned](#i-borlänge)).

**Så hänger det ihop:**
- **Skalet** (`minnestest`, kiosken på `:8080`) äger entrén, rollvalet, rotationen, resultatet, ljuset och leken.
- Efter entrén öppnar skalet **sidans spel** i helskärm. Spelet körs som en egen tjänst på samma NUC:

| Sida | Spel | Repo | Tjänst | Port |
|---|---|---|---|---|
| **A** | Människa eller maskin (2 lurar nu, antal spelare väljs på skärmen) | `manniska-eller-maskin` | `st2-mem` | 8796 |
| **B** | Lögndetektorn (1 lur + VALdi-hålet) | `forhoret` | `st2-logn` | 8798 |

- **Repona är syskonmappar** i hemkatalogen: `~/minnestest`, `~/manniska-eller-maskin` och `~/forhoret`.
- **Allt startar av sig självt vid boot:** spelet och skalets server är systemd-tjänster med `Restart=always`, och kiosken är en user-tjänst.
- **Brokern** anges en gång i skalets env. Skalet skickar den vidare till spelet med `?mqtt=`, och ingen IP finns i koden.

Kör uppifrån och ned över SSH på NUC:en. `🖥️ KÖR` = klistra in exakt. `✅` = kontroll. På en NUC med båda sidorna
skriver du **`AB`** där det står `A`. På sida B:s egen NUC skriver du **`B`**.

> **En NUC eller två?** Guiden fungerar för båda. **En NUC med två skärmar** kör båda sidorna: `SIDA=AB` ger två
> kioskfönster, sida A på vänster skärm och sida B på höger, med ljud och lurar per fönster. Det installerar du med
> `st2-spel.sh install AB`. **En NUC per sida** fungerar som förut med `SIDA=A` respektive `SIDA=B`.

**Lurarna (2026-11-25):** varje lur blir en **egen namngiven ljudenhet**, bunden till sitt USB-uttag:
`XY-lur-A1`, `XY-lur-A2` (och `XY-lur-A3` om en tredje sitter i) samt `XY-lur-B`. Människa eller maskin lyssnar
per tur **bara på den aktiva spelarens lur** och räknar bara ord när den luren låter mest (överhörningen mellan
lurar är cirka 30 dB). Lögndetektorn hör bara `XY-lur-B` och spelar VALdis frågor i den. Ingen mixning: den gamla
mixen `xy_mik_A` fastnade i PipeWire och gav tyst mik. Skriptet är `st2-ljud.sh`, och kiosken kör det själv före Chrome.

---

## Steg 1: Logga in på NUC:en
🖥️ KÖR (från din Mac):
```bash
ssh <användare>@<nuc-namnet-i-tailscale>
```
✅ Du får en prompt på NUC:en.

## Steg 2: Grundverktyg (git, gh, Node 20, Google Chrome)
🖥️ KÖR:
```bash
sudo apt update && sudo apt install -y git curl gh python3 pulseaudio-utils
```
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
```
```bash
cd /tmp && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y ./google-chrome-stable_current_amd64.deb
```
✅ `node -v` visar `v20.*` och `google-chrome-stable --version` visar ett nummer. Det måste vara **officiella Chrome**, eftersom talfångsten inte fungerar i Chromium.

## Steg 3: GitHub (privata repon) och skalet
🖥️ KÖR:
```bash
gh auth login
```
Välj **GitHub.com → HTTPS → Yes → Login with a web browser**. Öppna länken på din Mac och skriv koden.
```bash
cd ~ && gh repo clone 2047-Science-Center/minnestest
```
✅ `ls ~/minnestest/deploy/nuc` visar bland annat `st2-spel.sh` och `INSTALL-ST2.md`.

## Steg 4: Nycklar (för hand, aldrig i git)
Båda spelen läser automatiskt skalets nyckelfil (`../minnestest/server/.env`), så en fil räcker.
🖥️ KÖR:
```bash
nano ~/minnestest/server/.env
```
Skriv in de här raderna (värdena har du), spara med Ctrl+O och Enter, och stäng med Ctrl+X:
```
AI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

| App | Kräver |
|---|---|
| Människa eller maskin | `AI_API_KEY` (maskinen + domaren). VALdis röst är förinspelad, så ElevenLabs behövs inte. |
| Lögndetektorn | `AI_API_KEY` (bedömningen, live-mätaren) + `ELEVENLABS_API_KEY` (VALdis dynamiska repliker) |
| Skalet | `AI_API_KEY` (+ `ELEVENLABS_API_KEY`). Används bara av de gamla rumsspelen (`?spel=gammalt`). |

Vill du ha egna nycklar per spel lägger du dem i `~/manniska-eller-maskin/server/.env` respektive `~/forhoret/server/.env` efter steg 6. De går före skalets.

✅ `grep -c = ~/minnestest/server/.env` visar `2`.

## Steg 5: Brokern (riggens adress, via env)
🖥️ KÖR:
```bash
echo 'VITE_MQTT_URL=ws://192.168.10.10:9001' > ~/minnestest/.env.production.local
```
Filen är gitignorerad (`*.local`). Det är riggens broker i Borlänge.
> **På 2047-nätet nu** finns ingen `192.168.10.10`, så MQTT kopplar inte upp förrän i Borlänge. Spelen fungerar
> ändå: lurar, AI och röst. Det som saknas på 2047 är rotationen från regi, ljuset (`station2/underglow`) och
> VALdi-ringen. Peka inte om till husbrokern i riggen (CLAUDE.md, "Kopiera ALDRIG in i riggen").

✅ `cat ~/minnestest/.env.production.local` visar raden.

## Steg 6: Installera skalet och spelet
🖥️ KÖR:
```bash
cd ~/minnestest && bash deploy/nuc/install.sh
```
Bygger skalet och installerar `minnestest-server` (:8080) och kiosk-tjänsten.
```bash
bash deploy/nuc/st2-spel.sh install A
```
Klonar `manniska-eller-maskin` bredvid skalet, bygger den och installerar `st2-mem` (:8796). På sida B blir det `forhoret` och `st2-logn` (:8798).

✅ Skriptet skriver `Servern svarar på http://localhost:8080 ✓` och `Människa eller maskin svarar på http://localhost:8796 ✓`.
Kontrollera när som helst med:
```bash
bash deploy/nuc/st2-spel.sh status A
```

## Steg 7: Sida och lurar (`kiosk.env`)
🖥️ KÖR:
```bash
nano ~/minnestest/deploy/nuc/kiosk.env
```
1. Ta fram lurarnas USB-uttag:
   ```bash
   bash ~/minnestest/deploy/nuc/st2-ljud.sh lista
   ```
   Varje lur syns som en `IN`- och en `UT`-rad med `port: pci-…-usb-0:2.2:1.0`. Vet du inte vilken lur som är
   vilken: `xy-lurtest/lurar.sh identifiera` piper i en lur i taget. **Koppla aldrig om lurar slarvigt** medan
   NUC:en är igång. En dongel med glapp kan frysa all USB (se `xy-lurtest`).
2. Skriv in en unik bit av **porten** per lur. Lur 1 och 2 räknas från vänster.

**En NUC, båda sidorna** (två skärmar):
```
SIDA=AB
LUR_A1=usb-0:2.2:
LUR_A2=usb-0:2.4:
LUR_B=usb-0:2.3:
EXTRA_QUERY_B=lur=XY-lur-B
```
- Vänster skärm blir sida A och höger skärm sida B. Det avgörs av `xrandr`, men kan tvingas med `POS_A=0,0` och `POS_B=1920,0`.
- Touch per skärm: `OUTPUT_A=DP-1`, `OUTPUT_B=DP-3`, `TOUCH_PATH_A=…` och `TOUCH_PATH_B=…`. Skärmnamnen tar du ur
  `xrandr --listmonitors`, och ID_PATH ur Undersökningens `deploy/nuc/find-touch.sh`.
- **Allt appljud går i telefonlurarna, inte i skärmarna** (Josef 2026-11-25). Sida A spelar i alla A-lurar via
  utgången `XY-lurar-A`, och sida B i B-luren via `XY-lur-B`. Bara utgångarna kombineras, mikrofonerna mixas aldrig.
  Ska ett fönster låta någon annanstans sätter du `SINK_A=…` eller `SINK_B=…` (`pactl list short sinks`).
- **`ST2_URL=direkt`** öppnar spelen direkt (:8796 och :8798) utan skal och entré. Använd det för bänktest utan
  broker, eftersom skalets entré synkar sidorna över brokern. Utan raden (`skal`) öppnas skalet, som i riggen.

**En NUC per sida:**
```
SIDA=A
LUR_A1=usb-0:2.2:
LUR_A2=usb-0:2.4:
```
```
SIDA=B
LUR_B=usb-0:2.3:
EXTRA_QUERY=lur=XY-lur-B
```

Lurvolymen sätts av `st2-ljud.sh`: 100 % ut och 50 % in, eftersom JieLi-donglarna startar på 40 %. Ändra med
`LUR_VOL_UT` och `LUR_VOL_IN`. `AUDIO_SINK` och `MIC_SOURCE` behövs inte längre för lurarna.

✅ Kör:
```bash
bash ~/minnestest/deploy/nuc/st2-ljud.sh koppla
```
Den listar `in xy_lur_A1`, `in xy_lur_A2`, `in xy_lur_B`, `ut xy_lurar_A` och `ut xy_lur_B_ut`.
Kopplingarna försvinner vid omstart, men kiosken kör `koppla` själv innan Chrome startar.

## Steg 8: Kiosken startar av sig själv
Kiosken kräver autologin till en X11-session. Antingen:
- **Ren kiosk** (rekommenderas):
  ```bash
  bash ~/minnestest/deploy/nuc/setup-xorg.sh
  ```
  Den ger Xorg, openbox och autologin, utan skrivbord.
- **Eller** behåll skrivbordet och slå på autologin. Se `NUC-INSTALL.md` §4.

Starta om:
```bash
sudo reboot
```
✅ Efter omstarten visar skärmen skalets start, alltså "Ställ er på rätt sida" och sidans bild.

## Steg 9: Testa hela vägen
1. Gå igenom entrén och rollvalet. Skalet öppnar spelet i helskärm.
2. **Sida A:** välj antal spelare på titelskärmen (2 är förvalt). Lyft lur 1 när den har tur och prata. Texten ska
   skrivas på pappret. Prata sedan i lur 2 medan lur 1 har tur: inget ska skrivas.
3. **Sida B:** Lögndetektorns scenariofilm spelas, och frågan hörs i B-luren. Prata i A-lurarna under ett svar:
   inget ska skrivas.

✅ Fungerar inte talfångsten:
- Kör `bash ~/minnestest/deploy/nuc/st2-ljud.sh status`. Alla XY-lur-enheter ska finnas.
- Öppna konsolen. Människa eller maskin loggar `[lurar] egna ingångar: XY-lur-A1, XY-lur-A2`, och Lögndetektorn
  `[talfångst] lyssnar bara på XY-lur-B`.
- Står där `standardingången` hittades inte etiketten. Kör då `koppla` igen och starta om kiosken.
- `pactl list source-outputs | grep -E "application.name|source"` visar vilken lur varje fönster har öppen.

## Bänktest utan tjänster och broker (`st2-test.sh`)
Starta båda spelen och de två fönstren utan sudo. Det kräver `SIDA=AB`, `ST2_URL=direkt` och lurarna i `kiosk.env`.
🖥️ KÖR (på NUC:en, i en terminal eller från skrivbordsikonen **Station 2 test**):
```bash
bash ~/minnestest/deploy/nuc/st2-test.sh
```
```bash
bash ~/minnestest/deploy/nuc/st2-test.sh stopp
```
Den startar spelservrarna som vanliga processer om de inte redan kör som tjänster, kopplar lurarna och öppnar
fönstren. Stäng ett fönster med Alt+F4. Loggarna finns i `/tmp/st2-*.log`.

## Uppdatera senare
🖥️ KÖR:
```bash
cd ~/minnestest && bash deploy/nuc/update.sh
```
Den gör git pull, bygger och startar om skalet och spelet som är installerat på NUC:en (`st2-mem` eller `st2-logn`).
✅ Den slutar med `Uppdaterad.`

## Loggar
```bash
sudo journalctl -u minnestest-server -f
```
```bash
sudo journalctl -u st2-mem -f
```
```bash
sudo journalctl -u st2-logn -f
```
```bash
systemctl --user status minnestest-kiosk
```

---

## I Borlänge
- **Koppla in NUC:en i Teltonika-routern.** IP-adressen **`192.168.10.12`** sätts **i routern** med en DHCP-reservation på NUC:ens MAC, se `xy-arkitektur/TELTONIKA-INSTALLATION.md` §6.3. Inget ändras i kitet.
- **Brokern** (`192.168.10.10`) står redan i `.env.production.local`, så MQTT kopplar upp av sig själv. Rotation, ljus och VALdi-ringen börjar fungera.
- **Internet behövs fortfarande** för talfångsten i Chrome, AI-anropen och ElevenLabs, alltså via routerns WAN/SIM.
- ✅ Från en laptop på rigg-nätet ska du se stationens topics:
  ```bash
  mosquitto_sub -h 192.168.10.10 -t 'station2/#' -v
  ```

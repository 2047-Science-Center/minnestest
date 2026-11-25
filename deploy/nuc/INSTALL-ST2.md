# Installation: station 2 (skalet + Människa eller maskin / Lögndetektorn) på en stations-NUC

För en **station 2-NUC** som är Mint-installerad och som du når över **Tailscale/SSH**. Allt installeras nu på
2047-nätet. I Borlänge kopplar du bara in NUC:en i Teltonika-routern ([längst ned](#i-borlänge)).

**Så hänger det ihop:**
- **Skalet** (`minnestest`, kiosken på `:8080`) äger entrén, rollvalet, rotationen, resultatet, ljuset och leken.
- Efter entrén öppnar skalet **sidans spel** i helskärm. Spelet körs som en egen tjänst på samma NUC:

| Sida | Spel | Repo | Tjänst | Port |
|---|---|---|---|---|
| **A** | Människa eller maskin (3 lurar) | `manniska-eller-maskin` | `st2-mem` | 8796 |
| **B** | Lögndetektorn (1 lur + VALdi-hålet) | `forhoret` | `st2-logn` | 8798 |

- **Repona är syskonmappar** i hemkatalogen: `~/minnestest`, `~/manniska-eller-maskin` och `~/forhoret`.
- **Allt startar av sig självt vid boot:** spelet och skalets server är systemd-tjänster med `Restart=always`, och kiosken är en user-tjänst.
- **Brokern** anges en gång i skalets env. Skalet skickar den vidare till spelet med `?mqtt=`, och ingen IP finns i koden.

Kör uppifrån och ned över SSH på NUC:en. `🖥️ KÖR` = klistra in exakt. `✅` = kontroll. Byt **`A`** mot **`B`** i alla
kommandon på sida B:s NUC.

> **Öppen fråga:** guiden förutsätter **en NUC per sida** (`SIDA=A` på den ena och `SIDA=B` på den andra), vilket är det
> skalet byggdes för 2026-11-24. Ska **en** NUC med två skärmar köra båda sidorna behövs två kioskfönster, ett per
> skärm. Det finns inte än, säg till.

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
**Sida A** (tre lurar):
1. Lägg till `SIDA=A`.
2. Ta fram lurarnas USB-portar:
   ```bash
   bash ~/minnestest/deploy/nuc/st2-ljud.sh lista
   ```
   Koppla in en lur i taget och se vilken rad som tillkommer.
3. Skriv in en unik bit av **porten** per lur, lur 1–3 från vänster till höger:
   ```
   SIDA=A
   LUR_A1=usb-0:2:1.0
   LUR_A2=usb-0:3:1.0
   LUR_A3=usb-0:4:1.0
   AUDIO_SINK=alsa_output.usb-...högtalaren...
   ```
   Kiosken mixar de tre mikarna till **en** mik (`xy_mik_A`, som standard-mik), eftersom en pratar i taget. VALdis
   röst och filmerna går till rummets högtalare (`AUDIO_SINK`, hittas med `pactl list short sinks`).

**Sida B** (en lur och VALdi-hålet):
```
SIDA=B
MIC_SOURCE=alsa_input.usb-...Opis...
AUDIO_SINK=alsa_output.usb-...högtalaren...
EXTRA_QUERY=lur=Opis
```
`MIC_SOURCE` gör lurens mik till standard. `EXTRA_QUERY=lur=Opis` gör att VALdis frågor spelas **bara i luren**, medan allt annat går till rummets högtalare.

✅ På sida A kör du `bash ~/minnestest/deploy/nuc/st2-ljud.sh koppla`. Den svarar `de tre lurarnas mikar → xy_mik_A`.

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
2. **Sida A:** öppningsfilmen spelas. Lyft lur 1 när den har tur och prata. Texten ska skrivas på pappret.
3. **Sida B:** Lögndetektorns scenariofilm spelas, och frågan hörs i luren.

✅ Fungerar inte talfångsten: kontrollera att standard-miken är rätt med `pactl get-default-source`. På sida A ska den vara `xy_mik_A`.

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

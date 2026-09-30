# FLYKTEN (Minnestestet) — installation på NUC (Linux Mint / Ubuntu)

Enskärms-kiosk: **en** Node-process (gateway) serverar både appen och `/assess` +
`/speak`, och **en** Chrome-instans i helskärm pekar på den. Uppdateras med `git pull`.

Testad på **Linux Mint (Cinnamon)** och Ubuntu. Där något skiljer sig står Mint först.

## 0. Förutsättningar
- **Internet** på NUC:en — Web Speech (talfångst), OpenAI och ElevenLabs kräver nät.
- **Node 20+**, `npm`, `curl`, `git`, `wget`. Mints apt-Node är för gammal — installera
  Node 20 från NodeSource:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs git curl wget
  ```
- **Officiell Google Chrome** (inte Chromium — Chromium på Linux saknar Googles
  röst-API-nyckel och gör då tyst ingenting i talfångsten):
  ```bash
  wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  sudo apt install -y ./google-chrome-stable_current_amd64.deb
  ```
  (Kör du `setup-xorg.sh` i steg 4 installeras Chrome automatiskt om den saknas.)

## 1. Hämta koden
```bash
cd ~
git clone https://github.com/2047-Science-Center/minnestest.git minnestest
cd minnestest
```

## 2. Lägg in nycklarna (aldrig i git)
Skapa `server/.env` på NUC:en med dina nycklar:
```bash
cat > server/.env <<'ENV'
AI_API_KEY=sk-proj-DIN_OPENAI_NYCKEL
ELEVENLABS_API_KEY=sk_DIN_ELEVENLABS_NYCKEL
PORT=8080
ENV
```
(`ELEVENLABS_API_KEY` kan utelämnas — då är NPC-rösten av, texten står kvar.)

## 3. Installera (bygg + autostart)
Från repo-roten:
```bash
bash deploy/nuc/install.sh          # bygger, installerar gateway- + kiosk-tjänst
```
Servern kör nu på `http://localhost:8080` och startar om av sig själv efter
strömavbrott.

## 4. Grafisk session (så kiosken startar av sig själv)
Kiosken är en **systemd user-tjänst** som startar när en X11-session loggar in.
Två vägar:
- **Ren kiosk utan skrivbord (rekommenderas för en fast station):**
  ```bash
  bash deploy/nuc/setup-xorg.sh      # bar Xorg + openbox + autologin, inget skrivbord
  sudo reboot
  ```
  Slår av inloggningsrutan (LightDM på Mint / GDM på Ubuntu), loggar in automatiskt
  på tty1 och bootar rakt in i FLYKTEN. Installerar även Chrome om den saknas.
- **Behåll skrivbordet:** slå på **autologin** för användaren
  (Mint: *Meny → Inloggningsfönster → Användare → Automatisk inloggning*;
  Ubuntu: *Inställningar → Användare*), så startar kiosk-tjänsten vid inloggning.
  Vill du ha en klickbar ikon i stället: `bash deploy/nuc/install-launcher.sh`.

## 5. Ljud — Anker-högtalaren (USB, med mic)
Koppla in Ankern via USB. Lista enheterna:
```bash
pactl list short sources    # mic  → kopiera namnet till MIC_SOURCE
pactl list short sinks      # ljud → kopiera namnet till AUDIO_SINK
```
Skriv in dem i `deploy/nuc/kiosk.env` (skapades av install.sh):
```
MIC_SOURCE=alsa_input.usb-Anker_...-00.mono-fallback
AUDIO_SINK=alsa_output.usb-Anker_...-00.analog-stereo
```
Kiosk-skriptet sätter dem som standard vid varje start. Testa micen:
```bash
arecord -d 3 -f cd /tmp/test.wav && aplay /tmp/test.wav
```

## 6. Touch — mappa panelen till skärmen (bara om beröringen hamnar fel)
En enskärms-station brukar mappa touchen rätt automatiskt. **Landar beröringen fel**
(förskjuten, eller styr fel yta), bind panelen till rätt skärm. Mappningen sätts vid
varje kiosk-start och är **självläkande** (sätts om efter hotplug/strömblink) — den
sitter alltså rätt igen efter en omstart.

1. Hitta skärmens namn: `xrandr --listmonitors` (t.ex. `HDMI-1`).
2. Hitta touchpanelens fysiska USB-port (håller över omstart även om id byter plats):
   ```bash
   xinput list                                   # ta touchpanelens id, t.ex. 10
   node=$(xinput list-props 10 | sed -n 's/.*Device Node[^"]*"\([^"]*\)".*/\1/p')
   udevadm info -q property "$node" | grep ID_PATH   # → t.ex. pci-0000:00:14.0-usb-0:3:1.0
   ```
3. Skriv in i `deploy/nuc/kiosk.env`:
   ```
   OUTPUT=HDMI-1
   TOUCH_PATH=pci-0000:00:14.0-usb-0:3:1.0
   ```
   (Har panelen ett unikt namn räcker `TOUCH_NAME="Panelens namn"` i stället för `TOUCH_PATH`.)
4. Testa direkt utan omstart:
   ```bash
   bash deploy/nuc/map-touch.sh "pci-0000:00:14.0-usb-0:3:1.0" HDMI-1
   ```

## 7. Kör / testa
```bash
systemctl --user start minnestest-kiosk      # om du redan är inloggad grafiskt
# eller boota om NUC:en.
```
I appen: gå till ett tänk-högt-steg → prata → transkriptet ska växa live. Facilitator-
kontrollerna (Paus / Starta om / **Avsluta**) ligger nere till vänster. **Avsluta**
stänger fönstret tillbaka till skrivbordet (kiosken körs utan `--kiosk`, så knappen
fungerar).

## 8. Uppdatera stationen
```bash
bash deploy/nuc/update.sh            # git pull + bygg + starta om
```

## 9. Fjärrstyrning (styr NUC:en från din Mac)
Installera SSH + Tailscale + RustDesk i ett svep:
```bash
bash deploy/nuc/setup-remote.sh
```
Sen når du NUC:en var den än står — terminal via SSH, skärm via RustDesk. Se
[REMOTE-ACCESS.md](REMOTE-ACCESS.md) för Mac-sidan.

## Felsökning
- **Talet registreras inte:** kör *officiell* Chrome (inte Chromium), kolla internet,
  och att `MIC_SOURCE` pekar på Ankern. `--use-fake-ui-for-media-stream` auto-godkänner
  micen så ingen dialog dyker upp.
- **Touchen styr fel yta:** se steg 6 — sätt `OUTPUT` + `TOUCH_PATH` i `kiosk.env`.
- **/assess svarar 500:** `server/.env` saknar/fel `AI_API_KEY`. Starta om:
  `sudo systemctl restart minnestest-server`.
- **Loggar:** `sudo journalctl -u minnestest-server -f` · `systemctl --user status minnestest-kiosk`
- **Ingen röst-uppläsning:** `ELEVENLABS_API_KEY` saknas/fel — icke-kritiskt, texten står kvar.

## Repo
Publikt: **https://github.com/2047-Science-Center/minnestest** — NUC:en clone:ar/
pullar utan inloggning. (Nycklarna ligger bara i `server/.env` på NUC:en, aldrig i git.)

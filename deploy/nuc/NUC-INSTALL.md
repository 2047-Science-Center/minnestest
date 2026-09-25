# FLYKTEN (Minnestestet) — installation på NUC (Ubuntu)

Enskärms-kiosk: **en** Node-process (gateway) serverar både appen och `/assess` +
`/speak`, och **en** Chrome-instans i kiosk pekar på den. Uppdateras med `git pull`.

## 0. Förutsättningar
- **Internet** på NUC:en — Web Speech (talfångst), OpenAI och ElevenLabs kräver nät.
- **Node 20+**, `npm`, `curl`, `git`.
- **Officiell Google Chrome** (inte Chromium — Chromium på Linux saknar Googles
  röst-API-nyckel och gör då tyst ingenting i talfångsten):
  ```bash
  wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  sudo apt install -y ./google-chrome-stable_current_amd64.deb
  ```

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
- **Har du redan Ubuntu-skrivbord:** slå på **autologin** (Inställningar → Användare)
  så sessionen startar utan lösenord vid boot. Klart.
- **Ren kiosk utan skrivbordsmiljö:** kör
  ```bash
  bash deploy/nuc/setup-xorg.sh      # bar Xorg + openbox + autostart, ingen GNOME
  ```

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

## 6. Kör / testa
```bash
systemctl --user start minnestest-kiosk      # om du redan är inloggad grafiskt
# eller boota om NUC:en.
```
I appen: gå till ett tänk-högt-steg → prata → transkriptet ska växa live. Facilitator-
kontrollerna (Paus / Starta om / Avsluta) ligger nere till vänster.

## 7. Uppdatera stationen
```bash
bash deploy/nuc/update.sh            # git pull + bygg + starta om
```

## Felsökning
- **Talet registreras inte:** kör *officiell* Chrome (inte Chromium), kolla internet,
  och att `MIC_SOURCE` pekar på Ankern. `--use-fake-ui-for-media-stream` auto-godkänner
  micen så ingen dialog dyker upp.
- **/assess svarar 500:** `server/.env` saknar/fel `AI_API_KEY`. Starta om:
  `sudo systemctl restart minnestest-server`.
- **Loggar:** `sudo journalctl -u minnestest-server -f` · `systemctl --user status minnestest-kiosk`
- **Ingen röst-uppläsning:** `ELEVENLABS_API_KEY` saknas/fel — icke-kritiskt, texten står kvar.

## Repo
Publikt: **https://github.com/2047-Science-Center/minnestest** — NUC:en clone:ar/
pullar utan inloggning. (Nycklarna ligger bara i `server/.env` på NUC:en, aldrig i git.)

# FLYKTEN — fjärrinstallation på en skarp NUC

Körs **per NUC**, mestadels via SSH. De grafiska stegen (knappar, touch, kiosk) görs
enklast via VNC-skärmen. Allt hämtas från `origin/main` — den stökiga byggmappen på
din Mac påverkar inte NUC:en.

> Fjärråtkomst (SSH + VNC via Tailscale) ligger i eget repo:
> `git clone https://github.com/2047-Science-Center/nuc-fjarratkomst.git ~/nuc-fjarratkomst && bash ~/nuc-fjarratkomst/setup-remote.sh`
> Terminalstegen nedan kör du i SSH-sessionen; knapp-/touch-/kiosk-stegen via VNC.

---

## 1. Förkrav (en gång per NUC)
Node 20, git och **officiell** Google Chrome (inte Chromium — Chromium saknar Googles
röst-API och gör talfångsten tyst):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs git curl wget
```
```bash
wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

## 2. Hämta koden
```bash
cd ~ && git clone https://github.com/2047-Science-Center/minnestest.git minnestest || (cd ~/minnestest && git pull --ff-only)
```

## 3. Nycklar (aldrig i git) — klistra in dina egna
Öppna filen i en editor och klistra in dina **riktiga** nycklar:
```bash
nano ~/minnestest/server/.env
```
```
AI_API_KEY=sk-proj-DIN_OPENAI_NYCKEL
ELEVENLABS_API_KEY=sk_DIN_ELEVENLABS_NYCKEL
PORT=8080
```
Spara i nano: **Ctrl+O**, **Enter**, **Ctrl+X**. (Grafisk editor på VNC: `xed ~/minnestest/server/.env`.)
Verifiera utan att visa värdena: `sed -E 's/=.*/=***/' ~/minnestest/server/.env`.
(Utelämna `ELEVENLABS_API_KEY` → NPC-rösten av, texten står kvar.)

## 4. Installera — välj läge

**Två lägen.** "Kiosk" = två saker: en autostart-tjänst (öppnar appen vid inloggning)
och `setup-xorg.sh` (bar skärm utan skrivbord, bootar rakt in i appen). Välj:

### 4A. Ingen kiosk — manuell start (behåll skrivbordet)
Servern snurrar i bakgrunden, du startar FLYKTEN med knappen när du vill, inget kapar
skrivbordet. `--server-only` hoppar över autostart-tjänsten:
```bash
cd ~/minnestest && bash deploy/nuc/install.sh --server-only
```
Skapa `kiosk.env` manuellt (knapparna + ljudet läser den; `--server-only` skapar den inte):
```bash
cp ~/minnestest/deploy/nuc/kiosk.env.example ~/minnestest/deploy/nuc/kiosk.env
```
Då: gör steg 5 (ljud) + 6 (knappar), och **HOPPA ÖVER steg 8**. Ingen autologin behövs.
Kört full `install.sh` här förut (appen autostartar)? Stäng av: `systemctl --user disable --now minnestest-kiosk.service`.

### 4B. Full kiosk (fast station som bootar rakt in i appen)
Ensam station → port 8080. Delar NUC med annan station (portkrock) → `--port 8090`.
```bash
cd ~/minnestest && bash deploy/nuc/install.sh
```
Då: gör steg 5–6 och sedan steg 8 (setup-xorg).

Verifiera (båda lägena) att servern svarar:
```bash
curl -fsS http://localhost:8080/healthz && echo OK
```

## 5. Ljud — sätt mic + högtalare som finns på plats
Kontrollera först VAD som finns inkopplat (namn + läsbar beskrivning):
```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u); echo "=== HÖGTALARE (sinks) ==="; pactl list sinks | grep -E 'Name:|Description:'; echo; echo "=== MIKROFONER (sources) ==="; pactl list sources | grep -E 'Name:|Description:'
```
`Name:` = id:t du stoppar in nedan · `Description:` = läsbart namn · hoppa över `...monitor`
(det är ingen riktig mic). `Connection refused` över SSH → kör i VNC-terminalen i stället.
Sätt dem som **standard** (byt ut namnen mot dina från listan ovan):
```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u); pactl set-default-sink NAMN_PA_HOGTALARE; pactl set-default-source NAMN_PA_MIC
```
Baka in de valda standardenheterna i `kiosk.env` (tar bort ev. gamla/utkommenterade
rader först, skriver sedan de aktiva standardvärdena — samma robusta mönster som
löste Anker-strulet):
```bash
cd ~/minnestest/deploy/nuc && sed -i '/^#* *MIC_SOURCE=/d; /^#* *AUDIO_SINK=/d' kiosk.env && printf 'AUDIO_SINK=%s\nMIC_SOURCE=%s\n' "$(pactl get-default-sink)" "$(pactl get-default-source)" >> kiosk.env && grep -E 'AUDIO_SINK|MIC_SOURCE' kiosk.env
```
Testa (Pulse/PipeWire-medvetet — inte arecord/aplay som går förbi ljudservern):
```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u); parecord --channels=1 -d 3 /tmp/t.wav && paplay /tmp/t.wav && echo 'hörde du inspelningen?'
```

## 6. De tre tryckknapparna (kör via VNC = grafisk session)
```bash
cd ~/minnestest && bash deploy/nuc/install-buttons.sh
```
Ger **FLYKTEN** (starta), **Ladda om FLYKTEN**, **Uppdatera FLYKTEN** på skrivbordet
+ i appmenyn. Första gången på Mint: högerklicka varje ikon → **Tillåt körning**
(Allow Launching). Knapparna pekar mot porten i `kiosk.env`, så 8090 funkar lika bra.

## 7. Touch — bara om beröringen hamnar fel
Enskärm brukar mappa rätt automatiskt. Landar den fel, sätt `OUTPUT` + `TOUCH_PATH` i
`kiosk.env` enligt `NUC-INSTALL.md` steg 6, och testa direkt:
```bash
bash ~/minnestest/deploy/nuc/map-touch.sh "DIN_TOUCH_PATH" HDMI-1
```

## 8. Ren kiosk + autostart (rekommenderas för fast station)
```bash
bash ~/minnestest/deploy/nuc/setup-xorg.sh && sudo reboot
```
Slår av inloggningsrutan, autologgar in och bootar rakt in i FLYKTEN. (Vill du behålla
skrivbordet: slå på autologin för användaren i stället, så startar kiosk-tjänsten vid
inloggning.)

## 9. Snabb verifiering efter boot
- Appen öppnas i helskärm, touch styr rätt yta.
- Ett tänk-högt-steg → prata → transkriptet växer live (= mic + Chrome-röst funkar).
- NPC läser upp (= ElevenLabs-nyckel OK). Ingen röst men text kvar = icke-kritiskt.

## 10. Uppdatera senare (eller tryck "Uppdatera FLYKTEN")
```bash
bash ~/minnestest/deploy/nuc/update.sh
```

## Felsökning
- **Talet registreras inte:** officiell Chrome (ej Chromium), internet, rätt `MIC_SOURCE`.
- **/assess 500:** fel/saknad `AI_API_KEY` → `sudo systemctl restart minnestest-server`.
- **pactl "Connection refused" över SSH:** kör `export XDG_RUNTIME_DIR=/run/user/$(id -u)` först (står redan i ljud-kommandona ovan).
- **Loggar:** `sudo journalctl -u minnestest-server -f` · `systemctl --user status minnestest-kiosk`

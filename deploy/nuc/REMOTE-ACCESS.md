# FLYKTEN — fjärrstyra NUC:en från din Mac

Med det här kan du nå och styra varje stations-NUC var den än står, från Macen i
Malmö — utan att öppna portar i sciencecentrets router. Tre lager:

| Lager | Verktyg | Vad du gör |
|---|---|---|
| Nätverk (nå NUC:en alls) | **Tailscale** | Privat mesh-VPN — NUC:en dyker upp med namn/IP hos dig |
| Terminal (nästan allt) | **SSH** | `update.sh`, `systemctl`, redigera `kiosk.env`, touch-mappning |
| Skärm (se & klicka) | **RustDesk** | Se kiosken, köra pavucontrol/EasyEffects, klicka i GUI |

## 1. På NUC:en (en gång)
Kör kittet — installerar SSH + Tailscale + RustDesk och skriver ut åtkomst-uppgifterna:
```bash
bash ~/minnestest/deploy/nuc/setup-remote.sh
```
Under körningen skrivs en **Tailscale-inloggningslänk** ut — öppna den och logga in med
ditt Tailscale-konto (skapa gratis på tailscale.com om du inte har ett). Namnge enheten,
t.ex. `flykten-1`.

När det är klart visas (och sparas i `~/flykten-fjarratkomst.txt`):
- **Tailscale-IP** och SSH-kommando
- **RustDesk-ID** + **lösenord**

## 2. På din Mac (en gång)
- **Tailscale:** installera från Mac App Store eller tailscale.com, logga in med
  **samma konto**. Nu ser Mac och NUC varandra.
- **RustDesk:** ladda ned Mac-appen från rustdesk.com (om du vill se skärmen).
- SSH finns redan inbyggt i Terminal.

## 3. Ansluta
**Terminal (räcker för update, omstart, config, touch-mappning):**
```bash
ssh DITTNAMN@100.x.y.z          # Tailscale-IP:t från steg 1
```
eller med Tailscale-namnet:
```bash
ssh DITTNAMN@flykten-1
```
Grafiska kommandon funkar också över SSH, t.ex. touch-mappning:
```bash
DISPLAY=:0 xinput map-to-output "NAMN" HDMI-1
```

**Skärm (se kiosken / klicka i GUI):** öppna RustDesk på Macen, skriv in NUC:ens
**ID**, tryck Anslut, ange **lösenordet**. Obevakad åtkomst är på, så ingen behöver
klicka "godkänn" på plats.

## Bra att veta
- NUC:en måste vara **på och uppkopplad**. Är den avstängd eller nätet nere når du den inte.
- **Flera stationer:** kör kittet på varje NUC och döp dem i Tailscale (`flykten-1`,
  `forhandling-1` …). Alla dyker upp i samma lista på Macen.
- **Säkerhet:** öppna aldrig portar i routern — Tailscale sköter allt krypterat.
  RustDesk-lösenordet är starkt och slumpat; byt det i RustDesk-appen vid behov.
- **Uppdatera stationen på distans:** SSH in och kör `bash ~/minnestest/deploy/nuc/update.sh`
  (eller klicka update-knappen via RustDesk).

## Felsökning
- **Når inte NUC:en:** kolla att den är online i Tailscale-panelen (login.tailscale.com);
  kör `tailscale status` på NUC:en (via skärm/lokalt).
- **RustDesk-ID saknas:** öppna RustDesk-appen på NUC:en en gång, slå på
  *Inställningar → Aktivera obevakad åtkomst*, så visas ID:t.
- **SSH nekar:** första gången kan du behöva svara `yes` på nyckel-frågan. Vill du
  slippa lösenord helt, be om att sätta upp SSH-nyckel.

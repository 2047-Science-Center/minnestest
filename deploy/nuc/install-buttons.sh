#!/usr/bin/env bash
# Skapar ALLA tre skrivbordsknappar för Minnestestet (FLYKTEN) i ett svep:
#   • FLYKTEN            — starta stationen
#   • Ladda om FLYKTEN   — stäng + starta om appen
#   • Uppdatera FLYKTEN  — git pull + bygg + starta om server & app
# Pekar mot den port/URL som står i kiosk.env (så det funkar även om stationen
# flyttats till en egen port för att inte krocka med en annan station).
#
# Kör på NUC:en som vanlig användare (inte sudo):
#     bash deploy/nuc/install-buttons.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
KIOSK="$HERE/kiosk.sh"
chmod +x "$KIOSK"

BIN="$HOME/.local/bin"
APPS="$HOME/.local/share/applications"
DESK="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
mkdir -p "$BIN" "$APPS" "$DESK"

# --- Hjälp-skript: ladda om & uppdatera (absoluta sökvägar bakas in) ---
cat > "$BIN/flykten-reload.sh" <<SH
#!/usr/bin/env bash
pkill -f '.flykten-kiosk' 2>/dev/null
sleep 1
exec "$KIOSK"
SH
chmod +x "$BIN/flykten-reload.sh"

cat > "$BIN/flykten-update.sh" <<SH
#!/usr/bin/env bash
set -e
cd "$REPO"
echo "== Hämtar senaste versionen =="
git pull --ff-only
echo "== Bygger appen =="
npm ci || npm install
npm run build:kiosk
echo "== Startar om servern (ange ditt lösenord) =="
sudo systemctl restart minnestest-server
echo "== Startar om appen =="
pkill -f '.flykten-kiosk' 2>/dev/null || true
sleep 1
nohup "$KIOSK" >/dev/null 2>&1 &
echo "KLART — uppdaterad och omstartad."
sleep 3
SH
chmod +x "$BIN/flykten-update.sh"

# --- Skapa en .desktop på skrivbord + i appmenyn, markerad betrodd ---
make_icon() {
  local file="$1" name="$2" comment="$3" exec="$4" icon="$5" term="$6"
  local tmp; tmp="$(mktemp)"
  cat > "$tmp" <<DESKTOP
[Desktop Entry]
Type=Application
Name=$name
Comment=$comment
Exec=$exec
Icon=$icon
Terminal=$term
Categories=Education;
DESKTOP
  install -m 0755 "$tmp" "$APPS/$file"
  install -m 0755 "$tmp" "$DESK/$file"
  gio set "$DESK/$file" metadata::trusted true 2>/dev/null || true
  rm -f "$tmp"
}

make_icon flykten.desktop        "FLYKTEN"           "Starta stationen (Minnestestet)" "bash \"$KIOSK\""         input-tablet           false
make_icon flykten-reload.desktop "Ladda om FLYKTEN"  "Stäng och starta om stationen"   "$BIN/flykten-reload.sh" view-refresh           false
make_icon flykten-update.desktop "Uppdatera FLYKTEN" "Hämta senaste och starta om"     "$BIN/flykten-update.sh" system-software-update true

update-desktop-database "$APPS" 2>/dev/null || true

echo "Klart — tre ikoner på skrivbordet + i appmenyn:"
echo "  FLYKTEN · Ladda om FLYKTEN · Uppdatera FLYKTEN"
echo "Första gången på Mint: högerklicka varje ikon → Tillåt körning (Allow Launching)."

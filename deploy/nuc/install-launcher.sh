#!/usr/bin/env bash
# Lägger en dubbelklicks-ikon "FLYKTEN" på skrivbordet OCH i appmenyn, så
# facilitatorn kan starta stationen utan terminal. Kör på NUC:en (som vanlig
# användare, inte sudo):
#     bash deploy/nuc/install-launcher.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIOSK="$HERE/kiosk.sh"
chmod +x "$KIOSK"

# Bygg .desktop-filen med rätt sökväg.
tmp="$(mktemp)"
sed "s|@EXEC@|bash \"$KIOSK\"|g" "$HERE/minnestest.desktop" > "$tmp"

# 1) Appmenyn.
apps="$HOME/.local/share/applications"
mkdir -p "$apps"
install -m 0755 "$tmp" "$apps/minnestest.desktop"

# 2) Skrivbordet (om det finns) + markera som betrodd så filhanteraren låter en
#    dubbelklicka (Cinnamon/Nemo på Mint, samma som GNOME/Files).
desktop_dir="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
if [ -d "$desktop_dir" ]; then
  install -m 0755 "$tmp" "$desktop_dir/minnestest.desktop"
  gio set "$desktop_dir/minnestest.desktop" metadata::trusted true 2>/dev/null || true
fi
rm -f "$tmp"

# Uppdatera menydatabasen (om verktyget finns).
update-desktop-database "$apps" 2>/dev/null || true

echo "Klart. Ikonen 'FLYKTEN' finns nu på skrivbordet och i appmenyn."
echo "Dubbelklicka för att starta stationen. Avsluta med appens ✕-knapp (nere till vänster)."

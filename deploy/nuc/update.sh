#!/usr/bin/env bash
# Uppdatera FLYKTEN på NUC:en: hämta senaste koden, bygg om, starta om.
# Kör:  bash deploy/nuc/update.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

echo "== git pull =="
git pull --ff-only

echo "== npm ci + bygg (same-origin) =="
npm ci || npm install
npm run build:kiosk

echo "== installera om user-kiosk-service (fångar service-fil-ändringar) =="
mkdir -p "$HOME/.config/systemd/user"
sed "s|@REPO@|$REPO|g" "$REPO/deploy/nuc/minnestest-kiosk.service" \
  > "$HOME/.config/systemd/user/minnestest-kiosk.service"
systemctl --user daemon-reload 2>/dev/null || true

echo "== starta om gateway + kiosk =="
sudo systemctl restart minnestest-server.service
systemctl --user restart minnestest-kiosk.service 2>/dev/null || true

# Station 2:s spel (om de är installerade på den här NUC:en): git pull + bygg + omstart.
for sida in A B; do
  tj=$([ "$sida" = A ] && echo st2-mem || echo st2-logn)
  if systemctl list-unit-files "$tj.service" >/dev/null 2>&1 && systemctl cat "$tj.service" >/dev/null 2>&1; then
    bash "$REPO/deploy/nuc/st2-spel.sh" update "$sida"
  fi
done

echo "Uppdaterad. Loggar: sudo journalctl -u minnestest-server -f  (spelen: -u st2-mem / -u st2-logn)"

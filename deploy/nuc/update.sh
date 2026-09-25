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

echo "== starta om gateway + kiosk =="
sudo systemctl restart minnestest-server.service
systemctl --user restart minnestest-kiosk.service 2>/dev/null || true

echo "Uppdaterad. Loggar: sudo journalctl -u minnestest-server -f"

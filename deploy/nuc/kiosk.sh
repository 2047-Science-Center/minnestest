#!/usr/bin/env bash
# Startar FLYKTEN i kiosk på NUC:ens skärm — EN skärm, EN Chrome-instans.
#
# VIKTIGT: Talfångsten (Web Speech) fungerar bara i OFFICIELL Google Chrome på
# Linux (Chromium saknar Googles röst-API-nyckel och gör då tyst ingenting), och
# kräver internet. URL:en måste vara http://localhost (räknas som säker kontext).
#
# Körs i en grafisk session (X11). Konfig via miljövariabler eller kiosk.env.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"

URL_BASE="${URL_BASE:-http://localhost:8080}"        # gateway-tjänsten (samma origin)
PROFILE_DIR="${PROFILE_DIR:-$HOME/.flykten-kiosk}"

# --- Hitta officiell Google Chrome ---
BROWSER="${BROWSER_BIN:-}"
if [ -z "$BROWSER" ]; then
  for b in google-chrome-stable google-chrome; do
    if command -v "$b" >/dev/null 2>&1; then BROWSER="$b"; break; fi
  done
fi
if [ -z "$BROWSER" ]; then
  echo "kiosk.sh: hittade ingen google-chrome i PATH." >&2
  echo "  Web Speech kräver OFFICIELL Google Chrome (inte Chromium)." >&2
  echo "  Installera: se deploy/nuc/NUC-INSTALL.md, eller sätt BROWSER_BIN i kiosk.env." >&2
  exit 1
fi

# --- Valfritt: peka ut Anker-högtalaren som mic + ljud-ut (annars systemets default) ---
#   Hitta namnen med:  pactl list short sources   /   pactl list short sinks
if [ -n "${MIC_SOURCE:-}" ] && command -v pactl >/dev/null 2>&1; then
  pactl set-default-source "$MIC_SOURCE" || echo "kiosk.sh: kunde inte sätta mic '$MIC_SOURCE'." >&2
fi
if [ -n "${AUDIO_SINK:-}" ] && command -v pactl >/dev/null 2>&1; then
  pactl set-default-sink "$AUDIO_SINK" || echo "kiosk.sh: kunde inte sätta ljud-ut '$AUDIO_SINK'." >&2
fi

# --- Vänta tills servern svarar ---
echo "kiosk.sh: väntar på $URL_BASE/healthz ..."
for _ in $(seq 1 60); do
  if curl -fsS "$URL_BASE/healthz" >/dev/null 2>&1; then break; fi
  sleep 1
done

# --- Starta Chrome i kiosk ---
#   --use-fake-ui-for-media-stream  → auto-godkänn mikrofonen (riktig mic, ingen dialog)
#   --autoplay-policy=...           → attract-ljud + uppläst NPC-röst får spelas utan gest
exec "$BROWSER" \
  --kiosk --start-fullscreen \
  --user-data-dir="$PROFILE_DIR" \
  --use-fake-ui-for-media-stream \
  --autoplay-policy=no-user-gesture-required \
  --no-first-run --no-default-browser-check \
  --disable-translate --disable-features=TranslateUI \
  --disable-session-crashed-bubble --disable-infobars \
  --password-store=basic \
  "$URL_BASE"

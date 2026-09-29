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

# Touch → skärm-mappning (valfritt; bara relevant om touchen hamnar fel).
#  - En panel, port-baserat (håller över omstart): sätt TOUCH_PATH + OUTPUT.
#  - Namn-baserat: sätt TOUCH_NAME (ur `xinput list`) + OUTPUT.
# OUTPUT = skärmnamn ur `xrandr --listmonitors` (t.ex. HDMI-1 / DP-1).
TOUCH_PATH="${TOUCH_PATH:-}"
TOUCH_NAME="${TOUCH_NAME:-}"
OUTPUT="${OUTPUT:-}"
# Självläkande touch: applicera om var N:e sek (läker efter hotplug/strömblink).
MAP_TOUCH_WATCH="${MAP_TOUCH_WATCH:-5}"

# --- Hitta officiell Google Chrome (krävs för Web Speech) ---
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

# --- Touch → skärm-mappning (om konfigurerad) ---
# Kör map-touch.sh i självläkande watch-läge i bakgrunden så mappningen sätts om
# efter inloggnings-reset, display-hotplug eller strömblink. Binds till fysisk
# USB-port (ID_PATH) → håller över omstart även för identiska paneler.
if command -v xinput >/dev/null 2>&1 && [ -n "$OUTPUT" ]; then
  if [ -n "$TOUCH_PATH" ] && command -v udevadm >/dev/null 2>&1; then
    MAP_TOUCH_WATCH="$MAP_TOUCH_WATCH" MAP_TOUCH_DELAY=3 \
      "$HERE/map-touch.sh" "$TOUCH_PATH" "$OUTPUT" &
  elif [ -n "$TOUCH_NAME" ]; then
    xinput map-to-output "$TOUCH_NAME" "$OUTPUT" \
      || echo "kiosk.sh: kunde inte mappa touch '$TOUCH_NAME' → $OUTPUT (kolla namnet med 'xinput list')." >&2
  fi
fi

# --- Vänta tills servern svarar ---
echo "kiosk.sh: väntar på $URL_BASE/healthz ..."
for _ in $(seq 1 60); do
  if curl -fsS "$URL_BASE/healthz" >/dev/null 2>&1; then break; fi
  sleep 1
done

# --- Starta Chrome i helskärm ---
#   INTE --kiosk: appens "Avsluta"-knapp (window.close, nere till vänster) ska
#   kunna stänga fönstret tillbaka till skrivbordet. --start-fullscreen + --app
#   ger ändå ett rent helskärmsfönster utan flikar/adressfält.
#   --use-fake-ui-for-media-stream  → auto-godkänn mikrofonen (riktig mic, ingen dialog)
#   --autoplay-policy=...           → attract-ljud + uppläst NPC-röst utan gest
#   --ozone-platform=x11            → --start-fullscreen funkar även på Wayland (XWayland)
OZONE="${OZONE:-x11}"
exec "$BROWSER" \
  "--ozone-platform=$OZONE" \
  --start-fullscreen \
  --user-data-dir="$PROFILE_DIR" \
  --use-fake-ui-for-media-stream \
  --autoplay-policy=no-user-gesture-required \
  --no-first-run --no-default-browser-check \
  --noerrdialogs --disable-infobars \
  --disable-translate --disable-features=TranslateUI \
  --disable-session-crashed-bubble \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --password-store=basic \
  --app="$URL_BASE"

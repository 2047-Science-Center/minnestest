#!/usr/bin/env bash
# st2-reset-touch.sh — station 2 (en NUC, två touchskärmar): tryck på en skärm ska ALDRIG hamna på den andra.
# Samma permanenta fix som Förhandlingen (forhandlingen/deploy/nuc/reset-touch.sh 6852050 + kiosk.sh 359023f):
#   1. Varje touchpanel mappas till SIN skärm via panelens USB-port (ID_PATH) — håller för identiska paneler.
#   2. Mappningen görs direkt vid inloggning och sedan om var TOUCH_WATCH:e sek (läker efter omkoppling,
#      skärm-hotplug, strömblink) — oberoende av om spelen startats.
#   3. TOUCH_EGEN_PEKARE=1: sida B:s panel får en EGEN pekare (MPX), så att snabba samtidiga tryck på båda
#      skärmarna inte kan låsa fönstren (Förhandlingen 2026-11-26).
# Läser TOUCH_PATH_A/B + OUTPUT_A/B (+ TOUCH_WATCH, TOUCH_EGEN_PEKARE) ur kiosk.env. Kräver X11. Ingen sudo.
#
#   bash deploy/nuc/st2-reset-touch.sh            mappa om EN gång nu (ikonen "Återställ touch")
#   bash deploy/nuc/st2-reset-touch.sh --watch    autostart: vänta 5 s, mappa och fortsätt mappa om
#   bash deploy/nuc/st2-reset-touch.sh autostart  lägg autostart vid inloggning + ikonen "Återställ touch"
#   bash deploy/nuc/st2-reset-touch.sh --pekare   bara egen pekare för sida B (st2-kiosk.sh kör den före Chrome)
# Raderna till kiosk.env tar du fram med:  bash deploy/nuc/find-touch.sh
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"
# Över SSH finns ingen skärm i miljön → NUC:ens egen skärm (:0), som Förhandlingen.
export DISPLAY="${DISPLAY:-:0}"
export XAUTHORITY="${XAUTHORITY:-$HOME/.Xauthority}"

TOUCH_PATH_A="${TOUCH_PATH_A:-}"; OUTPUT_A="${OUTPUT_A:-}"
TOUCH_PATH_B="${TOUCH_PATH_B:-}"; OUTPUT_B="${OUTPUT_B:-}"

notify() { command -v notify-send >/dev/null 2>&1 && notify-send -t 2500 "Touch" "$1" 2>/dev/null || true; }

if [ "${1:-}" = autostart ]; then
  mkdir -p "$HOME/.config/autostart"
  cat >"$HOME/.config/autostart/station2-touch.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Station 2 touch (autostart)
Exec=bash $HERE/st2-reset-touch.sh --watch
X-GNOME-Autostart-enabled=true
EOF
  desk="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
  mkdir -p "$desk"
  cat >"$desk/station2-aterstall-touch.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Återställ touch (station 2)
Exec=bash $HERE/st2-reset-touch.sh
Icon=input-touchscreen
Terminal=false
EOF
  chmod +x "$desk/station2-aterstall-touch.desktop"
  gio set "$desk/station2-aterstall-touch.desktop" metadata::trusted true 2>/dev/null || true
  echo "st2-reset-touch: mappar touch vid varje inloggning (~/.config/autostart/station2-touch.desktop) + ikonen 'Återställ touch'."
  exit 0
fi

if [ "${XDG_SESSION_TYPE:-}" = "wayland" ]; then
  notify "Touch-mappning kräver X11"; echo "Wayland: xinput map-to-output stöds inte. Logga in i X11." >&2; exit 1
fi
command -v xinput >/dev/null 2>&1 || { echo "xinput saknas (sudo apt install xinput)." >&2; exit 1; }

# Panelens xinput-id ur dess USB-port (samma metod som map-touch.sh / Förhandlingens kiosk.sh).
touch_id_by_path() {
  local want="$1" id node path
  for id in $(xinput list --id-only 2>/dev/null); do
    node=$(xinput list-props "$id" 2>/dev/null | sed -n 's/.*Device Node[^"]*"\([^"]*\)".*/\1/p')
    [ -n "$node" ] || continue
    path=$(udevadm info -q property "$node" 2>/dev/null | sed -n 's/^ID_PATH=//p')
    if [ "$path" = "$want" ]; then echo "$id"; return 0; fi
  done
  return 1
}
egen_pekare() {
  [ "${TOUCH_EGEN_PEKARE:-0}" = 1 ] && [ -n "$TOUCH_PATH_B" ] || return 0
  xinput list --name-only 2>/dev/null | grep -q '^SidaB pointer$' || xinput create-master SidaB || true
  local tid
  if tid=$(touch_id_by_path "$TOUCH_PATH_B"); then
    xinput reattach "$tid" "SidaB pointer" && echo "st2-reset-touch: sida B:s panel (id $tid) → egen pekare"
  else
    echo "st2-reset-touch: TOUCH_EGEN_PEKARE: ingen panel på $TOUCH_PATH_B" >&2
  fi
}

if [ "${1:-}" = --pekare ]; then egen_pekare; exit 0; fi

args=()
[ -n "$TOUCH_PATH_A" ] && [ -n "$OUTPUT_A" ] && args+=("$TOUCH_PATH_A" "$OUTPUT_A")
[ -n "$TOUCH_PATH_B" ] && [ -n "$OUTPUT_B" ] && args+=("$TOUCH_PATH_B" "$OUTPUT_B")
if [ "${#args[@]}" -lt 2 ]; then
  notify "Ingen touch-config i kiosk.env"
  echo "Sätt TOUCH_PATH_A/B + OUTPUT_A/B i deploy/nuc/kiosk.env — kör  bash deploy/nuc/find-touch.sh" >&2
  exit 1
fi

if [ "${1:-}" = --watch ]; then
  sleep 5
  egen_pekare
  MAP_TOUCH_WATCH="${TOUCH_WATCH:-5}" MAP_TOUCH_DELAY=0 exec bash "$HERE/map-touch.sh" "${args[@]}"
fi
egen_pekare
if MAP_TOUCH_WATCH=0 MAP_TOUCH_DELAY=0 bash "$HERE/map-touch.sh" "${args[@]}"; then
  notify "Touch ommappad ✓"; echo "Touch ommappad."
else
  notify "Touch-mappning misslyckades"; echo "Något gick fel (se ovan)." >&2; exit 1
fi

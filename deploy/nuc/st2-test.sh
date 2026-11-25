#!/usr/bin/env bash
# Bänktest av station 2 på EN NUC: startar båda spelen och två kioskfönster (sida A vänster, sida B höger).
# Ingen sudo och inga tjänster: spelservrarna startas som vanliga processer om de inte redan svarar
# (är st2-mem/st2-logn installerade med st2-spel.sh används de). Kör från skrivbordet eller en terminal:
#   bash ~/minnestest/deploy/nuc/st2-test.sh          starta (stänger ev. gamla st2-fönster först)
#   bash ~/minnestest/deploy/nuc/st2-test.sh stopp    stäng fönstren och testets spelservrar
#   bash ~/minnestest/deploy/nuc/st2-test.sh autostart  starta av sig själv vid inloggning (hård omstart = samma läge)
#   bash ~/minnestest/deploy/nuc/st2-test.sh ingen-autostart
# Kräver kiosk.env med SIDA=AB + LUR_A1/LUR_A2/LUR_B (INSTALL-ST2.md steg 7). ST2_URL=direkt = utan skal/broker.
# Stäng ett fönster: Alt+F4. Loggar: /tmp/st2-mem.log, /tmp/st2-logn.log, /tmp/st2-kiosk.log
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BAS="$(cd "$HERE/../../.." && pwd)"   # syskonmapparna (~/manniska-eller-maskin, ~/forhoret)
PROFILE_DIR="${PROFILE_DIR:-$HOME/.flykten-kiosk}"
[ -f "$HERE/kiosk.env" ] && PROFILE_DIR="$(. "$HERE/kiosk.env"; echo "${PROFILE_DIR:-$HOME/.flykten-kiosk}")"

stang_fonster() { pkill -f "$PROFILE_DIR/st2-" 2>/dev/null || true; }

server() { # namn port hälsa mapp fil portvariabel
  local namn="$1" port="$2" halsa="$3" mapp="$BAS/$4" fil="$5" var="$6"
  if curl -fsS -o /dev/null "http://localhost:$port$halsa" 2>/dev/null; then
    echo "st2-test: $namn svarar redan på :$port"
    return 0
  fi
  [ -f "$mapp/dist/index.html" ] || { echo "st2-test: $mapp är inte byggd (npm ci && npm run build)." >&2; exit 1; }
  ( cd "$mapp" && env "$var=$port" NODE_ENV=production nohup node "$fil" >"/tmp/st2-$namn.log" 2>&1 & echo $! >"/tmp/st2-$namn.pid" )
  for _ in $(seq 1 20); do
    curl -fsS -o /dev/null "http://localhost:$port$halsa" 2>/dev/null && { echo "st2-test: $namn startad på :$port"; return 0; }
    sleep 1
  done
  echo "st2-test: $namn startade inte — se /tmp/st2-$namn.log" >&2
  exit 1
}

if [ "${1:-}" = stopp ]; then
  stang_fonster
  # Bara servrarna som st2-test.sh själv startade (pid-filerna) — aldrig andra stationers node-servrar.
  for n in mem logn; do
    [ -f "/tmp/st2-$n.pid" ] && kill "$(cat "/tmp/st2-$n.pid")" 2>/dev/null || true
    rm -f "/tmp/st2-$n.pid"
  done
  echo "st2-test: stoppat."
  exit 0
fi

if [ "${1:-}" = autostart ]; then
  mkdir -p "$HOME/.config/autostart"
  cat >"$HOME/.config/autostart/station2-test.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Station 2 test (autostart)
Exec=bash -c "sleep 8; $HERE/st2-test.sh"
X-GNOME-Autostart-enabled=true
EOF
  echo "st2-test: startar av sig själv vid inloggning (~/.config/autostart/station2-test.desktop)."
  exit 0
fi
if [ "${1:-}" = ingen-autostart ]; then
  rm -f "$HOME/.config/autostart/station2-test.desktop"
  echo "st2-test: autostart borttagen."
  exit 0
fi

# Lurarna först: saknas en på USB startar vi inte (annars hamnar dess ljud i skärmen och det "hoppar").
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
if ! "$HERE/st2-ljud.sh" koll; then
  command -v notify-send >/dev/null 2>&1 && DISPLAY="${DISPLAY:-:0}" notify-send -u critical "Station 2" "En lur saknas på USB — se terminalen / st2-ljud.sh koll" 2>/dev/null || true
  exit 1
fi

server mem 8796 /healthz manniska-eller-maskin server/index.mjs GATEWAY_PORT
server logn 8798 / forhoret server/index.js FORHORET_PORT
stang_fonster
sleep 1
export DISPLAY="${DISPLAY:-:0}"
echo "st2-test: startar fönstren (logg: /tmp/st2-kiosk.log)"
nohup "$HERE/kiosk.sh" >/tmp/st2-kiosk.log 2>&1 &
sleep 8
grep -E "st2-kiosk|st2-ljud|kiosk.sh|xy_lur" /tmp/st2-kiosk.log || true

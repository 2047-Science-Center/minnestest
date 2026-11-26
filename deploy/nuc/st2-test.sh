#!/usr/bin/env bash
# Bänktest av station 2 på EN NUC: startar båda spelen och två kioskfönster (sida A vänster, sida B höger).
# Ingen sudo och inga tjänster: spelservrarna startas som vanliga processer om de inte redan svarar
# (är st2-mem/st2-logn installerade med st2-spel.sh används de). Kör från skrivbordet eller en terminal:
#   bash ~/minnestest/deploy/nuc/st2-test.sh          starta (stänger ev. gamla st2-fönster först)
#   bash ~/minnestest/deploy/nuc/st2-test.sh stopp    stäng fönstren och testets spelservrar
#   bash ~/minnestest/deploy/nuc/st2-test.sh autostart  starta av sig själv vid inloggning (hård omstart = samma läge)
#   bash ~/minnestest/deploy/nuc/st2-test.sh ingen-autostart
#   bash ~/minnestest/deploy/nuc/st2-test.sh omstart    stäng allt (även servrarna) och starta om
#   bash ~/minnestest/deploy/nuc/st2-test.sh uppdatera  git pull (skalet + båda spelen) + bygg + omstart
#   bash ~/minnestest/deploy/nuc/st2-test.sh ikoner     skrivbordsikoner: starta, starta om, stoppa, uppdatera
# Kräver kiosk.env med SIDA=AB + LUR_A1/LUR_A2/LUR_B (INSTALL-ST2.md steg 7), eller EN sida per NUC: SIDA=A
# (Människa eller maskin, LUR_A1..A3 + EXTRA_QUERY=lurar=N) / SIDA=B (Lögndetektorn, LUR_B) — då startas bara den
# sidans spelserver och ett fönster. ST2_URL=direkt = utan skal/broker (bara SIDA=AB);
# annars (skal) startar testet även skalet på :8080 (entré → rollval → spel, broker ur ~/minnestest/.env.production.local).
# Stäng ett fönster: Alt+F4. Loggar: /tmp/st2-mem.log, /tmp/st2-logn.log, /tmp/st2-kiosk.log
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BAS="$(cd "$HERE/../../.." && pwd)"   # syskonmapparna (~/manniska-eller-maskin, ~/forhoret)
PROFILE_DIR="${PROFILE_DIR:-$HOME/.flykten-kiosk}"
[ -f "$HERE/kiosk.env" ] && PROFILE_DIR="$(. "$HERE/kiosk.env"; echo "${PROFILE_DIR:-$HOME/.flykten-kiosk}")"

SIDA_V="$( [ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"; echo "${SIDA:-AB}")"
# Båda fönstren (st2-A/st2-B, SIDA=AB) och enkelfönstret (SIDA=A/B kör kiosk.sh med PROFILE_DIR direkt).
stang_fonster() { pkill -f -- "--user-data-dir=$PROFILE_DIR" 2>/dev/null || true; }

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

stoppa() {
  stang_fonster
  # Bara servrarna som st2-test.sh själv startade (pid-filerna) — aldrig andra stationers node-servrar.
  for n in skal mem logn; do
    [ -f "/tmp/st2-$n.pid" ] && kill "$(cat "/tmp/st2-$n.pid")" 2>/dev/null || true
    rm -f "/tmp/st2-$n.pid"
  done
  echo "st2-test: stoppat."
}
if [ "${1:-}" = stopp ]; then stoppa; exit 0; fi
if [ "${1:-}" = omstart ]; then stoppa; sleep 2; fi
if [ "${1:-}" = uppdatera ]; then
  for r in minnestest manniska-eller-maskin forhoret; do
    echo "st2-test: uppdaterar $r"
    ( cd "$BAS/$r" && git pull --ff-only ) || { echo "st2-test: git pull misslyckades i $r" >&2; exit 1; }
  done
  for r in minnestest manniska-eller-maskin forhoret; do
    ( cd "$BAS/$r" && (npm ci --no-audit --no-fund >/tmp/st2-npm-$r.log 2>&1 || npm install --no-audit --no-fund >>/tmp/st2-npm-$r.log 2>&1) \
      && npm run build >>/tmp/st2-npm-$r.log 2>&1 ) || { echo "st2-test: bygget av $r misslyckades — se /tmp/st2-npm-$r.log" >&2; exit 1; }
    echo "st2-test: $r byggd"
  done
  stoppa; sleep 2
  exec "$HERE/st2-test.sh"
fi
if [ "${1:-}" = ikoner ]; then
  d="$HOME/Skrivbord"; [ -d "$d" ] || d="$HOME/Desktop"
  ikon() { # fil namn kommando ikon
    cat >"$d/$1.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=$2
Exec=bash -c "$3 || read -p 'Något gick fel (se ovan). Tryck Enter för att stänga.'"
Icon=$4
Terminal=true
EOF
    chmod +x "$d/$1.desktop"
    gio set "$d/$1.desktop" metadata::trusted true 2>/dev/null || true
  }
  ikon station2-test "Station 2 starta" "$HERE/st2-test.sh" media-playback-start
  ikon station2-omstart "Station 2 starta om" "$HERE/st2-test.sh omstart" view-refresh
  ikon station2-stoppa "Station 2 stoppa" "$HERE/st2-test.sh stopp" media-playback-stop
  ikon station2-uppdatera "Station 2 uppdatera" "$HERE/st2-test.sh uppdatera" system-software-update
  echo "st2-test: fyra ikoner på $d (starta, starta om, stoppa, uppdatera)."
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
# Vid uppstart kan lurdonglarna behöva några sekunder (st2-lurar-usb.service väcker dem ~10 s efter start).
lurar_ok=0
for _ in $(seq 1 15); do
  "$HERE/st2-ljud.sh" koll >/dev/null 2>&1 && { lurar_ok=1; break; }
  sleep 2
done
if [ "$lurar_ok" = 0 ] && ! "$HERE/st2-ljud.sh" koll; then
  command -v notify-send >/dev/null 2>&1 && DISPLAY="${DISPLAY:-:0}" notify-send -u critical "Station 2" "En lur saknas på USB — se terminalen / st2-ljud.sh koll" 2>/dev/null || true
  exit 1
fi

# ST2_URL=skal (standard): skalet (entré, rollval, rotation, ljus) på :8080 — samma server som minnestest-server,
# men startad här utan sudo/systemd. Svarar tjänsten redan används den.
ST2_URL_V="$( [ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"; echo "${ST2_URL:-skal}")"
[ "$ST2_URL_V" = direkt ] || server skal 8080 / minnestest server/index.js PORT
[ "$SIDA_V" = B ] || server mem 8796 /healthz manniska-eller-maskin server/index.mjs GATEWAY_PORT
[ "$SIDA_V" = A ] || server logn 8798 / forhoret server/index.js FORHORET_PORT
stang_fonster
sleep 1
export DISPLAY="${DISPLAY:-:0}"
echo "st2-test: startar fönstren (logg: /tmp/st2-kiosk.log)"
nohup "$HERE/kiosk.sh" >/tmp/st2-kiosk.log 2>&1 &
sleep 8
grep -E "st2-kiosk|st2-ljud|kiosk.sh|xy_lur" /tmp/st2-kiosk.log || true

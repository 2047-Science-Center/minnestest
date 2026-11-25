#!/usr/bin/env bash
# Station 2:s nya spel på stations-NUC:en (Josef 2026-11-24, xy-rigg/SOM.md "Station 2 från 2026-11-24").
# Skalet (det här repot, minnestest) äger kiosken; efter entrén öppnar det sidans spel i helskärm:
#   sida A = Människa eller maskin  (repo manniska-eller-maskin, node server/index.mjs, :8796)
#   sida B = Lögndetektorn          (repo forhoret,             node server/index.js,  :8798)
# Det här skriptet: klonar spelets repo BREDVID skalet (syskonmapp, privat repo via gh), bygger det
# och lägger en systemd-tjänst (Restart=always, autostart vid boot). Samma mönster som install.sh.
#
#   bash deploy/nuc/st2-spel.sh install A     # sida A (eller B; AB = båda, om en NUC kör båda sidorna)
#   bash deploy/nuc/st2-spel.sh update  A     # git pull + bygg + omstart (update.sh gör det åt dig)
#   bash deploy/nuc/st2-spel.sh status  A
#
# Nycklar läggs för hand i spelets server/.env (se INSTALL-ST2.md). Inga IP:n här.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKAL="$(cd "$HERE/../.." && pwd)"
BAS="$(cd "$SKAL/.." && pwd)"   # syskonmapparna bor här
ORG="2047-Science-Center"

say() { printf '\n\033[1;33m== %s\033[0m\n' "$*"; }

# sida → repo, tjänstnamn, titel, server-fil, port-variabel, port
spel_for() {
  case "$1" in
    A) REPO_NAMN=manniska-eller-maskin; NAMN=st2-mem;  TITEL="Människa eller maskin"; ENTRY=server/index.mjs; PORTVAR=GATEWAY_PORT; PORT=8796; HALSA=/healthz ;;
    B) REPO_NAMN=forhoret;              NAMN=st2-logn; TITEL="Lögndetektorn";         ENTRY=server/index.js;  PORTVAR=FORHORET_PORT; PORT=8798; HALSA=/ ;;
    *) echo "Okänd sida: $1 (A eller B)" >&2; exit 1 ;;
  esac
  REPO="$BAS/$REPO_NAMN"
}

bygg() {
  ( cd "$REPO" && (npm ci || npm install) && npm run build )
}

install_sida() {
  spel_for "$1"
  say "Sida $1: $TITEL ($REPO_NAMN, :$PORT)"
  if [ ! -d "$REPO/.git" ]; then
    command -v gh >/dev/null 2>&1 || { echo "gh saknas (sudo apt install gh, sedan gh auth login)." >&2; exit 1; }
    ( cd "$BAS" && gh repo clone "$ORG/$REPO_NAMN" )
  fi
  [ -f "$REPO/server/.env" ] || echo "VARNING: $REPO/server/.env saknas — AI/röst svarar inte förrän nycklarna finns (INSTALL-ST2.md steg 4)."
  bygg
  local NODE USER_NAME tmp
  NODE="$(command -v node)"; USER_NAME="$(id -un)"
  tmp="$(mktemp)"
  sed -e "s|@USER@|$USER_NAME|g" -e "s|@REPO@|$REPO|g" -e "s|@NODE@|$NODE|g" -e "s|@ENTRY@|$ENTRY|g" \
      -e "s|@PORTVAR@|$PORTVAR|g" -e "s|@PORT@|$PORT|g" -e "s|@NAMN@|$NAMN|g" -e "s|@TITEL@|$TITEL|g" \
      "$HERE/st2-spel.service" > "$tmp"
  sudo install -m 0644 "$tmp" "/etc/systemd/system/$NAMN.service"
  rm -f "$tmp"
  sudo systemctl daemon-reload
  sudo systemctl enable --now "$NAMN.service"
  halsa
}

halsa() {
  for _ in $(seq 1 15); do
    if curl -fsS "http://localhost:$PORT$HALSA" >/dev/null 2>&1; then say "$TITEL svarar på http://localhost:$PORT ✓"; return 0; fi
    sleep 1
  done
  echo "Varning: $TITEL svarar inte på :$PORT — kolla: sudo journalctl -u $NAMN -n 50" >&2
}

update_sida() {
  spel_for "$1"
  [ -d "$REPO/.git" ] || { echo "$REPO finns inte — kör: bash deploy/nuc/st2-spel.sh install $1" >&2; return 1; }
  say "Uppdaterar sida $1: $TITEL"
  ( cd "$REPO" && git pull --ff-only )
  bygg
  sudo systemctl restart "$NAMN.service"
  halsa
}

status_sida() {
  spel_for "$1"
  systemctl --no-pager --lines=0 status "$NAMN.service" || true
  curl -fsS -o /dev/null -w "  :$PORT$HALSA → %{http_code}\n" "http://localhost:$PORT$HALSA" || echo "  :$PORT svarar inte"
}

CMD="${1:-}"; SIDOR="${2:-}"
[ -n "$CMD" ] && [ -n "$SIDOR" ] || { sed -n '2,13p' "$0"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node saknas. Installera Node 20+." >&2; exit 1; }
for s in $(echo "$SIDOR" | grep -o .); do
  case "$CMD" in
    install) install_sida "$s" ;;
    update) update_sida "$s" ;;
    status) status_sida "$s" ;;
    *) echo "Okänt kommando: $CMD (install|update|status)" >&2; exit 1 ;;
  esac
done

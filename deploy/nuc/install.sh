#!/usr/bin/env bash
# Engångsinstallation av FLYKTEN (Minnestestet) som permanent kiosk-station på en
# Linux-NUC (Ubuntu).
#   1) bygger appen same-origin (npm ci + npm run build:kiosk)
#   2) systemd-tjänst för gateway+app med autostart (läser server/.env)
#   3) systemd USER-tjänst som startar Chrome-kiosken
#
# FÖRKRAV innan du kör:
#   • Node 20+, npm, curl, och OFFICIELL Google Chrome installerade.
#   • server/.env finns med AI_API_KEY (+ ev. ELEVENLABS_API_KEY). Se NUC-INSTALL.md.
#   • Internet (Web Speech + OpenAI + ElevenLabs kräver nät).
#
# Kör på NUC:en, från repo-roten:  bash deploy/nuc/install.sh
# Flaggor:  --server-only   (hoppa över kiosk-tjänsten)
#           --port <n>       (serverport, default 8080)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
PORT="${PORT:-8080}"
INSTALL_KIOSK=1

while [ $# -gt 0 ]; do
  case "$1" in
    --server-only) INSTALL_KIOSK=0 ;;
    --port) PORT="$2"; shift ;;
    *) echo "Okänd flagga: $1" >&2; exit 1 ;;
  esac
  shift
done

say() { printf '\n\033[1;33m== %s\033[0m\n' "$*"; }

command -v node >/dev/null 2>&1 || { echo "Node saknas. Installera Node 20+." >&2; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "npm saknas. Installera Node 20+." >&2; exit 1; }
NODE="$(command -v node)"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || echo "Varning: Node $NODE_MAJOR — 20+ rekommenderas."
USER_NAME="$(id -un)"

[ -f "$REPO/server/.env" ] || echo "VARNING: $REPO/server/.env saknas — /assess svarar 500 tills nyckeln finns (se NUC-INSTALL.md)."

say "Repo: $REPO   Node: $(node -v)   Port: $PORT   Användare: $USER_NAME"

# --- 1) Bygg (same-origin) ---
say "Installerar beroenden (npm ci)"
( cd "$REPO" && (npm ci || npm install) )
say "Bygger appen same-origin (npm run build:kiosk)"
( cd "$REPO" && npm run build:kiosk )

# --- 2) Gateway som systemd-tjänst ---
say "Installerar systemd-tjänst: minnestest-server"
tmp="$(mktemp)"
sed -e "s|@USER@|$USER_NAME|g" -e "s|@REPO@|$REPO|g" -e "s|@PORT@|$PORT|g" -e "s|@NODE@|$NODE|g" \
  "$HERE/minnestest-server.service" > "$tmp"
sudo install -m 0644 "$tmp" /etc/systemd/system/minnestest-server.service
rm -f "$tmp"
sudo systemctl daemon-reload
sudo systemctl enable --now minnestest-server.service
sleep 2
if curl -fsS "http://localhost:$PORT/healthz" >/dev/null 2>&1; then
  say "Servern svarar på http://localhost:$PORT ✓"
else
  echo "Varning: servern svarade inte än — kolla: sudo systemctl status minnestest-server" >&2
fi

# --- 3) Kiosk som systemd USER-tjänst ---
if [ "$INSTALL_KIOSK" -eq 1 ]; then
  say "Installerar kiosk-autostart (systemd user)"
  chmod +x "$HERE/kiosk.sh"
  [ -f "$HERE/kiosk.env" ] || { cp "$HERE/kiosk.env.example" "$HERE/kiosk.env"; sed -i "s|:8080|:$PORT|" "$HERE/kiosk.env"; }
  mkdir -p "$HOME/.config/systemd/user"
  sed -e "s|@REPO@|$REPO|g" \
    "$HERE/minnestest-kiosk.service" > "$HOME/.config/systemd/user/minnestest-kiosk.service"
  systemctl --user daemon-reload
  systemctl --user enable minnestest-kiosk.service || true
  sudo loginctl enable-linger "$USER_NAME" || true
  say "Kiosk installerad — startar när den grafiska sessionen loggar in."
  echo "Starta nu (om du redan är inloggad grafiskt):  systemctl --user start minnestest-kiosk"
fi

say "Klart."
cat <<EOF

Nästa steg / bra att veta:
  • Autologin till en X11-session krävs för att kiosken ska starta av sig själv
    (se deploy/nuc/NUC-INSTALL.md — eller kör deploy/nuc/setup-xorg.sh för en ren
    Xorg-kiosk utan skrivbordsmiljö).
  • Sätt Anker-högtalaren som standard-INljud (mic) och -UTljud (se NUC-INSTALL.md).
  • Uppdatera stationen senare:  bash deploy/nuc/update.sh   (git pull + bygg + omstart)
  • Loggar:  sudo journalctl -u minnestest-server -f
             systemctl --user status minnestest-kiosk
EOF

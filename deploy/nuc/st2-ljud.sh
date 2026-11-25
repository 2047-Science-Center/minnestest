#!/usr/bin/env bash
# Station 2 sida A: de tre telefonlurarnas mikar mixas till EN virtuell mik (xy_mik_A), eftersom en
# pratar i taget och Chromes Web Speech bara hör standardingången. Mönstret är xy-lurtest/lurar.sh
# "koppla" (beprövat på bänken), här bara A-mixen. Körs av kiosk.sh före Chrome när LUR_A1–3 är satta.
#
# Lurarna pekas ut med en unik bit av USB-porten (device.bus_path) — då håller det över omstart även
# med tre identiska Opis-lurar. Hitta portarna: bash deploy/nuc/st2-ljud.sh lista  (lyft en lur i taget).
#   bash deploy/nuc/st2-ljud.sh koppla    # skapa xy_mik_A + sätt den som standard-mik
#   bash deploy/nuc/st2-ljud.sh loss      # ta bort mixen
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"

# Alla USB-ljudnoder: typ<TAB>namn<TAB>port<TAB>beskrivning (kopia av xy-lurtest/lurar.sh usb_nodes)
usb_nodes() {
  { pactl -f json list sinks; echo '@@'; pactl -f json list sources; } 2>/dev/null | python3 -c '
import sys, json
raw = sys.stdin.read().split("@@")
def load(s):
    try: return json.loads(s)
    except Exception: return []
for typ, data in (("UT", load(raw[0])), ("IN", load(raw[1] if len(raw) > 1 else "[]"))):
    for n in data:
        name = n.get("name", "")
        if name.endswith(".monitor"): continue
        p = n.get("properties", {})
        bus = p.get("device.bus") or ""
        if "usb" not in (bus + name).lower(): continue
        port = p.get("device.bus_path") or p.get("device.bus-path") or p.get("sysfs.path") or p.get("api.alsa.path") or "?"
        desc = p.get("device.description") or n.get("description") or ""
        print(f"{typ}\t{name}\t{port}\t{desc}")
'
}

# EN nod av typ (UT/IN) vars namn eller port innehåller $2 (exakt en träff krävs).
find_node() {
  local typ="$1" bit="$2" hits n
  hits=$(usb_nodes | awk -F'\t' -v t="$typ" -v b="$bit" '$1==t && (index($2,b) || index($3,b)) {print $2}')
  n=$(printf '%s\n' "$hits" | grep -c . || true)
  [ "$n" = 1 ] || { echo "st2-ljud: '$bit' gav $n träffar bland $typ-enheterna (måste vara 1). Kör: st2-ljud.sh lista" >&2; return 1; }
  printf '%s' "$hits"
}

loss() {
  local ids
  ids=$(pactl list short modules 2>/dev/null | awk '/xy_mix_A|xy_mik_A/ {print $1}')
  for id in $ids; do pactl unload-module "$id" 2>/dev/null || true; done
}

koppla() {
  local m mA=()
  for v in LUR_A1 LUR_A2 LUR_A3; do
    [ -n "${!v:-}" ] || { echo "st2-ljud: $v är inte satt i kiosk.env" >&2; exit 1; }
    m=$(find_node IN "${!v}") || exit 1
    mA+=("$m")
  done
  loss
  pactl load-module module-null-sink sink_name=xy_mix_A sink_properties=device.description=XY-mix-A >/dev/null
  for m in "${mA[@]}"; do
    pactl load-module module-loopback source="$m" sink=xy_mix_A latency_msec=30 >/dev/null
  done
  pactl load-module module-remap-source master=xy_mix_A.monitor source_name=xy_mik_A \
    source_properties=device.description=XY-mik-A >/dev/null
  pactl set-default-source xy_mik_A
  echo "st2-ljud: de tre lurarnas mikar → xy_mik_A (standard-mik)."
}

case "${1:-koppla}" in
  lista) usb_nodes | column -t -s $'\t' ;;
  koppla) koppla ;;
  loss) loss; echo "st2-ljud: mixen borttagen." ;;
  *) echo "Användning: st2-ljud.sh lista|koppla|loss" >&2; exit 1 ;;
esac

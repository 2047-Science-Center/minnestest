#!/usr/bin/env bash
# Station 2: varje telefonlur får en EGEN namngiven ljudenhet, bunden till sitt USB-uttag (bus_path),
# så att apparna kan hitta luren på ETIKETTEN (Chrome-enhetens namn) i stället för på ett ostabilt id:
#   in  (mik):  XY-lur-A1, XY-lur-A2, (XY-lur-A3), XY-lur-B     ← module-remap-source på lurens mik
#   ut  (lur):  XY-lur-B                                       ← module-remap-sink på B-lurens hörsnäcka
# Människa eller maskin (sida A) lyssnar per tur på den aktiva spelarens XY-lur-A<n>; Lögndetektorn
# (sida B) hör bara XY-lur-B och spelar VALdis frågor i XY-lur-B (?lur=XY-lur-B).
#
# INGEN MIXNING (bänktest 2026-11-25): loopback → null-sink → remap fastnade i PipeWire och gav 0 byte
# från A-mikarna så länge mixen fanns. En remap-källa direkt på EN lurs mik flödar (verifierat samma kväll).
#
# Runtime: modulerna försvinner vid omstart av ljudet/NUC:en. kiosk.sh kör "koppla" före Chrome. Ingen sudo.
#   bash deploy/nuc/st2-ljud.sh lista     # USB-ljudenheter med port (lyft/koppla en lur i taget)
#   bash deploy/nuc/st2-ljud.sh koppla    # skapa XY-lur-* ur LUR_A1/LUR_A2/LUR_A3/LUR_B i kiosk.env
#   bash deploy/nuc/st2-ljud.sh status    # vad som är kopplat
#   bash deploy/nuc/st2-ljud.sh loss      # ta bort XY-lur-* (och en gammal xy_mik_A-mix)
#
# kiosk.env: en unik bit av USB-PORTEN per lur, t.ex. LUR_A1=usb-0:2.2: (se "lista"). Volym:
#   LUR_VOL_UT=100%  (JieLi-donglarna startar på 40 %, för lågt i luren)   LUR_VOL_IN=50%
set -euo pipefail
export LC_ALL=C   # pactl -f json med svensk locale ger decimalkomma → trasig JSON

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$HERE/kiosk.env" ] && . "$HERE/kiosk.env"
LUR_VOL_UT="${LUR_VOL_UT:-100%}"
LUR_VOL_IN="${LUR_VOL_IN:-50%}"

# Alla USB-ljudnoder: typ<TAB>namn<TAB>port<TAB>beskrivning (kopia av xy-lurtest/lurar.sh usb_nodes).
# Våra egna XY-lur-* räknas inte (de har ingen device.bus).
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
        if name.endswith(".monitor") or name.startswith("xy_"): continue
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
  ids=$(pactl list short modules 2>/dev/null | awk '/xy_lur_|xy_mix_A|xy_mik_A/ {print $1}')
  for id in $ids; do pactl unload-module "$id" 2>/dev/null || true; done
}

koppla() {
  local def_sink def_src lurar=() v id m s antal=0
  for v in LUR_A1 LUR_A2 LUR_A3 LUR_B; do [ -n "${!v:-}" ] && lurar+=("$v"); done
  [ "${#lurar[@]}" -gt 0 ] || { echo "st2-ljud: inga LUR_A1/LUR_A2/LUR_A3/LUR_B i kiosk.env — inget att koppla." >&2; return 1; }
  # Kontrollera ALLA först, så att en saknad lur inte lämnar en halv koppling.
  for v in "${lurar[@]}"; do find_node IN "${!v}" >/dev/null || return 1; done
  [ -z "${LUR_B:-}" ] || find_node UT "$LUR_B" >/dev/null || return 1

  def_sink=$(pactl get-default-sink 2>/dev/null || true)
  def_src=$(pactl get-default-source 2>/dev/null || true)
  loss
  for v in "${lurar[@]}"; do
    id="${v#LUR_}"                      # A1 / A2 / A3 / B
    m=$(find_node IN "${!v}")
    pactl set-source-volume "$m" "$LUR_VOL_IN" 2>/dev/null || true
    pactl load-module module-remap-source master="$m" source_name="xy_lur_$id" \
      source_properties="device.description=XY-lur-$id" >/dev/null
    s=$(find_node UT "${!v}" 2>/dev/null || true)
    [ -n "$s" ] && pactl set-sink-volume "$s" "$LUR_VOL_UT" 2>/dev/null || true
    antal=$((antal + 1))
  done
  # B-lurens hörsnäcka (Lögndetektorns frågor, setSinkId på etiketten XY-lur-B).
  if [ -n "${LUR_B:-}" ]; then
    s=$(find_node UT "$LUR_B")
    pactl load-module module-remap-sink master="$s" sink_name="xy_lur_B_ut" \
      sink_properties="device.description=XY-lur-B" >/dev/null
  fi
  # De nya enheterna får aldrig bli standard för resten av NUC:en.
  [ -n "$def_sink" ] && pactl set-default-sink "$def_sink" 2>/dev/null || true
  [ -n "$def_src" ] && pactl set-default-source "$def_src" 2>/dev/null || true
  echo "st2-ljud: $antal lurar kopplade (egna enheter, ingen mix):"
  status
}

status() {
  pactl list short sources 2>/dev/null | awk '$2 ~ /^xy_lur_/ {print "  in  " $2}'
  pactl list short sinks 2>/dev/null | awk '$2 ~ /^xy_lur_/ {print "  ut  " $2}'
}

case "${1:-koppla}" in
  lista) usb_nodes | column -t -s $'\t' ;;
  koppla) koppla ;;
  status) status ;;
  loss) loss; echo "st2-ljud: XY-lur-* borttagna." ;;
  *) echo "Användning: st2-ljud.sh lista|koppla|status|loss" >&2; exit 1 ;;
esac

#!/bin/sh
# Station 2: väck telefonlurarnas JieLi-donglar (3654:5678) som inte fick någon ljuddrivrutin vid uppstart.
#
# Bakgrund (bänktest 2026-11-25/26, kärna 6.14): donglarna är UAC3-only. Sitter de i vid KALLSTART svarar de inte
# i tid på drivrutinens första fråga → "cannot request logical cluster ID … probe with driver snd-usb-audio failed
# with error -32" → ingen ljudenhet. Kopplas de in efter starten fungerar de. Det här skriptet gör "koppla in igen"
# i mjukvara: för varje JieLi-dongel utan drivrutin på gränssnitt :1.0 → authorized 0 → 1 (som en ny inkoppling).
# Inget händer med donglar som redan fungerar. Körs som root av st2-lurar-usb.service ~10 s efter start.
#   sudo sh deploy/nuc/st2-lurar-usb.sh        (för hand)
set -u
for forsok in 1 2 3; do
  saknas=0
  for d in /sys/bus/usb/devices/*; do
    [ "$(cat "$d/idVendor" 2>/dev/null)" = 3654 ] && [ "$(cat "$d/idProduct" 2>/dev/null)" = 5678 ] || continue
    namn=$(basename "$d")
    [ -e "$d/$namn:1.0/driver" ] && continue
    saknas=1
    echo "st2-lurar-usb: $namn har ingen ljuddrivrutin — kopplar in igen (försök $forsok)"
    echo 0 >"$d/authorized"; sleep 1; echo 1 >"$d/authorized"
    sleep 3
  done
  [ "$saknas" = 0 ] && { echo "st2-lurar-usb: alla lurdonglar har ljuddrivrutin."; exit 0; }
  sleep 2
done
echo "st2-lurar-usb: någon dongel saknar fortfarande drivrutin — se journalctl -k -b | grep -i snd-usb" >&2
exit 1

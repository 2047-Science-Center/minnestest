# shellcheck shell=bash
# Station 2 på EN NUC med TVÅ skärmar (SIDA=AB i kiosk.env): två kioskfönster, ett per skärm.
#   vänster skärm = sida A, Människa eller maskin  (lurarna XY-lur-A1/A2)
#   höger skärm   = sida B, Lögndetektorn          (luren XY-lur-B)
# Källas (.) av kiosk.sh efter att kiosk.env lästs, Chrome hittats och lurarna kopplats (st2-ljud.sh).
# Mönstret är Undersökningens kiosk.sh (fönsterplacering, touch per skärm, ljud per fönster) +
# xy-lurtest/lurar.sh (route-loopen flyttar även ingångar).
#
# kiosk.env (allt valfritt utom SIDA=AB):
#   ST2_URL=skal|direkt   skal (standard) = skalet :8080 ?sida=A / ?sida=B, som i riggen (entré → spel).
#                         direkt = spelen direkt (:8796 / :8798), utan skal/entré/broker — bänktest.
#   EXTRA_QUERY_A=        t.ex. lurar=2           EXTRA_QUERY_B=lur=XY-lur-B (frågorna i B-luren)
#   POS_A=0,0 POS_B=1920,0   (annars ur xrandr: vänstraste = A, högraste = B)
#   OUTPUT_A=DP-1 OUTPUT_B=DP-3 + TOUCH_PATH_A=… TOUCH_PATH_B=…   (touch per skärm, ID_PATH)
#   SINK_A= SINK_B=       rummets utgång per fönster (pactl list short sinks). Tomt = standardutgången.
#
# LJUD PER FÖNSTER: varje Chrome-process taggas (application.name=XY-A / XY-B) och en route-loop håller
#   - utgångar (sink-inputs) på SINK_A/SINK_B — utom strömmar som appen själv lagt i en lur (xy_lur_*,
#     Lögndetektorns frågor via setSinkId), de lämnas orörda;
#   - ingångar (source-outputs) på fönstrets EGNA lurar: en ström som redan ligger på en av fönstrets
#     lurar (appen valde XY-lur-A<n> med deviceId) lämnas; allt annat (t.ex. Web Speech utan track) flyttas
#     till fönstrets första lur. Fönster A kan alltså aldrig höra B-luren och tvärtom.
#   Chrome ignorerar PULSE_SOURCE (bänktest 2026-11-25), därför loopen.

ST2_URL="${ST2_URL:-skal}"
EXTRA_QUERY_A="${EXTRA_QUERY_A:-}"
EXTRA_QUERY_B="${EXTRA_QUERY_B:-lur=XY-lur-B}"
SINK_A="${SINK_A:-}"
SINK_B="${SINK_B:-}"
OUTPUT_A="${OUTPUT_A:-}"; OUTPUT_B="${OUTPUT_B:-}"
TOUCH_PATH_A="${TOUCH_PATH_A:-}"; TOUCH_PATH_B="${TOUCH_PATH_B:-}"

st2_url() { # sida → URL
  local sida="$1" extra base
  if [ "$sida" = A ]; then extra="$EXTRA_QUERY_A"; else extra="$EXTRA_QUERY_B"; fi
  if [ "$ST2_URL" = direkt ]; then
    if [ "$sida" = A ]; then base="http://localhost:8796/"; else base="http://localhost:8798/"; fi
    printf '%s%s' "$base" "${extra:+?$extra}"
  else
    printf '%s/?sida=%s%s' "$URL_BASE" "$sida" "${extra:+&$extra}"
  fi
}

# --- Fönsterpositioner: vänstraste skärmen = A, högraste = B ---
monitor_positions() {
  command -v xrandr >/dev/null 2>&1 || return 0
  xrandr --listmonitors 2>/dev/null | awk 'NR>1 {
      s=$3; sub(/^[0-9]+\/[0-9]+x[0-9]+\/[0-9]+/, "", s)
      n=split(s, a, "+"); if (n>=3) print a[2], a[3]
    }' | sort -n -u
}
if [ -z "${POS_A:-}" ] || [ -z "${POS_B:-}" ]; then
  _mp="$(monitor_positions || true)"
  if [ "$(printf '%s\n' "$_mp" | grep -c .)" -ge 2 ]; then
    POS_A="${POS_A:-$(printf '%s\n' "$_mp" | head -1 | awk '{print $1","$2}')}"
    POS_B="${POS_B:-$(printf '%s\n' "$_mp" | tail -1 | awk '{print $1","$2}')}"
  else
    echo "st2-kiosk: hittade bara en skärm i xrandr — B hamnar på 1920,0." >&2
  fi
fi
POS_A="${POS_A:-0,0}"
POS_B="${POS_B:-1920,0}"

# --- Touch per skärm (port-baserat, självläkande) ---
WATCH_PID=""
if command -v xinput >/dev/null 2>&1 && command -v udevadm >/dev/null 2>&1; then
  touch_args=()
  [ -n "$TOUCH_PATH_A" ] && [ -n "$OUTPUT_A" ] && touch_args+=("$TOUCH_PATH_A" "$OUTPUT_A")
  [ -n "$TOUCH_PATH_B" ] && [ -n "$OUTPUT_B" ] && touch_args+=("$TOUCH_PATH_B" "$OUTPUT_B")
  if [ "${#touch_args[@]}" -gt 0 ]; then
    MAP_TOUCH_WATCH="$MAP_TOUCH_WATCH" MAP_TOUCH_DELAY=3 "$HERE/map-touch.sh" "${touch_args[@]}" &
    WATCH_PID=$!
  fi
fi

# --- Vänta tills servrarna svarar ---
if [ "$ST2_URL" = direkt ]; then halsor=("http://localhost:8796/healthz" "http://localhost:8798/")
else halsor=("$URL_BASE/healthz"); fi
for h in "${halsor[@]}"; do
  echo "st2-kiosk: väntar på $h ..."
  for _ in $(seq 1 60); do curl -fsS "$h" >/dev/null 2>&1 && break; sleep 1; done
done

if [ "${KIOSK:-1}" = 1 ]; then FULLSCREEN_FLAG=--kiosk; else FULLSCREEN_FLAG=--start-fullscreen; fi
OZONE="${OZONE:-x11}"
st2_flags=(
  "--ozone-platform=$OZONE" "$FULLSCREEN_FLAG" --disable-pinch
  --use-fake-ui-for-media-stream --autoplay-policy=no-user-gesture-required
  --no-first-run --no-default-browser-check --noerrdialogs --disable-infobars
  --disable-translate --disable-features=TranslateUI --disable-session-crashed-bubble
  --overscroll-history-navigation=0 --check-for-update-interval=31536000 --password-store=basic
)

ST2_PIDS=()
st2_launch() { # sida pos sink
  local sida="$1" pos="$2" sink="$3" pre
  pre=(env "PULSE_PROP=application.name=XY-$sida")
  [ -n "$sink" ] && pre+=("PULSE_SINK=$sink")
  "${pre[@]}" "$BROWSER" "${st2_flags[@]}" \
    --user-data-dir="$PROFILE_DIR/st2-$sida" \
    --window-position="$pos" \
    --app="$(st2_url "$sida")" &
  ST2_PIDS+=("$!")
  echo "st2-kiosk: sida $sida → $(st2_url "$sida")  @ $pos${sink:+  ut: $sink}"
}

# Route-loopen (se huvudet). $1 = tagg (XY-A), $2 = rummets utgång (tom = rör inte), $3 = fönstrets
# lurar (mellanslagsseparerade källnamn; första = dit främmande ingångar flyttas), $4 = profil.
st2_route() {
  command -v pactl >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1 || return 0
  local tag="$1" sink="$2" egna="$3" prof="$4"
  (
    set +e
    export LC_ALL=C
    while pgrep -f "$PROFILE_DIR/$prof" >/dev/null 2>&1; do
      { pactl -f json list sinks; echo '@@'; pactl -f json list sources; echo '@@'
        pactl -f json list sink-inputs; echo '@@'; pactl -f json list source-outputs; } 2>/dev/null |
      python3 -c '
import sys, json
tag, sink, egna = sys.argv[1], sys.argv[2], sys.argv[3].split()
d = sys.stdin.read().split("@@")
def load(s):
    try: return json.loads(s)
    except Exception: return []
sinks = {str(x.get("index")): x.get("name", "") for x in load(d[0])}
sources = {str(x.get("index")): x.get("name", "") for x in load(d[1])}
finns = set(sources.values())
mine = lambda x: x.get("properties", {}).get("application.name") == tag
if sink:
    for x in load(d[2]):
        cur = sinks.get(str(x.get("sink")), "")
        if mine(x) and cur != sink and not cur.startswith("xy_lur_"):
            print("move-sink-input", x.get("index"), sink)
egna = [e for e in egna if e in finns]
if egna:
    for x in load(d[3]):
        cur = sources.get(str(x.get("source")), "")
        if mine(x) and cur not in egna:
            print("move-source-output", x.get("index"), egna[0])
' "$tag" "$sink" "$egna" | while read -r cmd id dest; do
        pactl "$cmd" "$id" "$dest" >/dev/null 2>&1 && echo "st2-kiosk: $tag $cmd #$id → $dest"
      done
      sleep 2
    done
  ) &
}

echo "st2-kiosk: station 2, båda sidorna på den här NUC:en (ST2_URL=$ST2_URL, webbläsare: $BROWSER)"
st2_launch A "$POS_A" "$SINK_A"
sleep "${LAUNCH_GAP:-4}"   # låt första fönstret bli klart (annars kan det andra bli vitt)
st2_launch B "$POS_B" "$SINK_B"
st2_route XY-A "$SINK_A" "xy_lur_A1 xy_lur_A2 xy_lur_A3" st2-A
st2_route XY-B "$SINK_B" "xy_lur_B" st2-B

wait "${ST2_PIDS[@]}" 2>/dev/null || true
[ -z "$WATCH_PID" ] || kill "$WATCH_PID" 2>/dev/null || true
echo "st2-kiosk: fönstren stängda."

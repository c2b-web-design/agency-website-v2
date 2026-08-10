#!/usr/bin/env bash
# Drive the Q5 stall bisect: production build per arm, INTERLEAVED ROUNDS.
#
#   bash verify/run-bisect.sh [rounds]      (default 3)
#
# ⚠ PRODUCTION BUILD PER ARM, NOT A LIVE DEV SERVER. `q5-stall-10-august.md`
# records a bisect that convicted the wrong commits because Turbopack was
# recompiling during each measurement.
#
# ══════════════════════════════════════════════════════════════════════════
# ⚠⚠ THREE WAYS THIS SCRIPT HAS ALREADY MEASURED THE WRONG THING
# ══════════════════════════════════════════════════════════════════════════
#
# FAULT 1 — IT STASHED ITS OWN INSTRUMENT. `git stash push -u` stashed the
# UNTRACKED verify/ scripts it was about to run. Every arm died on module
# resolution. Fixed: no stash; only `components/` and `app/` are checked out.
#
# FAULT 2 — IT LEAKED A SERVER AND MEASURED THE ZOMBIE. Diagnosed by the
# Architect, 10 August, from source alone; confirmed by `netstat` showing PID
# 4308 holding :3000 with no server intentionally running.
#   1. `kill $!` killed the npm SHIM, not the `next start` GRANDCHILD — Windows
#      has no process-group signal delivery, so the orphan kept the port.
#   2. `curl localhost:3000` proved SOMEONE was listening, not that it was THIS
#      arm. The next arm's `npm start` hit EADDRINUSE and exited into a log the
#      driver never read on the success path.
#   3. The zombie served a build that no longer existed: the new arm's build
#      rewrote `.next`, so client chunks 404'd and **React never hydrated** —
#      which renders `aria-disabled="true"` forever and reads as a broken
#      commit.
# Fixed: per-arm port, probe polarity INVERTED (assert FREE before starting),
# kill BY PORT with `taskkill //PID //T //F`, EADDRINUSE read on the failure
# path, and the harness proves hydration before believing `aria-disabled`.
#
# FAULT 3 — ⚠⚠ RUN ORDER MASQUERADED AS A RESULT, AND THIS ONE SHAPES THE
# WHOLE DESIGN BELOW. A `?parktraveller=1` A/B measured 740ms vs 388ms and
# looked decisive. Interleaved on one server it collapsed to 750/695, 454/383,
# 399/369 — the flag was worth ~30-70ms and the rest was CACHE WARMTH.
#
# **Measured variance on IDENTICAL code was 399-750ms. That is LARGER than the
# regression being hunted (80ms -> 180ms).** So:
#
#   ⚠ ARMS ARE INTERLEAVED ACROSS ROUNDS, NOT MEASURED ONCE EACH IN SEQUENCE.
#     A single reading per commit cannot distinguish the commit from its
#     position in the run order. The MEDIAN across rounds is the number to
#     read; a single round proves nothing.
#
# ⚠ THE COST: one production build per arm per round. Builds are ~15s here.

set -u

cd "$(dirname "$0")/.." || exit 1

ROUNDS="${1:-3}"

ARMS=(
  "3a7cf1f"   # D-046 — approved at 86ms by Carl's eye. THE CONTROL.
  "1c9b8d7"   # satin face / label is the surface
  "7b056c2"   # resting light — traveller rAF (largely cleared by the A/B)
  "4c7a20e"   # hover WIP
  "e3a5b7c"   # hover fix
  "f96b600"   # three corrections
  "eb827f0"   # HEAD
)

START_REF="$(git rev-parse --abbrev-ref HEAD)"
if [ "$START_REF" = "HEAD" ]; then START_REF="$(git rev-parse HEAD)"; fi
echo "starting ref: $START_REF   rounds: $ROUNDS"
echo ""

RESULTS_FILE="$(mktemp)"

kill_port() {
  local port="$1" pids
  pids="$(netstat -ano 2>/dev/null | grep "LISTENING" | grep ":${port} " | awk '{print $NF}' | sort -u)"
  for pid in $pids; do
    [ -n "$pid" ] && taskkill //PID "$pid" //T //F >/dev/null 2>&1
  done
  sleep 1
}

port_free() {
  ! netstat -ano 2>/dev/null | grep -q "LISTENING.*:$1 "
}

restore() {
  echo ""
  echo "── restoring working tree ─────────────────────────────"
  git checkout -q "$START_REF" -- components/ app/ 2>/dev/null
  echo "restored components/ and app/ to $START_REF"
  echo ""
  echo "══ RAW RESULTS (read the MEDIAN per arm, never one round) ══"
  echo "   D-046 approved baseline: 86ms cold (Carl's eye)"
  echo "   UNMEASURABLE says NOTHING about the commit."
  echo ""
  sort "$RESULTS_FILE"
  rm -f "$RESULTS_FILE"
}
trap restore EXIT INT TERM

for round in $(seq 1 "$ROUNDS"); do
  echo "###########################################################"
  echo "#  ROUND $round of $ROUNDS"
  echo "###########################################################"

  i=0
  for sha in "${ARMS[@]}"; do
    i=$((i + 1))
    PORT=$((3100 + i))
    SUBJECT="$(git log -1 --format=%s "$sha" | cut -c1-42)"

    printf "  %s  port %s  " "$sha" "$PORT"

    kill_port "$PORT"
    if ! port_free "$PORT"; then
      echo "DRIVER FAILED (port busy)"
      printf '%s  r%s  DRIVER FAILED (port busy)\n' "$sha" "$round" >> "$RESULTS_FILE"
      continue
    fi

    if ! git checkout -q "$sha" -- components/ app/ 2>/dev/null; then
      echo "DRIVER FAILED (checkout)"
      printf '%s  r%s  DRIVER FAILED (checkout)\n' "$sha" "$round" >> "$RESULTS_FILE"
      continue
    fi

    if ! npm run build >/tmp/bisect-build.log 2>&1; then
      echo "DRIVER FAILED (build)"
      printf '%s  r%s  DRIVER FAILED (build)\n' "$sha" "$round" >> "$RESULTS_FILE"
      continue
    fi

    npm start -- --port "$PORT" >/tmp/bisect-server-$PORT.log 2>&1 &

    UP=0
    for _ in $(seq 1 60); do
      if curl -s -o /dev/null "http://localhost:$PORT/start"; then UP=1; break; fi
      if grep -qiE "EADDRINUSE|address already in use" "/tmp/bisect-server-$PORT.log" 2>/dev/null; then
        break
      fi
      sleep 1
    done

    if [ "$UP" != "1" ]; then
      echo "DRIVER FAILED (server)"
      printf '%s  r%s  DRIVER FAILED (server)\n' "$sha" "$round" >> "$RESULTS_FILE"
      kill_port "$PORT"
      continue
    fi

    RESULT="$(VERIFY_BASE_URL="http://localhost:$PORT" BISECT_RUNS=1 node verify/stall-bisect.mjs 2>&1)"
    CODE=$?

    if [ "$CODE" = "0" ]; then
      GAP="$(echo "$RESULT" | grep -oE '"gaps":\[[0-9]+' | grep -oE '[0-9]+$')"
      echo "${GAP}ms"
      printf '%s  r%s  %sms   %s\n' "$sha" "$round" "$GAP" "$SUBJECT" >> "$RESULTS_FILE"
    elif [ "$CODE" = "2" ]; then
      echo "UNMEASURABLE"
      printf '%s  r%s  UNMEASURABLE   %s\n' "$sha" "$round" "$SUBJECT" >> "$RESULTS_FILE"
    else
      echo "DRIVER FAILED"
      printf '%s  r%s  DRIVER FAILED   %s\n' "$sha" "$round" "$SUBJECT" >> "$RESULTS_FILE"
    fi

    kill_port "$PORT"
  done
  echo ""
done

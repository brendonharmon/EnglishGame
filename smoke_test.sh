#!/bin/bash
# Simple smoke test: start a static server, fetch index.html, and assert key string is present
PORT=8002
PYTHON="$(command -v python3 || command -v python)"
if [ -z "$PYTHON" ]; then
  echo "Python is required to run the smoke test." >&2
  exit 2
fi
# start server in background
$PYTHON -m http.server $PORT >/dev/null 2>&1 &
PID=$!
sleep 0.4
RESULT=$(curl -sS http://localhost:$PORT/index.html || true)
# tear down
kill $PID >/dev/null 2>&1 || true
if echo "$RESULT" | grep -q "Resume Quest"; then
  echo "SMOKE TEST: PASS"
  exit 0
else
  echo "SMOKE TEST: FAIL - index.html did not contain expected content" >&2
  exit 1
fi

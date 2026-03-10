#!/usr/bin/env bash
# Refresh all job snapshot data by starting a local Next.js server
# and curling each slug endpoint. Designed to run in GitHub Actions
# but can also be run locally after `npm run build`.
set -euo pipefail

PORT=3000
SNAPSHOT_DIR="src/data/snapshots"
INTELLIGENCE_DIR="src/data/intelligence"
BASE_URL="http://localhost:${PORT}/api/snapshot"
INTELLIGENCE_URL="http://localhost:${PORT}/api/role-intelligence"
REFRESH_SECRET="${REFRESH_SECRET:-}"

# All 20 slugs from src/data/jobTitles.ts
SLUGS=(
  creative-director
  design-director
  head-of-design
  vp-of-design
  cco
  senior-product-designer
  ux-designer
  product-designer
  ux-researcher
  design-systems-designer
  brand-designer
  graphic-designer
  visual-designer
  art-director
  motion-designer
  copywriter
  content-strategist
  ux-writer
  creative-copywriter
  content-designer
)

# Ensure output directories exist
mkdir -p "$SNAPSHOT_DIR"
mkdir -p "$INTELLIGENCE_DIR"

# Start Next.js production server in background
echo "Starting Next.js server on port ${PORT}..."
npx next start -p "$PORT" &
SERVER_PID=$!

# Ensure we kill the server on exit (success or failure)
trap "echo 'Stopping server (PID ${SERVER_PID})...'; kill $SERVER_PID 2>/dev/null || true" EXIT

# Wait for server to be ready (up to 30 seconds)
echo "Waiting for server to be ready..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:${PORT}" > /dev/null 2>&1; then
    echo "Server is ready after ${i}s"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Server did not start within 30 seconds"
    exit 1
  fi
  sleep 1
done

# Fetch each slug
SUCCESS=0
FAIL=0

for slug in "${SLUGS[@]}"; do
  echo -n "Fetching ${slug}... "

  # Build curl args: always include live=true, add auth header if secret is set
  CURL_ARGS=(-sf -w "%{http_code}" -o "${SNAPSHOT_DIR}/${slug}.json")
  if [ -n "$REFRESH_SECRET" ]; then
    CURL_ARGS+=(-H "X-Refresh-Token: ${REFRESH_SECRET}")
  fi

  HTTP_CODE=$(curl "${CURL_ARGS[@]}" \
    "${BASE_URL}/${slug}?live=true" 2>/dev/null) || HTTP_CODE="000"

  if [ "$HTTP_CODE" = "200" ]; then
    # Validate it is real JSON (not an error page)
    if python3 -c "import json; json.load(open('${SNAPSHOT_DIR}/${slug}.json'))" 2>/dev/null; then
      echo "OK (${HTTP_CODE})"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "INVALID JSON (${HTTP_CODE})"
      rm -f "${SNAPSHOT_DIR}/${slug}.json"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "FAILED (${HTTP_CODE})"
    rm -f "${SNAPSHOT_DIR}/${slug}.json"
    FAIL=$((FAIL + 1))
  fi

  # Small delay between requests to be kind to external APIs
  sleep 2
done

echo ""
echo "Snapshots: ${SUCCESS} succeeded, ${FAIL} failed out of ${#SLUGS[@]} total"

# Fail the workflow if more than half failed
if [ "$FAIL" -gt 10 ]; then
  echo "ERROR: Too many snapshot failures (${FAIL}/${#SLUGS[@]}). Something is wrong."
  exit 1
fi

# --- Phase 2: Role Intelligence (requires ANTHROPIC_API_KEY) ---
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo ""
  echo "Skipping role intelligence refresh (ANTHROPIC_API_KEY not set)"
else
  echo ""
  echo "=== Refreshing Role Intelligence ==="
  INT_SUCCESS=0
  INT_FAIL=0

  for slug in "${SLUGS[@]}"; do
    echo -n "Intelligence ${slug}... "

    HTTP_CODE=$(curl -sf -w "%{http_code}" -o "${INTELLIGENCE_DIR}/${slug}.json" \
      "${INTELLIGENCE_URL}/${slug}?live=true" 2>/dev/null) || HTTP_CODE="000"

    if [ "$HTTP_CODE" = "200" ]; then
      if python3 -c "import json; json.load(open('${INTELLIGENCE_DIR}/${slug}.json'))" 2>/dev/null; then
        echo "OK (${HTTP_CODE})"
        INT_SUCCESS=$((INT_SUCCESS + 1))
      else
        echo "INVALID JSON (${HTTP_CODE})"
        rm -f "${INTELLIGENCE_DIR}/${slug}.json"
        INT_FAIL=$((INT_FAIL + 1))
      fi
    else
      echo "FAILED (${HTTP_CODE})"
      rm -f "${INTELLIGENCE_DIR}/${slug}.json"
      INT_FAIL=$((INT_FAIL + 1))
    fi

    # Longer delay — Anthropic API calls take more time
    sleep 5
  done

  echo ""
  echo "Intelligence: ${INT_SUCCESS} succeeded, ${INT_FAIL} failed out of ${#SLUGS[@]} total"
fi

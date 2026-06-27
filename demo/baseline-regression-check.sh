#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/qasmoke-baseline-demo"
baseline="$out_dir/baseline.json"
repeat="$out_dir/repeat.json"
summary="$out_dir/repeat-summary.txt"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js run fixtures/basic \
  --provider fixture \
  --output "$baseline" \
  --format summary > "$out_dir/baseline-summary.txt"

node dist/cli.js run fixtures/basic \
  --provider fixture \
  --baseline "$baseline" \
  --max-score-drop 0 \
  --output "$repeat" \
  --format summary > "$summary"

test -s "$baseline"
test -s "$repeat"
grep -q '"pass": true' "$baseline"
grep -q '"regression"' "$repeat"
grep -q "PASS" "$summary"

echo "Baseline report: $baseline"
echo "Repeat report: $repeat"
echo "Repeat summary: $summary"

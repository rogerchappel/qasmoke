#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"

npm run build >/dev/null

node dist/cli.js inspect fixtures/basic > "$tmp/basic-inspect.json"
node dist/cli.js run fixtures/basic \
  --provider fixture \
  --format summary \
  --output "$tmp/basic-report.json" > "$tmp/basic-summary.txt"

node dist/cli.js run fixtures/format \
  --provider fixture \
  --case-threshold 1 \
  --suite-threshold 1 \
  --format jsonl > "$tmp/format-report.jsonl"

grep -q '"cases": 2' "$tmp/basic-inspect.json"
grep -q "PASS" "$tmp/basic-summary.txt"
grep -q '"id":"json-boolean"' "$tmp/format-report.jsonl"

echo "Inspect JSON: $tmp/basic-inspect.json"
echo "Summary: $tmp/basic-summary.txt"
echo "JSONL report: $tmp/format-report.jsonl"

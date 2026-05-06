#!/usr/bin/env bash
set -euo pipefail
mkdir -p .tmp
node dist/cli.js inspect fixtures/basic > .tmp/inspect.json
node dist/cli.js run fixtures/basic --provider fixture --output .tmp/report.json > .tmp/run.json
node dist/cli.js run fixtures/basic --provider fixture --format summary > .tmp/run-summary.txt
node dist/cli.js run fixtures/basic --provider fixture --format jsonl > .tmp/run.jsonl
node dist/cli.js generate fixtures/prompts.txt --name generated-smoke --out .tmp/generated --source smoke-test > .tmp/generate.json
node -e "const fs=require('fs'); const report=JSON.parse(fs.readFileSync('.tmp/report.json','utf8')); if(!report.pass) process.exit(1);"
grep -q '^PASS basic-smoke-pack' .tmp/run-summary.txt
test "$(wc -l < .tmp/run.jsonl | tr -d ' ')" -eq 2
if node dist/cli.js run fixtures/failing --provider fixture --format summary > .tmp/failing-summary.txt; then
  echo "expected failing fixture to return non-zero" >&2
  exit 1
fi
grep -q '^FAIL failing-smoke-pack' .tmp/failing-summary.txt

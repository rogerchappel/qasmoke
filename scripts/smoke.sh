#!/usr/bin/env bash
set -euo pipefail
mkdir -p .tmp
node dist/cli.js inspect fixtures/basic > .tmp/inspect.json
node dist/cli.js run fixtures/basic --provider fixture --output .tmp/report.json > .tmp/run.json
node dist/cli.js generate fixtures/prompts.txt --name generated-smoke --out .tmp/generated --source smoke-test > .tmp/generate.json
node -e "const fs=require('fs'); const report=JSON.parse(fs.readFileSync('.tmp/report.json','utf8')); if(!report.pass) process.exit(1);"

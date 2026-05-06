#!/usr/bin/env bash
set -euo pipefail
for required in README.md SECURITY.md CONTRIBUTING.md docs/PRD.md docs/TASKS.md docs/ORCHESTRATION.md docs/orchestration.json; do
  test -s "$required"
done
node -e "JSON.parse(require('fs').readFileSync('docs/orchestration.json','utf8'))"
npm run check
npm run build
npm test
npm run smoke
npm pack --dry-run >/dev/null

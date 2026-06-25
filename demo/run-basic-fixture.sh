#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${TMPDIR:-/tmp}/qasmoke-basic-demo"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js inspect fixtures/basic > "$out_dir/inspect.json"
grep -q '"cases": 2' "$out_dir/inspect.json"

node dist/cli.js run fixtures/basic --provider fixture --output "$out_dir/report.json" > "$out_dir/run.json"
node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(!report.pass || report.total !== 2 || report.failed !== 0) process.exit(1);" "$out_dir/report.json"

node dist/cli.js generate fixtures/prompts.txt --name demo-generated --out "$out_dir/generated" --source demo-script > "$out_dir/generate.json"
test -f "$out_dir/generated/pack.json"
grep -q '"name": "demo-generated"' "$out_dir/generated/pack.json"

echo "demo ok: wrote $out_dir/report.json and $out_dir/generated/pack.json"

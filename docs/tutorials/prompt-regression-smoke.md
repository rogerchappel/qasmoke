# Prompt Regression Smoke Demo

This walkthrough uses the checked-in `fixtures/basic` pack to show the full qasmoke loop: inspect a pack, run it with the deterministic fixture provider, and generate a starter pack from prompt ideas.

## Run the demo

```sh
npm install
npm run build
bash demo/run-basic-fixture.sh
```

The script writes a temporary demo folder with:

- `inspect.json` summarizing pack metadata and case count
- `report.json` containing pass/fail results for each case
- `generated/pack.json` created from `fixtures/prompts.txt`

## Inspect the fixture pack

```sh
node dist/cli.js inspect fixtures/basic
```

The bundled pack has two deterministic cases. It is intentionally small so it can run in CI or inside an agent handoff without a real model provider.

## Run the smoke suite

```sh
node dist/cli.js run fixtures/basic --provider fixture --output /tmp/qasmoke-report.json
```

The fixture provider reads expected outputs from the fixture metadata and produces a JSON report with suite-level totals, per-case scores, thresholds, tags, and provenance.

## Generate a starter pack

```sh
node dist/cli.js generate fixtures/prompts.txt --name starter-pack --out /tmp/qasmoke-generated --source "prompt brainstorm"
```

Generated packs are drafts. Review expected answers before using them as a gate.

## Verification

```sh
npm run smoke
bash demo/run-basic-fixture.sh
```

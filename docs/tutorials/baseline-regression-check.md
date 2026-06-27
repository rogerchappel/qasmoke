# Baseline Regression Check

Use this recipe when you want a small, deterministic rehearsal of qasmoke's
baseline comparison before adding it to CI.

## What the demo proves

- `fixtures/basic` can produce a JSON report.
- A later run can compare against that report with `--baseline`.
- `--max-score-drop 0` keeps the demo strict: any score drop should fail.
- The committed `fixture` provider keeps the flow local and deterministic.

## Run it

```sh
bash demo/baseline-regression-check.sh
```

The script builds the CLI, writes a baseline report under
`$TMPDIR/qasmoke-baseline-demo`, reruns the same fixture pack against that
baseline, and checks that the repeat report includes regression metadata.

## Manual commands

```sh
npm run build
node dist/cli.js run fixtures/basic --provider fixture --output /tmp/qasmoke-baseline.json --format summary
node dist/cli.js run fixtures/basic --provider fixture --baseline /tmp/qasmoke-baseline.json --max-score-drop 0 --format summary
```

## Promotion angle

This is a good short demo for maintainers who do not need a full eval platform
for every prompt change. Show the first JSON report, then show the second run
using that report as the baseline.

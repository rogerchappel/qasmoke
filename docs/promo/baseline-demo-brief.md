# Baseline Demo Brief

## Hook

"Turn yesterday's prompt smoke report into today's regression gate."

## Demo beats

1. Open `fixtures/basic/pack.json` and show the two deterministic cases.
2. Run `bash demo/baseline-regression-check.sh`.
3. Open the baseline JSON path printed by the script.
4. Open the repeat JSON path and point out the `regression` block.
5. Mention the boundary: fixture outputs are deterministic, but expected
   answers still need human review.

## Copy points

- qasmoke writes JSON reports that can be saved as lightweight baselines.
- The fixture provider lets CI exercise the report and comparison path without
  network calls.
- `--max-score-drop 0` is useful for strict smoke checks around known-good
  fixture packs.

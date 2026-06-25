# Video Brief: Tiny Prompt Regression Smoke Tests

## Hook

Turn two checked-in prompt fixtures into a deterministic JSON regression report in under a minute.

## Demo beats

1. Open `fixtures/basic/pack.json` and show the case IDs, expected answers, tags, and provenance.
2. Run `node dist/cli.js inspect fixtures/basic` to prove the pack shape before running it.
3. Run `node dist/cli.js run fixtures/basic --provider fixture --output /tmp/qasmoke-report.json`.
4. Open the report and highlight pass/fail totals, scores, thresholds, and case tags.
5. Run `node dist/cli.js generate fixtures/prompts.txt --name starter-pack --out /tmp/qasmoke-generated --source "prompt brainstorm"` and explain that generated packs are review drafts.

## Exact command

```sh
bash demo/run-basic-fixture.sh
```

## Claims to avoid

- Do not call this a full eval platform.
- Do not imply generated packs are production-ready without review.
- Do not claim hosted model adapters are included in the MVP.

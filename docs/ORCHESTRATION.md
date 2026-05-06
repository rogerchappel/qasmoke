# qasmoke Orchestration

## Local-first workflow
1. Author or generate a tiny fixture pack.
2. Inspect the pack to verify provenance and case count.
3. Run `qasmoke run` with the deterministic fixture provider in CI or local smoke.
4. Gate changes on report pass/fail or JSON score thresholds.
5. Swap in future provider adapters only when explicitly configured.

## Agent workflow
- Agents can generate starter packs from prompt lists.
- Agents can run deterministic smoke checks without credentials.
- Reports are JSON by default so other tools can diff or summarize them.

## Guardrails
- No hidden network calls in V1.
- No telemetry.
- No secret loading.
- Generated packs are synthetic drafts and should be reviewed before production use.

## CI Gate Pattern
```bash
npm run build
node dist/cli.js run fixtures/basic --provider fixture --format summary
```

For artifact capture, write JSON while showing a terse status line:

```bash
node dist/cli.js run fixtures/basic --provider fixture --output .tmp/qasmoke.json --format summary
```

## Failure Debug Pattern
1. Re-run with `--format json` to inspect each case output.
2. Check `matchedExpected`, `matcher`, and `threshold` before changing prompts.
3. Keep fixture updates in the same PR as the behavior change so regressions stay reviewable.

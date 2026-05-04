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

# qasmoke Social Hooks

Drafts grounded in the current fixture runner, deterministic fixture provider,
and local JSON/summary/JSONL reports.

## Short Posts

1. `qasmoke` is a tiny local-first fixture runner for prompt and model regression checks. Inspect a pack, run deterministic cases, and save a JSON report for review.
2. New qasmoke demo: two checked-in fixtures, one deterministic provider, one JSON report you can diff in CI or attach to an agent handoff.
3. Generated fixture packs are useful brainstorming output, not magic gates. `qasmoke generate` creates drafts so humans can review expected answers before they become checks.
4. `qasmoke run fixtures/basic --provider fixture` is a tiny local regression gate for prompt and adapter changes: no network calls, just fixture-backed pass/fail output.
5. Full eval stack not needed for every prompt tweak. qasmoke keeps a small gold pack in-repo and writes reports that are easy to diff in CI.
6. qasmoke can inspect a fixture pack, run it deterministically, and emit JSONL for quick review artifacts.

## Demo Angles

Run the basic fixture demo:

```sh
bash demo/run-basic-fixture.sh
```

Run the fixture gate demo:

```sh
bash demo/run-fixture-gate.sh
```

Show the inspect JSON, the PASS summary, and the JSONL lines from the format
pack. Emphasize that the included `fixture` provider is deterministic.

## Guardrails

- Fixture packs are only as good as their expected answers.
- Generated packs are drafts until reviewed.
- V1 ships the deterministic fixture provider only.

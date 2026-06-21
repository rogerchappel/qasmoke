# qasmoke Social Hooks

Drafts grounded in the current fixture runner, deterministic fixture provider,
and local JSON/summary/JSONL reports.

## Short Posts

1. `qasmoke run fixtures/basic --provider fixture` is a tiny local regression
   gate for prompt and adapter changes: no network calls, just fixture-backed
   pass/fail output.
2. Full eval stack not needed for every prompt tweak. qasmoke keeps a small gold
   pack in-repo and writes reports that are easy to diff in CI.
3. qasmoke can inspect a fixture pack, run it deterministically, and emit JSONL
   for quick review artifacts.

## Demo Angle

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

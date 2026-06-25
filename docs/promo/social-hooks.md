# Social Hooks

1. `qasmoke` is a tiny local-first fixture runner for prompt and model regression checks. Inspect a pack, run deterministic cases, and save a JSON report for review.
2. New qasmoke demo: two checked-in fixtures, one deterministic provider, one JSON report you can diff in CI or attach to an agent handoff.
3. Generated fixture packs are useful brainstorming output, not magic gates. `qasmoke generate` creates drafts so humans can review expected answers before they become checks.

## Demo command

```sh
bash demo/run-basic-fixture.sh
```

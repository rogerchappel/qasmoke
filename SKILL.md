# qasmoke Skill

Use this skill when an agent needs a small, deterministic regression smoke test for prompts, model adapters, or QA fixtures before trusting a larger eval run.

## Inputs

- A fixture pack directory or JSON file with `pack.json` shape.
- Optional baseline report JSON from a previous run.
- Optional prompt list when generating a starter pack.

## Workflow

1. Inspect the pack with `qasmoke inspect <fixturePath>`.
2. Run the fixture provider locally with `qasmoke run <fixturePath> --provider fixture --format summary`.
3. Write JSON evidence with `--output .tmp/qasmoke-report.json` when the result will be attached to a PR or release checklist.
4. Use `--format markdown` for a human-readable review note.
5. Compare against a baseline with `--baseline <report.json> --max-score-drop <number>` before accepting prompt or matcher changes.

## Side Effects

- Default commands only read fixture files and print results.
- `--output` writes a local JSON report.
- `generate` writes a draft fixture pack to the selected output directory.
- No command makes network calls or contacts model providers in V1.

## Approval Boundaries

Ask before replacing established gold fixtures, changing thresholds, or adding a provider that uses external credentials. Generated packs are drafts until a human or reviewer checks expected answers.

## Verification

Run:

```bash
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
```

## Examples

```bash
qasmoke inspect fixtures/basic
qasmoke run fixtures/basic --provider fixture --format markdown
qasmoke run fixtures/basic --provider fixture --output .tmp/qasmoke.json --suite-threshold 1
```

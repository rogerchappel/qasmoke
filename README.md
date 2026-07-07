# qasmoke

qasmoke is a tiny QA smoke harness for catching prompt or model regressions before they get fancy.

Think of it as a pocket-sized fire alarm for fixture-based evals: small, loud, deterministic, and hard to ignore.

> Inspired by the existence of `tiny_qa_benchmark_pp`, but rebuilt here as a local-first TypeScript CLI/library with different scope and implementation.

## Why it exists

When you're iterating on prompts, lightweight agents, or adapter glue, full eval pipelines are often overkill. qasmoke gives you:

- tiny gold fixture packs
- deterministic smoke runs for CI
- JSON reports with case, suite, and baseline regression thresholds
- synthetic pack generation with provenance
- zero hidden network calls

## Install

```bash
npm install
npm run build
npm link
```

Or run locally without linking:

```bash
node dist/cli.js --help
```

## Quickstart

```bash
npm install
npm run build
node dist/cli.js inspect fixtures/basic
node dist/cli.js run fixtures/basic --provider fixture --output .tmp/report.json
node dist/cli.js run fixtures/basic --provider fixture --format summary
node dist/cli.js run fixtures/format --provider fixture --baseline .tmp/report.json --max-score-drop 0
node dist/cli.js generate fixtures/prompts.txt --name starter-pack --out .tmp/generated
```

For a fixture-backed demo that verifies the inspect, run, and generate flow:

```bash
bash demo/run-basic-fixture.sh
```

See [Prompt Regression Smoke Demo](docs/tutorials/prompt-regression-smoke.md) for the walkthrough. Promotion drafts live in [docs/promo/video-brief.md](docs/promo/video-brief.md) and [docs/promo/social-hooks.md](docs/promo/social-hooks.md).

To run a disposable fixture gate demo with summary and JSONL outputs:

```bash
bash demo/run-fixture-gate.sh
```

To rehearse a baseline comparison before wiring qasmoke into CI:

```bash
bash demo/baseline-regression-check.sh
```

The baseline walkthrough is documented in
[docs/tutorials/baseline-regression-check.md](docs/tutorials/baseline-regression-check.md).

## CLI

### Inspect a fixture pack

```bash
qasmoke inspect fixtures/basic
```

### Run a deterministic smoke suite

```bash
qasmoke run fixtures/basic --provider fixture --output .tmp/report.json --case-threshold 1 --suite-threshold 1
```

Compare a run against a previous JSON report:

```bash
qasmoke run fixtures/basic --provider fixture --baseline .tmp/report.json --max-score-drop 0
```

### Generate a synthetic starter pack

```bash
qasmoke generate fixtures/prompts.txt --name starter-pack --out fixtures/generated --source "brainstorm session"
```

## Fixture format

Each pack lives in `pack.json`:

```json
{
  "name": "basic-smoke-pack",
  "version": "1.0.0",
  "cases": [
    {
      "id": "capital-france",
      "prompt": "What is the capital of France?",
      "expected": "Paris",
      "matcher": "contains",
      "threshold": 0.9
    }
  ]
}
```

## Matchers

- `contains` (default): full credit for exact normalized output, 0.9 for containing the expected answer
- `exact`: normalized output must equal the expected answer
- `regex`: expected value is evaluated as a case-insensitive JavaScript regular expression

Use the deterministic `fixture` provider in CI when you want to verify fixture wiring and report behavior without any model or network dependency.

V1 ships two deterministic packs:

- `fixtures/basic` covers short factual/control examples.
- `fixtures/format` covers strict formatting examples.

Case-level thresholds use a `0..1` score. Exact normalized matches score `1`, contains matches score `0.9`, and misses score `0`.

## Reports

`qasmoke run` emits a JSON report with:

- suite summary: `total`, `passed`, `failed`, `score`, `pass`
- threshold settings: `caseThreshold`, `suiteThreshold`
- per-case outputs and matched expected values
- optional `regression` block when `--baseline` is supplied
- fixture provenance copied from the pack

## Release Verification

```bash
npm run check
npm run build
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

The npm package includes `dist`, `fixtures`, `docs`, and maintainer policy files so the published quickstart can inspect and run the bundled deterministic packs.

## Library use

```ts
import { runSuite, createFixtureProvider } from 'qasmoke';

const report = await runSuite({
  fixturePath: 'fixtures/basic',
  provider: createFixtureProvider()
});

console.log(report.pass);
```

## Safety

- local-first only
- no telemetry
- no hidden network calls
- no credential scraping
- generated packs are drafts until you review expected answers

## Attribution

qasmoke was inspired by the public existence and activity signal of [`tiny_qa_benchmark_pp`](https://github.com/vincentkoc/tiny_qa_benchmark_pp). This project intentionally uses a different name, implementation, TypeScript CLI/library shape, fixture format, and local-first V1 scope.

## Verification

```bash
npm test
npm run check
npm run build
npm run smoke
bash demo/run-basic-fixture.sh
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

## Roadmap after MVP

- explicit provider adapters for real model backends
- richer matchers beyond exact/contains
- threshold presets and trend snapshots

## GitHub description

Tiny fixture-driven QA smoke tests for LLM and prompt regressions.

## Suggested topics

`llm`, `qa`, `smoke-test`, `regression-testing`, `fixtures`, `cli`, `typescript`, `evals`

## Release readiness

Run the same checks that CI uses before opening a release PR:

```sh
npm run release:readiness
npm run release:check
```

`release:readiness` validates repository metadata, the package files allowlist, package smoke coverage, and CI placeholder cleanup. `release:check` runs that readiness validator plus the project build, test, smoke, and package dry-run checks.

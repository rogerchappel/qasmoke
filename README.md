# qasmoke

qasmoke is a tiny QA smoke harness for catching prompt or model regressions before they get fancy.

Think of it as a pocket-sized fire alarm for fixture-based evals: small, loud, deterministic, and hard to ignore.

> Inspired by the existence of `tiny_qa_benchmark_pp`, but rebuilt here as a local-first TypeScript CLI/library with different scope and implementation.

## Why it exists

When you're iterating on prompts, lightweight agents, or adapter glue, full eval pipelines are often overkill. qasmoke gives you:

- tiny gold fixture packs
- deterministic smoke runs for CI
- JSON reports that are easy to diff
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
node dist/cli.js generate fixtures/prompts.txt --name starter-pack --out .tmp/generated
```

## CLI

### Inspect a fixture pack

```bash
qasmoke inspect fixtures/basic
```

### Run a deterministic smoke suite

```bash
qasmoke run fixtures/basic --provider fixture --output .tmp/report.json
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

## Verification

```bash
npm test
npm run check
npm run build
npm run smoke
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

# qasmoke PRD

## Summary
qasmoke is a local-first micro QA benchmark harness for ultra-fast regression smoke tests. It gives developers and agents a deterministic way to validate prompt/model behavior against tiny gold fixture packs before wider evals or releases.

## Goals
- Run tiny QA regression packs in seconds in local dev and CI.
- Keep V1 deterministic and reviewable with no hidden network behavior.
- Support provenance-aware synthetic fixture generation.
- Ship a CLI and library usable by humans and agents.

## Non-goals
- Hosted eval dashboards.
- Provider credential management.
- Large-scale benchmark orchestration.

## Users
- OSS maintainers checking prompt/model regressions.
- Agent builders who need a tiny gating smoke suite.
- Developers who want a dead-simple local benchmark harness.

## V1 Requirements
- Fixture pack format stored as JSON.
- Deterministic fixture provider for smoke and CI verification.
- `run`, `inspect`, and `generate` CLI commands.
- JSON reporting with pass/fail summary, per-case scoring, suite thresholds, and optional baseline regression checks.
- Fixture provenance recorded in packs and surfaced in reports.

## Success Criteria
- `qasmoke run fixtures/basic --provider fixture` passes locally.
- `qasmoke run fixtures/format --provider fixture --baseline <report>` can gate score drops.
- CLI can inspect a pack and generate a synthetic starter pack.
- Tests cover parsing, scoring, running, and generation.

## V1 Quality Bar
- Reports expose matcher, threshold, score, pass/fail, and provenance for traceable regressions.
- CLI supports machine-readable JSON, JSONL for log pipelines, and compact summaries for CI annotations.
- Fixture validation rejects duplicate case IDs and unsupported matchers before running a suite.
- Negative fixtures verify that failures produce non-zero exits, not just pretty reports.

## Attribution
Inspired by `tiny_qa_benchmark_pp` as an adjacent public signal. qasmoke does not copy its name, code, or package shape; V1 is a local-first TypeScript CLI/library with deterministic fixture packs and explicit safety boundaries.

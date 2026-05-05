# Release candidate readiness

## Scope

This release-candidate pass adds repeatable readiness checks for qasmoke before tagging or publishing.

## Readiness additions

- Added `releasebox.config.json` for a Node CLI release profile.
- Added `npm run release:check` to run type checks, build, tests, smoke tests, and `npm pack --dry-run`.
- Added GitHub release and release dry-run workflows from releasebox templates.
- Added GitHub labels metadata and Dependabot coverage for npm and GitHub Actions.

## Local verification

Run from a clean checkout after installing dependencies with `npm ci`:

```bash
npm run release:check
bash scripts/validate.sh
node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .
```

Latest local results:

- `npm run release:check` — passed; includes `npm run check`, `npm run build`, `npm test` (4 tests), `npm run smoke`, and `npm pack --dry-run`.
- `bash scripts/validate.sh` — passed.
- `releasebox check .` — passed all readiness checks: config, CI workflow, release dry-run workflow, task and orchestration docs, Dependabot, npm scripts, smoke script, and bin entry.

## Release notes seed

- Package: `qasmoke@0.1.0`
- Artifact dry-run: `qasmoke-0.1.0.tgz`
- Current readiness status: candidate-ready after local checks above.

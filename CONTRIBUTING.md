# Contributing

Thanks for kicking the tires on qasmoke.

## Development

```bash
npm install
npm run check
npm run build
npm test
npm run smoke
bash scripts/validate.sh
```

## Principles

- Keep the CLI deterministic.
- Prefer fixture-backed tests over mock-heavy abstractions.
- Preserve the local-first safety model.
- Make provider integrations explicit, never automatic.
- Keep external inspiration attribution in docs without copying upstream implementation details.

## Pull requests

Small, reviewable PRs are ideal. If behavior changes, update fixtures, tests, and README examples together.

## Fixture changes

When adding or changing a fixture pack:

1. Give every case a stable, unique `id`.
2. Pick the narrowest matcher that reflects the intended behavior.
3. Include a negative or edge-case fixture when the change affects failure handling.
4. Run `bash scripts/validate.sh` before opening the PR.

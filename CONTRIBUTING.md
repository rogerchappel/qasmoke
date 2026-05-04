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

## Pull requests

Small, reviewable PRs are ideal. If behavior changes, update fixtures, tests, and README examples together.

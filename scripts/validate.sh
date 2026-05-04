#!/usr/bin/env bash
set -euo pipefail
npm run check
npm run build
npm test
npm run smoke

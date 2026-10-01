import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflowPath = new URL('../.github/workflows/release.yml', import.meta.url);

test('tag releases run the release verification gate before packaging', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  assert.match(workflow, /^on:\n  push:\n    tags:\n      - ['"]?v\*\.\*\.\*['"]?$/m,
    'release workflow must run for version tags');
  const install = workflow.indexOf('- run: npm ci');
  const verification = workflow.indexOf('- run: npm run release:check');
  const packaging = workflow.indexOf('- run: npm pack');

  assert.notEqual(install, -1, 'release workflow must install dependencies');
  assert.notEqual(verification, -1, 'tag releases must run npm run release:check');
  assert.notEqual(packaging, -1, 'release workflow must package after verification');
  assert.ok(install < verification && verification < packaging,
    'release verification must run after installation and before packaging');
});

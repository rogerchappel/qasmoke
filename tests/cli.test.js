import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('run exit status follows the suite threshold result', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-threshold-'));
  const packDir = path.join(tempDir, 'pack');
  await mkdir(packDir);
  await writeFile(path.join(packDir, 'pack.json'), JSON.stringify({
    name: 'partial-pack',
    version: '1.0.0',
    cases: [
      { id: 'pass', prompt: 'p', expected: 'yes', metadata: { fixtureOutput: 'yes' } },
      { id: 'fail', prompt: 'f', expected: 'yes', metadata: { fixtureOutput: 'no' } }
    ]
  }), 'utf8');

  const result = spawnSync(process.execPath, [
    'dist/cli.js', 'run', packDir, '--suite-threshold', '0.5'
  ], { encoding: 'utf8' });
  const report = JSON.parse(result.stdout);

  assert.equal(report.pass, true);
  assert.equal(result.status, 0);
});

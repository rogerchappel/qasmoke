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

test('run reports invalid baseline scores and exits nonzero', async () => {
  for (const score of [-0.1, 1.1, 'not-a-number']) {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-baseline-'));
    const baselinePath = path.join(tempDir, 'baseline.json');
    await writeFile(baselinePath, JSON.stringify({ score }), 'utf8');

    const result = spawnSync(process.execPath, [
      'dist/cli.js', 'run', 'fixtures/basic', '--baseline', baselinePath
    ], { encoding: 'utf8' });

    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^qasmoke error: Baseline report at .* score must be a finite number between 0 and 1\n$/);
  }
});

const invalidInvocations = [
  ['run', 'fixtures/basic', '--format'],
  ['run', 'fixtures/basic', '--provider'],
  ['run', 'fixtures/basic', '--output'],
  ['run', 'fixtures/basic', '--threshold'],
  ['run', 'fixtures/basic', '--case-threshold'],
  ['run', 'fixtures/basic', '--suite-threshold'],
  ['run', 'fixtures/basic', '--baseline'],
  ['run', 'fixtures/basic', '--max-score-drop'],
  ['generate', 'fixtures/prompts.txt', '--name'],
  ['generate', 'fixtures/prompts.txt', '--out'],
  ['generate', 'fixtures/prompts.txt', '--source'],
  ['run', 'fixtures/basic', '--bogus', 'value'],
  ['inspect', 'fixtures/basic', 'extra'],
  ['run', 'fixtures/basic', '--format', 'json', '--format', 'summary'],
  ['run', 'fixtures/basic', '--threshold', '1', '--case-threshold', '1']
];

test('invalid CLI usage fails before command side effects', () => {
  for (const args of invalidInvocations) {
    const result = spawnSync(process.execPath, ['dist/cli.js', ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /^qasmoke error: /, args.join(' '));
  }
});

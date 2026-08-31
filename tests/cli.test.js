import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

function runCli(args) {
  return spawnSync(process.execPath, ['dist/cli.js', ...args], { encoding: 'utf8' });
}

test('CLI rejects missing commands with actionable stderr help', () => {
  const result = runCli([]);

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^qasmoke error: Missing command\./);
  assert.match(result.stderr, /Usage:/);
  assert.match(result.stderr, /qasmoke run <fixturePath>/);
});

for (const flag of ['-h', '--help']) {
  test(`CLI ${flag} prints help successfully`, () => {
    const result = runCli([flag]);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /^qasmoke\n\nUsage:/);
    assert.equal(result.stderr, '');
  });
}

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

test('run rejects malformed fixtures without reporting PASS or formatter errors', async () => {
  const malformedCases = [
    { id: 'blank-expected', prompt: 'p', expected: '' },
    { id: 'empty-expected', prompt: 'p', expected: [] },
    { id: 'bad-tags', prompt: 'p', expected: 'x', tags: 'not-an-array' }
  ];

  for (const fixtureCase of malformedCases) {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-fixture-'));
    const packPath = path.join(tempDir, 'pack.json');
    await writeFile(packPath, JSON.stringify({ name: 'invalid', version: '1.0.0', cases: [fixtureCase] }));
    const result = spawnSync(process.execPath, [
      'dist/cli.js', 'run', packPath, '--provider', 'fixture', '--format', 'markdown'
    ], { encoding: 'utf8' });

    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, new RegExp(`Fixture case "${fixtureCase.id}"`));
    assert.doesNotMatch(result.stderr, /TypeError/);
    assert.doesNotMatch(result.stderr, /PASS/);
  }
});

test('generate rejects prompt sources without non-blank prompts before creating output', async () => {
  for (const contents of ['', '  \n\t\n   ']) {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-empty-prompts-'));
    const promptsPath = path.join(tempDir, 'prompts.txt');
    const outputPath = path.join(tempDir, 'generated');
    await writeFile(promptsPath, contents, 'utf8');

    const result = spawnSync(process.execPath, [
      'dist/cli.js', 'generate', promptsPath, '--out', outputPath
    ], { encoding: 'utf8' });

    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'qasmoke error: Prompts file must contain at least one non-blank prompt\n');
    assert.equal(existsSync(outputPath), false);
    assert.equal(existsSync(path.join(outputPath, 'pack.json')), false);
  }
});

test('generate creates a pack from a non-empty prompts source', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-prompts-'));
  const promptsPath = path.join(tempDir, 'prompts.txt');
  const outputPath = path.join(tempDir, 'generated');
  await writeFile(promptsPath, '\n First prompt \n\nSecond prompt\n', 'utf8');

  const result = spawnSync(process.execPath, [
    'dist/cli.js', 'generate', promptsPath, '--out', outputPath
  ], { encoding: 'utf8' });
  const report = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(report.cases, 2);
  assert.equal(existsSync(path.join(outputPath, 'pack.json')), true);
});

test('run rejects an unsupported format before running or writing a report', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-cli-format-'));
  const reportPath = path.join(tempDir, 'report.json');
  const result = spawnSync(process.execPath, [
    'dist/cli.js', 'run', 'fixtures/basic', '--provider', 'fixture',
    '--output', reportPath, '--format', 'xml'
  ], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(
    result.stderr,
    'qasmoke error: Unsupported format: xml. Expected one of: json, summary, jsonl, markdown\n'
  );
  await assert.rejects(access(reportPath), { code: 'ENOENT' });
});

test('run accepts every documented output format', () => {
  for (const format of ['json', 'summary', 'jsonl', 'markdown']) {
    const result = spawnSync(process.execPath, [
      'dist/cli.js', 'run', 'fixtures/basic', '--provider', 'fixture', '--format', format
    ], { encoding: 'utf8' });

    assert.equal(result.status, 0, `${format}: ${result.stderr}`);
    assert.notEqual(result.stdout, '', format);
    assert.equal(result.stderr, '', format);
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

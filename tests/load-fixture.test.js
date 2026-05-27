import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFixturePack, runSuite, scoreCase, generatePack, createFixtureProvider, formatSummary, formatJsonLines } from '../dist/index.js';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('loadFixturePack reads a pack directory', async () => {
  const pack = await loadFixturePack('fixtures/basic');
  assert.equal(pack.name, 'basic-smoke-pack');
  assert.equal(pack.cases.length, 2);
});

test('loadFixturePack validates case thresholds', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-invalid-'));
  await writeFile(path.join(tempDir, 'pack.json'), JSON.stringify({
    name: 'invalid-pack',
    version: '1.0.0',
    cases: [{ id: 'bad-threshold', prompt: 'p', expected: 'x', threshold: 2 }]
  }), 'utf8');

  await assert.rejects(() => loadFixturePack(tempDir), /threshold must be between 0 and 1/);
});

test('scoreCase gives full credit for exact matches', () => {
  const result = scoreCase({ id: 'a', prompt: 'p', expected: 'Paris' }, 'Paris');
  assert.equal(result.score, 1);
  assert.equal(result.matchedExpected, 'Paris');
});

test('runSuite produces a passing report for the fixture provider', async () => {
  const report = await runSuite({
    fixturePath: 'fixtures/basic',
    provider: createFixtureProvider()
  });
  assert.equal(report.pass, true);
  assert.equal(report.failed, 0);
  assert.equal(report.caseThreshold, 1);
  assert.equal(report.suiteThreshold, 1);
});

test('runSuite compares against a baseline report', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-baseline-'));
  const baselinePath = path.join(tempDir, 'baseline.json');
  await writeFile(baselinePath, JSON.stringify({ score: 1 }), 'utf8');

  const report = await runSuite({
    fixturePath: 'fixtures/basic',
    provider: createFixtureProvider(),
    baselinePath,
    maxScoreDrop: 0
  });

  assert.equal(report.pass, true);
  assert.deepEqual(report.regression, {
    baselinePath,
    baselineScore: 1,
    currentScore: 1,
    scoreDelta: 0,
    allowedDrop: 0,
    pass: true
  });
});

test('runSuite fails when regression exceeds the allowed drop', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-regression-'));
  const packDir = path.join(tempDir, 'pack');
  await writeFile(path.join(tempDir, 'baseline.json'), JSON.stringify({ score: 1 }), 'utf8');
  await mkdir(packDir);
  await writeFile(path.join(packDir, 'pack.json'), JSON.stringify({
    name: 'regression-pack',
    version: '1.0.0',
    cases: [
      { id: 'pass', prompt: 'p', expected: 'yes' },
      { id: 'fail', prompt: 'f', expected: 'yes', metadata: { fixtureOutput: 'no' } }
    ]
  }), 'utf8');

  const report = await runSuite({
    fixturePath: packDir,
    provider: createFixtureProvider(),
    baselinePath: path.join(tempDir, 'baseline.json'),
    maxScoreDrop: 0.1
  });

  assert.equal(report.pass, false);
  assert.equal(report.score, 0.5);
  assert.equal(report.regression.pass, false);
});

test('generatePack writes a synthetic pack with provenance', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-'));
  const result = await generatePack({
    name: 'generated-pack',
    outDir: tempDir,
    prompts: ['What is 2+2?'],
    source: 'test suite'
  });
  const raw = await readFile(result.path, 'utf8');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.name, 'generated-pack');
  assert.equal(parsed.cases[0].expected, 'TODO: expected answer for What is 2+2?');
  assert.equal(parsed.provenance.source, 'test suite');
});


test('loadFixturePack rejects duplicate case ids', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-invalid-'));
  await writeFile(path.join(tempDir, 'pack.json'), JSON.stringify({
    name: 'invalid',
    version: '1.0.0',
    cases: [
      { id: 'same', prompt: 'one', expected: 'one' },
      { id: 'same', prompt: 'two', expected: 'two' }
    ]
  }));
  await assert.rejects(() => loadFixturePack(tempDir), /Duplicate fixture case id/);
});

test('scoreCase supports regex matchers', () => {
  const result = scoreCase({ id: 'regex', prompt: 'p', expected: 'build\\s+passed', matcher: 'regex' }, 'Build PASSED in 2s');
  assert.equal(result.score, 1);
  assert.equal(result.matchedExpected, 'build\\s+passed');
});

test('scoreCase reports the fixture id for invalid regex matchers', () => {
  assert.throws(
    () => scoreCase({ id: 'broken-regex', prompt: 'p', expected: '[unterminated', matcher: 'regex' }, 'anything'),
    /Invalid regex matcher for case "broken-regex"/
  );
});


test('formatters produce compact CI-friendly output', async () => {
  const report = await runSuite({ fixturePath: 'fixtures/basic', provider: createFixtureProvider() });
  assert.match(formatSummary(report), /^PASS basic-smoke-pack/);
  const lines = formatJsonLines(report).split('\n');
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[0]).provider, 'fixture');
});


test('runSuite reports fixture-backed failures', async () => {
  const report = await runSuite({ fixturePath: 'fixtures/failing', provider: createFixtureProvider() });
  assert.equal(report.pass, false);
  assert.equal(report.failed, 1);
  assert.equal(report.cases[0].output, 'Lyon');
});

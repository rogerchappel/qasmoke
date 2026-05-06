import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFixturePack, runSuite, scoreCase, generatePack, createFixtureProvider } from '../dist/index.js';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('loadFixturePack reads a pack directory', async () => {
  const pack = await loadFixturePack('fixtures/basic');
  assert.equal(pack.name, 'basic-smoke-pack');
  assert.equal(pack.cases.length, 2);
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

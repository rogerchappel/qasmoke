import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'qasmoke-version-smoke-'));
const packageRoot = path.join(fixtureRoot, 'package');
const expectedVersion = '9.8.7-test';

try {
  const pack = spawnSync('npm', ['pack', '--json', '--pack-destination', fixtureRoot], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  assert.equal(pack.status, 0, pack.stderr || pack.stdout);

  const [{ filename }] = JSON.parse(pack.stdout);
  const extract = spawnSync('tar', ['-xzf', path.join(fixtureRoot, filename), '-C', fixtureRoot], {
    encoding: 'utf8'
  });
  assert.equal(extract.status, 0, extract.stderr || extract.stdout);

  const manifestPath = path.join(packageRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.version = expectedVersion;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const cli = spawnSync(process.execPath, ['dist/cli.js', '--version'], {
    cwd: packageRoot,
    encoding: 'utf8'
  });
  assert.equal(cli.status, 0, cli.stderr || cli.stdout);
  assert.equal(cli.stdout.trim(), expectedVersion);
  assert.equal(cli.stderr, '');
  console.log(`Packaged CLI reports package.json version ${expectedVersion}.`);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

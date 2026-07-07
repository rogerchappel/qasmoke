import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
};

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (pkg.scripts?.build) {
  run('npm', ['run', 'build']);
}
const output = run('npm', ['pack', '--dry-run', '--json']);
const [pack] = JSON.parse(output);
const included = new Set(pack.files.map((file) => file.path));
const expected = new Set();
const addPath = (value) => {
  if (typeof value === 'string' && !value.startsWith('#')) {
    expected.add(value.replace(/^\.\//, ''));
  }
};
const walkExports = (value) => {
  if (typeof value === 'string') addPath(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(walkExports);
};
if (typeof pkg.bin === 'string') addPath(pkg.bin);
else if (pkg.bin && typeof pkg.bin === 'object') Object.values(pkg.bin).forEach(addPath);
addPath(pkg.main);
addPath(pkg.types);
walkExports(pkg.exports);
const requiredReleaseFiles = [
  'demo/run-basic-fixture.sh',
  'demo/run-fixture-gate.sh',
  'docs/tutorials/prompt-regression-smoke.md',
  'docs/tutorials/baseline-regression-check.md',
  'fixtures/basic/pack.json',
  'fixtures/failing/pack.json',
  'fixtures/format/pack.json',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md'
];
const missing = [...expected, ...requiredReleaseFiles].filter((file) => !included.has(file));
if (missing.length) {
  console.error('Package tarball is missing release-candidate files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}
console.log(`Package tarball includes ${expected.size} declared entrypoint(s) and ${requiredReleaseFiles.length} release-candidate files.`);

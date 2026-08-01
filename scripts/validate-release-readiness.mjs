import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const scripts = packageJson.scripts ?? {};
const failures = [];

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(packageJson.repository, 'package.json must declare repository metadata');
requireField(Array.isArray(packageJson.files) && packageJson.files.length > 0, 'package.json must declare a non-empty files allowlist');
requireField(scripts['package:smoke'], 'package.json scripts must include package:smoke');
requireField(scripts['release:check'], 'package.json scripts must include release:check');

const workflowDir = path.join(root, '.github', 'workflows');
if (fs.existsSync(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir).filter((file) => /\.ya?ml$/.test(file));
  requireField(workflowFiles.length > 0, 'repository must include at least one workflow file');

  for (const file of workflowFiles) {
    const workflow = fs.readFileSync(path.join(workflowDir, file), 'utf8');
    requireField(!/TODO|FIXME|template becomes an app|customization TODO/i.test(workflow), '.github/workflows/' + file + ' still contains placeholder text');
  }

  const combined = workflowFiles.map((file) => fs.readFileSync(path.join(workflowDir, file), 'utf8')).join('\n');
  requireField(/release:check/.test(combined), 'CI workflows must run npm run release:check');

  const releasePath = path.join(workflowDir, 'release.yml');
  requireField(fs.existsSync(releasePath), 'repository must include .github/workflows/release.yml');
  if (fs.existsSync(releasePath)) {
    const release = fs.readFileSync(releasePath, 'utf8');
    requireField(/workflow_dispatch:/.test(release), 'release workflow must provide workflow_dispatch recovery');
    requireField(/git rev-parse HEAD/.test(release) && /refs\/tags\//.test(release), 'release workflow must verify the immutable tag checkout');
    requireField(/Tag .* does not match package version/.test(release), 'release workflow must validate tag against package version');
    requireField(/npm publish --provenance --access public/.test(release), 'release workflow must publish to npm with provenance and public access');
    requireField(/npm view .*PACKAGE_VERSION/.test(release), 'release workflow must check whether the package version already exists');
    requireField(/gh release view/.test(release), 'release recovery must verify the existing GitHub release');
    requireField(/github\.event_name != 'workflow_dispatch'/.test(release), 'release recovery must not create a duplicate GitHub release');
  }
}

if (failures.length > 0) {
  console.error('Release readiness validation failed:');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Release readiness validation passed.');

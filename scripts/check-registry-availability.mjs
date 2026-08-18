import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function checkRegistryAvailability(packageName, version, run = spawnSync) {
  const spec = `${packageName}@${version}`;
  const result = run('npm', ['view', spec, 'version', '--json'], {
    encoding: 'utf8',
    env: process.env
  });

  if (result.status === 0) {
    let publishedVersion;
    try {
      publishedVersion = JSON.parse(result.stdout);
    } catch {
      throw new Error(`npm returned invalid JSON while checking ${spec}`);
    }
    if (publishedVersion !== version) {
      throw new Error(`npm returned ${JSON.stringify(publishedVersion)} while checking ${spec}`);
    }
    return 'available';
  }

  const diagnostic = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
  if (result.status === 1 && /E404|404 Not Found/i.test(diagnostic)) return 'absent';

  throw new Error(`npm registry lookup failed for ${spec}: ${diagnostic.trim() || `exit ${result.status}`}`);
}

function main() {
  const packagePath = process.env.npm_package_json ?? path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const packageName = process.env.npm_package_name ?? packageJson.name;
  const version = process.env.npm_package_version ?? packageJson.version;
  if (!packageName || !version) throw new Error('package name and version are required');
  console.log(checkRegistryAvailability(packageName, version));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createFixtureProvider } from './providers/fixture.js';
import { runSuite } from './core/run-suite.js';
import { generatePack } from './core/generate-pack.js';

function printHelp(): void {
  console.log(`qasmoke\n\nUsage:\n  qasmoke run <fixturePath> [--provider fixture] [--output report.json] [--threshold 1]\n  qasmoke inspect <fixturePath>\n  qasmoke generate <promptsFile> [--name smoke-pack] [--out fixtures/generated] [--source note]\n\nSafety:\n  - local-first only\n  - no hidden network calls\n  - fixture provider is deterministic for CI smoke checks\n`);
}

function parseFlag(args: string[], name: string, fallback?: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

async function inspectFixture(fixturePath: string): Promise<void> {
  const resolved = path.resolve(fixturePath);
  const filePath = resolved.endsWith('.json') ? resolved : path.join(resolved, 'pack.json');
  const raw = await readFile(filePath, 'utf8');
  const pack = JSON.parse(raw) as { name: string; version: string; description?: string; cases?: unknown[]; provenance?: Record<string, unknown> };
  console.log(JSON.stringify({
    name: pack.name,
    version: pack.version,
    description: pack.description ?? null,
    cases: Array.isArray(pack.cases) ? pack.cases.length : 0,
    provenance: pack.provenance ?? null
  }, null, 2));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log('0.1.0');
    return;
  }

  if (command === 'run') {
    const fixturePath = args[1];
    if (!fixturePath) throw new Error('Missing fixture path for run command');
    const providerName = parseFlag(args, '--provider', 'fixture');
    if (providerName !== 'fixture') {
      throw new Error(`Unsupported provider: ${providerName}. V1 ships only the deterministic fixture provider.`);
    }
    const output = parseFlag(args, '--output');
    const thresholdValue = parseFlag(args, '--threshold');
    const report = await runSuite({
      fixturePath,
      provider: createFixtureProvider(),
      outputPath: output,
      threshold: thresholdValue ? Number(thresholdValue) : 1
    });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.pass ? 0 : 1;
    return;
  }

  if (command === 'inspect') {
    const fixturePath = args[1];
    if (!fixturePath) throw new Error('Missing fixture path for inspect command');
    await inspectFixture(fixturePath);
    return;
  }

  if (command === 'generate') {
    const promptsFile = args[1];
    if (!promptsFile) throw new Error('Missing prompts file for generate command');
    const raw = await readFile(path.resolve(promptsFile), 'utf8');
    const prompts = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const outDir = parseFlag(args, '--out', 'fixtures/generated') as string;
    const name = parseFlag(args, '--name', 'smoke-pack') as string;
    const source = parseFlag(args, '--source');
    await mkdir(path.resolve(outDir), { recursive: true });
    const result = await generatePack({ name, outDir, prompts, source });
    console.log(JSON.stringify({ path: result.path, cases: result.pack.cases.length, name: result.pack.name }, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`qasmoke error: ${message}`);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createFixtureProvider } from './providers/fixture.js';
import { runSuite } from './core/run-suite.js';
import { generatePack } from './core/generate-pack.js';
import { formatJsonLines, formatMarkdown, formatSummary } from './core/format-report.js';
import { loadFixturePack } from './core/load-fixture.js';

function printHelp(): void {
  console.log(`qasmoke\n\nUsage:\n  qasmoke run <fixturePath> [--provider fixture] [--output report.json] [--threshold 1] [--case-threshold 1] [--suite-threshold 1] [--baseline report.json] [--max-score-drop 0] [--format json|summary|jsonl|markdown]\n  qasmoke inspect <fixturePath>\n  qasmoke generate <promptsFile> [--name smoke-pack] [--out fixtures/generated] [--source note]\n\nThresholds:\n  --case-threshold   Minimum score for each case to count as passed (default: 1)\n  --suite-threshold  Minimum fraction of passed cases for the suite to pass (default: 1)\n  Threshold values must be finite numbers from 0 through 1.\n\nExit behavior:\n  Invalid usage and failed suites exit nonzero; usage diagnostics are written to stderr.\n\nSafety:\n  - local-first only\n  - no hidden network calls\n  - fixture provider is deterministic for CI smoke checks\n`);
}

function parseOptions(args: string[], allowed: readonly string[]): Map<string, string> {
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    if (!name.startsWith('--')) throw new Error(`Unexpected positional argument: ${name}`);
    if (!allowed.includes(name)) throw new Error(`Unknown option: ${name}`);
    if (options.has(name)) throw new Error(`Duplicate option: ${name}`);
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for option: ${name}`);
    options.set(name, value);
  }
  return options;
}

function numberOption(options: Map<string, string>, name: string, fallback: number): number {
  const raw = options.get(name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be a finite number between 0 and 1`);
  }
  return value;
}

async function inspectFixture(fixturePath: string): Promise<void> {
  const pack = await loadFixturePack(fixturePath);
  console.log(JSON.stringify({
    name: pack.name,
    version: pack.version,
    description: pack.description ?? null,
    cases: pack.cases.length,
    tags: Array.from(new Set(pack.cases.flatMap((item) => item.tags ?? []))).sort(),
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
    const options = parseOptions(args.slice(2), ['--provider', '--output', '--threshold', '--case-threshold', '--suite-threshold', '--baseline', '--max-score-drop', '--format']);
    if (options.has('--threshold') && options.has('--case-threshold')) {
      throw new Error('Conflicting options: --threshold and --case-threshold');
    }
    const providerName = options.get('--provider') ?? 'fixture';
    if (providerName !== 'fixture') {
      throw new Error(`Unsupported provider: ${providerName}. V1 ships only the deterministic fixture provider.`);
    }
    const output = options.get('--output');
    const caseThresholdName = options.has('--case-threshold') ? '--case-threshold' : '--threshold';
    const report = await runSuite({
      fixturePath,
      provider: createFixtureProvider(),
      outputPath: output,
      caseThreshold: numberOption(options, caseThresholdName, 1),
      suiteThreshold: numberOption(options, '--suite-threshold', 1),
      baselinePath: options.get('--baseline'),
      maxScoreDrop: numberOption(options, '--max-score-drop', 0)
    });
    const format = options.get('--format') ?? 'json';
    if (format === 'summary') {
      console.log(formatSummary(report));
    } else if (format === 'jsonl') {
      console.log(formatJsonLines(report));
    } else if (format === 'markdown') {
      console.log(formatMarkdown(report));
    } else if (format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
    process.exitCode = report.pass ? 0 : 1;
    return;
  }

  if (command === 'inspect') {
    const fixturePath = args[1];
    if (!fixturePath) throw new Error('Missing fixture path for inspect command');
    parseOptions(args.slice(2), []);
    await inspectFixture(fixturePath);
    return;
  }

  if (command === 'generate') {
    const promptsFile = args[1];
    if (!promptsFile) throw new Error('Missing prompts file for generate command');
    const options = parseOptions(args.slice(2), ['--out', '--name', '--source']);
    const raw = await readFile(path.resolve(promptsFile), 'utf8');
    const prompts = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const outDir = options.get('--out') ?? 'fixtures/generated';
    const name = options.get('--name') ?? 'smoke-pack';
    const source = options.get('--source');
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

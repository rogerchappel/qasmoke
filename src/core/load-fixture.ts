import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { FixturePack } from './types.js';

function isExpectedValue(value: unknown): value is string | string[] {
  return typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
}

export async function loadFixturePack(inputPath: string): Promise<FixturePack> {
  const resolved = path.resolve(inputPath);
  const info = await stat(resolved);
  const filePath = info.isDirectory() ? path.join(resolved, 'pack.json') : resolved;
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as FixturePack;

  if (!parsed.name || !parsed.version || !Array.isArray(parsed.cases)) {
    throw new Error(`Invalid fixture pack at ${filePath}`);
  }

  const ids = new Set<string>();
  for (const testCase of parsed.cases) {
    if (!testCase.id || typeof testCase.id !== 'string') {
      throw new Error(`Fixture case is missing a string id in ${filePath}`);
    }

    if (!testCase.prompt || typeof testCase.prompt !== 'string') {
      throw new Error(`Fixture case "${testCase.id}" is missing a string prompt in ${filePath}`);
    }

    if (!isExpectedValue(testCase.expected)) {
      throw new Error(`Fixture case is missing required fields in ${filePath}`);
    }
    if (ids.has(testCase.id)) {
      throw new Error(`Duplicate fixture case id '${testCase.id}' in ${filePath}`);
    }
    ids.add(testCase.id);

    if (testCase.matcher && !['exact', 'contains', 'regex'].includes(testCase.matcher)) {
      throw new Error(`Unsupported matcher '${testCase.matcher}' for fixture case '${testCase.id}' in ${filePath}`);
    }

    if (typeof testCase.threshold === 'number' && (testCase.threshold < 0 || testCase.threshold > 1)) {
      throw new Error(`Fixture case "${testCase.id}" threshold must be between 0 and 1 in ${filePath}`);
    }
  }

  return parsed;
}

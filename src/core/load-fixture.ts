import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { FixturePack } from './types.js';

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isExpectedValue(value: unknown): value is string | string[] {
  return isNonBlankString(value) ||
    (Array.isArray(value) && value.length > 0 && value.every(isNonBlankString));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function loadFixturePack(inputPath: string): Promise<FixturePack> {
  const resolved = path.resolve(inputPath);
  const info = await stat(resolved);
  const filePath = info.isDirectory() ? path.join(resolved, 'pack.json') : resolved;
  const raw = await readFile(filePath, 'utf8');
  const parsed: unknown = JSON.parse(raw);

  if (!isRecord(parsed) || !isNonBlankString(parsed.name) ||
    !isNonBlankString(parsed.version) || !Array.isArray(parsed.cases)) {
    throw new Error(`Invalid fixture pack at ${filePath}`);
  }

  const ids = new Set<string>();
  for (const [index, testCase] of parsed.cases.entries()) {
    if (!isRecord(testCase)) {
      throw new Error(`Fixture case at index ${index} must be an object in ${filePath}`);
    }
    if (!isNonBlankString(testCase.id)) {
      throw new Error(`Fixture case is missing a string id in ${filePath}`);
    }

    if (!isNonBlankString(testCase.prompt)) {
      throw new Error(`Fixture case "${testCase.id}" is missing a string prompt in ${filePath}`);
    }

    if (!isExpectedValue(testCase.expected)) {
      throw new Error(`Fixture case "${testCase.id}" expected must be a non-blank string or non-empty array of non-blank strings in ${filePath}`);
    }
    if (ids.has(testCase.id)) {
      throw new Error(`Duplicate fixture case id '${testCase.id}' in ${filePath}`);
    }
    ids.add(testCase.id);

    if (testCase.matcher !== undefined &&
      (typeof testCase.matcher !== 'string' || !['exact', 'contains', 'regex'].includes(testCase.matcher))) {
      throw new Error(`Unsupported matcher '${String(testCase.matcher)}' for fixture case '${testCase.id}' in ${filePath}`);
    }

    if (testCase.tags !== undefined &&
      (!Array.isArray(testCase.tags) || !testCase.tags.every(isNonBlankString))) {
      throw new Error(`Fixture case "${testCase.id}" tags must be an array of non-blank strings in ${filePath}`);
    }

    if (testCase.metadata !== undefined && !isRecord(testCase.metadata)) {
      throw new Error(`Fixture case "${testCase.id}" metadata must be an object in ${filePath}`);
    }

    if (testCase.threshold !== undefined &&
      (typeof testCase.threshold !== 'number' || !Number.isFinite(testCase.threshold) || testCase.threshold < 0 || testCase.threshold > 1)) {
      throw new Error(`Fixture case "${testCase.id}" threshold must be a finite number between 0 and 1 in ${filePath}`);
    }
  }

  return parsed as FixturePack;
}

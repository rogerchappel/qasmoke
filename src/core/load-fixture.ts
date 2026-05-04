import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { FixturePack } from './types.js';

export async function loadFixturePack(inputPath: string): Promise<FixturePack> {
  const resolved = path.resolve(inputPath);
  const info = await stat(resolved);
  const filePath = info.isDirectory() ? path.join(resolved, 'pack.json') : resolved;
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as FixturePack;

  if (!parsed.name || !parsed.version || !Array.isArray(parsed.cases)) {
    throw new Error(`Invalid fixture pack at ${filePath}`);
  }

  for (const testCase of parsed.cases) {
    if (!testCase.id || !testCase.prompt || !testCase.expected) {
      throw new Error(`Fixture case is missing required fields in ${filePath}`);
    }
  }

  return parsed;
}

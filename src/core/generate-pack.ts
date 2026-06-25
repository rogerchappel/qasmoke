import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FixturePack } from './types.js';

export async function generatePack(options: {
  name: string;
  outDir: string;
  prompts: string[];
  source?: string;
}): Promise<{ path: string; pack: FixturePack }> {
  const pack: FixturePack = {
    name: options.name,
    version: '1.0.0',
    description: 'Synthetic QA smoke pack generated locally by qasmoke.',
    provenance: {
      generatedBy: 'qasmoke generate',
      generatedAt: new Date().toISOString(),
      source: options.source ?? 'manual prompts',
      notes: 'Synthetic seed pack. Review expected answers before CI use.'
    },
    cases: options.prompts.map((prompt, index) => ({
      id: `case-${index + 1}`,
      prompt,
      expected: `REVIEW_REQUIRED: expected answer for ${prompt}`,
      threshold: 1,
      tags: ['synthetic']
    }))
  };

  const targetDir = path.resolve(options.outDir);
  await mkdir(targetDir, { recursive: true });
  const filePath = path.join(targetDir, 'pack.json');
  await writeFile(filePath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  return { path: filePath, pack };
}

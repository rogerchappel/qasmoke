import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scoreCase } from './score.js';
import { loadFixturePack } from './load-fixture.js';
import { Provider, SuiteReport } from './types.js';

export async function runSuite(options: {
  fixturePath: string;
  provider: Provider;
  outputPath?: string;
  threshold?: number;
}): Promise<SuiteReport> {
  const pack = await loadFixturePack(options.fixturePath);
  const threshold = options.threshold ?? 1;
  const cases = [];

  for (const testCase of pack.cases) {
    const result = await options.provider.runCase(testCase);
    const scored = scoreCase(testCase, result.output);
    const caseThreshold = testCase.threshold ?? threshold;
    cases.push({
      id: testCase.id,
      pass: scored.score >= caseThreshold,
      prompt: testCase.prompt,
      output: result.output,
      matchedExpected: scored.matchedExpected,
      score: scored.score,
      threshold: caseThreshold,
      tags: testCase.tags ?? []
    });
  }

  const passed = cases.filter((item) => item.pass).length;
  const report: SuiteReport = {
    suiteName: pack.name,
    provider: options.provider.name,
    total: cases.length,
    passed,
    failed: cases.length - passed,
    score: cases.length === 0 ? 0 : Number((passed / cases.length).toFixed(4)),
    threshold,
    pass: passed === cases.length,
    generatedAt: new Date().toISOString(),
    cases,
    provenance: pack.provenance
  };

  if (options.outputPath) {
    const resolvedOutput = path.resolve(options.outputPath);
    await mkdir(path.dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  return report;
}

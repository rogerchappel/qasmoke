import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scoreCase } from './score.js';
import { loadFixturePack } from './load-fixture.js';
import { Provider, RegressionReport, SuiteReport } from './types.js';

function assertThreshold(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be a number between 0 and 1`);
  }
}

async function compareBaseline(options: {
  baselinePath: string;
  currentScore: number;
  allowedDrop: number;
}): Promise<RegressionReport> {
  assertThreshold('maxScoreDrop', options.allowedDrop);
  const resolvedBaseline = path.resolve(options.baselinePath);
  const parsed = JSON.parse(await readFile(resolvedBaseline, 'utf8')) as Partial<SuiteReport>;
  if (typeof parsed.score !== 'number' || !Number.isFinite(parsed.score)) {
    throw new Error(`Baseline report at ${resolvedBaseline} is missing numeric score`);
  }

  const scoreDelta = Number((options.currentScore - parsed.score).toFixed(4));
  return {
    baselinePath: resolvedBaseline,
    baselineScore: parsed.score,
    currentScore: options.currentScore,
    scoreDelta,
    allowedDrop: options.allowedDrop,
    pass: scoreDelta >= -options.allowedDrop
  };
}

export async function runSuite(options: {
  fixturePath: string;
  provider: Provider;
  outputPath?: string;
  caseThreshold?: number;
  suiteThreshold?: number;
  baselinePath?: string;
  maxScoreDrop?: number;
}): Promise<SuiteReport> {
  const pack = await loadFixturePack(options.fixturePath);
  const caseThreshold = options.caseThreshold ?? 1;
  const suiteThreshold = options.suiteThreshold ?? 1;
  assertThreshold('caseThreshold', caseThreshold);
  assertThreshold('suiteThreshold', suiteThreshold);
  const cases = [];

  for (const testCase of pack.cases) {
    const result = await options.provider.runCase(testCase);
    const scored = scoreCase(testCase, result.output);
    const testCaseThreshold = testCase.threshold ?? caseThreshold;
    cases.push({
      id: testCase.id,
      pass: scored.score >= testCaseThreshold,
      prompt: testCase.prompt,
      output: result.output,
      matchedExpected: scored.matchedExpected,
      matcher: testCase.matcher ?? 'contains',
      score: scored.score,
      threshold: testCaseThreshold,
      tags: testCase.tags ?? []
    });
  }

  const passed = cases.filter((item) => item.pass).length;
  const score = cases.length === 0 ? 0 : Number((passed / cases.length).toFixed(4));
  const regression = options.baselinePath
    ? await compareBaseline({
        baselinePath: options.baselinePath,
        currentScore: score,
        allowedDrop: options.maxScoreDrop ?? 0
      })
    : undefined;
  const report: SuiteReport = {
    suiteName: pack.name,
    provider: options.provider.name,
    total: cases.length,
    passed,
    failed: cases.length - passed,
    score,
    caseThreshold,
    suiteThreshold,
    pass: passed === cases.length && score >= suiteThreshold && (regression?.pass ?? true),
    generatedAt: new Date().toISOString(),
    cases,
    regression,
    provenance: pack.provenance
  };

  if (options.outputPath) {
    const resolvedOutput = path.resolve(options.outputPath);
    await mkdir(path.dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  return report;
}

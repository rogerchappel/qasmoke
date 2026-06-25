import { SuiteReport } from './types.js';

export function formatSummary(report: SuiteReport): string {
  const status = report.pass ? 'PASS' : 'FAIL';
  return `${status} ${report.suiteName} (${report.passed}/${report.total}, score ${report.score})`;
}

export function formatJsonLines(report: SuiteReport): string {
  return report.cases.map((testCase) => JSON.stringify({
    suite: report.suiteName,
    provider: report.provider,
    id: testCase.id,
    pass: testCase.pass,
    score: testCase.score,
    threshold: testCase.threshold,
    matcher: testCase.matcher,
    tags: testCase.tags
  })).join('\n');
}

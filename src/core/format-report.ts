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

export function formatMarkdown(report: SuiteReport): string {
  const status = report.pass ? 'PASS' : 'FAIL';
  const lines = [
    `# qasmoke Report: ${report.suiteName}`,
    '',
    `Status: ${status}`,
    `Provider: ${report.provider}`,
    `Score: ${report.score}`,
    `Cases: ${report.passed}/${report.total} passed`,
    `Generated: ${report.generatedAt}`,
    '',
    '| Case | Status | Score | Threshold | Matcher | Tags |',
    '|---|---:|---:|---:|---|---|'
  ];

  for (const testCase of report.cases) {
    lines.push([
      escapeMarkdown(testCase.id),
      testCase.pass ? 'PASS' : 'FAIL',
      String(testCase.score),
      String(testCase.threshold),
      testCase.matcher,
      escapeMarkdown(testCase.tags.join(', ') || '-')
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }

  if (report.regression) {
    lines.push(
      '',
      '## Regression',
      '',
      `Baseline: ${report.regression.baselinePath}`,
      `Baseline score: ${report.regression.baselineScore}`,
      `Current score: ${report.regression.currentScore}`,
      `Delta: ${report.regression.scoreDelta}`,
      `Allowed drop: ${report.regression.allowedDrop}`,
      `Status: ${report.regression.pass ? 'PASS' : 'FAIL'}`
    );
  }

  if (report.provenance) {
    lines.push('', '## Provenance', '');
    for (const [key, value] of Object.entries(report.provenance)) {
      if (value !== undefined) {
        lines.push(`- ${key}: ${value}`);
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, '\\|');
}

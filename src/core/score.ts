import { FixtureCase } from './types.js';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreExpected(testCase: FixtureCase, output: string, expected: string): number {
  const matcher = testCase.matcher ?? 'contains';

  if (matcher === 'regex') {
    return new RegExp(expected, 'i').test(output) ? 1 : 0;
  }

  const normalizedOutput = normalize(output);
  const normalizedExpected = normalize(expected);

  if (matcher === 'exact') {
    return normalizedOutput === normalizedExpected ? 1 : 0;
  }

  if (normalizedOutput === normalizedExpected) {
    return 1;
  }

  return normalizedOutput.includes(normalizedExpected) ? 0.9 : 0;
}

export function scoreCase(testCase: FixtureCase, output: string): { score: number; matchedExpected: string | null } {
  const expectedValues = Array.isArray(testCase.expected) ? testCase.expected : [testCase.expected];

  let best = { score: 0, matchedExpected: null as string | null };
  for (const expected of expectedValues) {
    const score = scoreExpected(testCase, output, expected);
    if (score > best.score) {
      best = { score, matchedExpected: expected };
    }
    if (best.score === 1) break;
  }

  return best;
}

import { FixtureCase } from './types.js';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function scoreCase(testCase: FixtureCase, output: string): { score: number; matchedExpected: string | null } {
  const expectedValues = Array.isArray(testCase.expected) ? testCase.expected : [testCase.expected];
  const normalizedOutput = normalize(output);

  for (const expected of expectedValues) {
    const normalizedExpected = normalize(expected);
    if (normalizedOutput === normalizedExpected) {
      return { score: 1, matchedExpected: expected };
    }

    if (normalizedOutput.includes(normalizedExpected)) {
      return { score: 0.9, matchedExpected: expected };
    }
  }

  return { score: 0, matchedExpected: null };
}

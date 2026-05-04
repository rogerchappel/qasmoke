import { FixtureCase, Provider } from '../core/types.js';

function fixtureAnswer(testCase: FixtureCase): string {
  if (testCase.metadata?.fixtureOutput && typeof testCase.metadata.fixtureOutput === 'string') {
    return testCase.metadata.fixtureOutput;
  }

  return Array.isArray(testCase.expected) ? testCase.expected[0] : testCase.expected;
}

export function createFixtureProvider(): Provider {
  return {
    name: 'fixture',
    async runCase(testCase) {
      return {
        output: fixtureAnswer(testCase),
        metadata: {
          deterministic: true
        }
      };
    }
  };
}

export type FixtureCase = {
  id: string;
  prompt: string;
  expected: string | string[];
  tags?: string[];
  threshold?: number;
  metadata?: Record<string, string | number | boolean>;
};

export type FixturePack = {
  name: string;
  version: string;
  description?: string;
  cases: FixtureCase[];
  provenance?: {
    generatedBy?: string;
    generatedAt?: string;
    notes?: string;
    source?: string;
  };
};

export type ProviderResult = {
  output: string;
  metadata?: Record<string, string | number | boolean>;
};

export type Provider = {
  name: string;
  runCase(testCase: FixtureCase): Promise<ProviderResult>;
};

export type CaseReport = {
  id: string;
  pass: boolean;
  prompt: string;
  output: string;
  matchedExpected: string | null;
  score: number;
  threshold: number;
  tags: string[];
};

export type SuiteReport = {
  suiteName: string;
  provider: string;
  total: number;
  passed: number;
  failed: number;
  score: number;
  threshold: number;
  pass: boolean;
  generatedAt: string;
  cases: CaseReport[];
  provenance?: FixturePack['provenance'];
};

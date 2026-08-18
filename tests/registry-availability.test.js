import assert from 'node:assert/strict';
import test from 'node:test';

import { checkRegistryAvailability } from '../scripts/check-registry-availability.mjs';

const runWith = (result) => () => result;

test('reports the exact package version as available', () => {
  const status = checkRegistryAvailability('qasmoke', '0.1.0', runWith({
    status: 0,
    stdout: '"0.1.0"\n',
    stderr: ''
  }));
  assert.equal(status, 'available');
});

test('reports an npm E404 as absent', () => {
  const status = checkRegistryAvailability('qasmoke', '0.1.0', runWith({
    status: 1,
    stdout: '',
    stderr: 'npm error code E404\nnpm error 404 Not Found'
  }));
  assert.equal(status, 'absent');
});

test('rejects authentication, network, and malformed registry responses', () => {
  assert.throws(
    () => checkRegistryAvailability('qasmoke', '0.1.0', runWith({ status: 1, stdout: '', stderr: 'npm error code E401' })),
    /registry lookup failed/
  );
  assert.throws(
    () => checkRegistryAvailability('qasmoke', '0.1.0', runWith({ status: 0, stdout: 'not json', stderr: '' })),
    /invalid JSON/
  );
});

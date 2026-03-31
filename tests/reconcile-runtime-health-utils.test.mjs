import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMismatchCounters,
  summarizeMismatchCounters,
} from '../scripts/reconcile-runtime-health-utils.mjs';

test('normalizeMismatchCounters converts unknown values to safe integers', () => {
  const result = normalizeMismatchCounters({
    a: '2',
    b: null,
    c: undefined,
    d: 'invalid',
    e: 4,
  });

  assert.deepEqual(result, {
    a: 2,
    b: 0,
    c: 0,
    d: 0,
    e: 4,
  });
});

test('summarizeMismatchCounters returns PASS when no mismatches', () => {
  const result = summarizeMismatchCounters({
    financeTerminalMissingError: 0,
    webhookFailedMissingError: 0,
  });

  assert.equal(result.criticalMismatchCount, 0);
  assert.equal(result.verdict, 'PASS');
});

test('summarizeMismatchCounters returns FAIL when mismatches exist', () => {
  const result = summarizeMismatchCounters({
    financeTerminalMissingError: 1,
    webhookFailedMissingError: 2,
  });

  assert.equal(result.criticalMismatchCount, 3);
  assert.equal(result.verdict, 'FAIL');
});


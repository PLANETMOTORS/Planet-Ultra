import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const OPS_METRICS = path.join(repoRoot, 'lib', 'ops', 'metrics.ts');
const RECONCILE_SCRIPT = path.join(repoRoot, 'scripts', 'reconcile-runtime-health.mjs');

test('ops metrics includes purchase/delivery/trade-in counters', () => {
  const source = fs.readFileSync(OPS_METRICS, 'utf8');
  assert.match(source, /purchaseSubmissions/);
  assert.match(source, /deliverySubmissions/);
  assert.match(source, /tradeInSubmissions/);
  assert.match(source, /purchaseRefunded/);
  assert.match(source, /tradeInCompleted/);
});

test('reconcile script includes lifecycle integrity mismatch checks', () => {
  const source = fs.readFileSync(RECONCILE_SCRIPT, 'utf8');
  assert.match(source, /purchasePaidMissingReturnDeadline/);
  assert.match(source, /purchaseCheckoutMissingStripeSession/);
  assert.match(source, /deliveryDeliveredMissingTrackingReference/);
  assert.match(source, /tradeInScheduledMissingPickup/);
  assert.match(source, /tradeInCompletedMissingTimestamp/);
});

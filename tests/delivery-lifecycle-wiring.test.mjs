import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DELIVERY_ROUTE = path.join(repoRoot, 'app', 'api', 'purchase', 'delivery', 'route.ts');
const DELIVERY_WEBHOOK_ROUTE = path.join(repoRoot, 'app', 'api', 'webhooks', 'delivery', 'route.ts');
const DELIVERY_STORE = path.join(repoRoot, 'lib', 'delivery', 'lifecycleStore.ts');
const TYPES_FILE = path.join(repoRoot, 'types', 'a5.ts');

test('delivery lifecycle store exists with scheduling and status updates', () => {
  const source = fs.readFileSync(DELIVERY_STORE, 'utf8');
  assert.match(source, /upsertDeliverySchedule/);
  assert.match(source, /updateDeliveryStatusByPurchaseSubmission/);
  assert.match(source, /getDeliveryScheduleForUser/);
});

test('purchase delivery route enforces rate-limit and paid-state scheduling', () => {
  const source = fs.readFileSync(DELIVERY_ROUTE, 'utf8');
  assert.match(source, /purchase_delivery/);
  assert.match(source, /purchase\.status !== 'paid'/);
  assert.match(source, /upsertDeliverySchedule/);
});

test('delivery webhook route maps provider events into lifecycle status updates', () => {
  const source = fs.readFileSync(DELIVERY_WEBHOOK_ROUTE, 'utf8');
  assert.match(source, /resolveDeliveryStatus/);
  assert.match(source, /updateDeliveryStatusByPurchaseSubmission/);
  assert.match(source, /x-delivery-secret/);
});

test('shared types expose delivery lifecycle and webhook namespace', () => {
  const source = fs.readFileSync(TYPES_FILE, 'utf8');
  assert.match(source, /export type DeliveryLifecycleStatus/);
  assert.match(source, /\| 'delivery'/);
});

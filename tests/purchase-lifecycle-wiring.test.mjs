import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const PURCHASE_SUBMIT_ROUTE = path.join(repoRoot, 'app', 'api', 'purchase', 'submit', 'route.ts');
const STRIPE_WEBHOOK_ROUTE = path.join(repoRoot, 'app', 'api', 'webhooks', 'stripe', 'route.ts');
const PURCHASE_RETURN_ROUTE = path.join(repoRoot, 'app', 'api', 'purchase', 'return', 'route.ts');
const PURCHASE_STORE = path.join(repoRoot, 'lib', 'purchase', 'lifecycleStore.ts');

test('purchase lifecycle store exists with checkout + stripe update hooks', () => {
  const source = fs.readFileSync(PURCHASE_STORE, 'utf8');
  assert.match(source, /createPurchaseSubmission/);
  assert.match(source, /markPurchaseCheckoutCreated/);
  assert.match(source, /updatePurchaseByStripeSession/);
});

test('purchase submit route persists lifecycle submission and checkout session', () => {
  const source = fs.readFileSync(PURCHASE_SUBMIT_ROUTE, 'utf8');
  assert.match(source, /createPurchaseSubmission/);
  assert.match(source, /markPurchaseCheckoutCreated/);
  assert.match(source, /purchaseSubmissionId/);
});

test('stripe webhook route updates purchase lifecycle states', () => {
  const source = fs.readFileSync(STRIPE_WEBHOOK_ROUTE, 'utf8');
  assert.match(source, /updatePurchaseByStripeSession/);
  assert.match(source, /purchase\.paid\.stripe_webhook/);
  assert.match(source, /purchase\.expired\.stripe_webhook/);
});

test('purchase return route exists for 10-day return workflow initiation', () => {
  const source = fs.readFileSync(PURCHASE_RETURN_ROUTE, 'utf8');
  assert.match(source, /purchase_return/);
  assert.match(source, /return_requested/);
});

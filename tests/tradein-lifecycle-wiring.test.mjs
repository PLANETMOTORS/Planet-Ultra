import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const OFFER_ROUTE = path.join(repoRoot, 'app', 'api', 'trade-in', 'offer', 'route.ts');
const ACCEPT_ROUTE = path.join(repoRoot, 'app', 'api', 'trade-in', 'accept', 'route.ts');
const STATUS_ROUTE = path.join(repoRoot, 'app', 'api', 'trade-in', 'status', 'route.ts');
const WEBHOOK_ROUTE = path.join(repoRoot, 'app', 'api', 'webhooks', 'tradein', 'route.ts');
const STORE_FILE = path.join(repoRoot, 'lib', 'tradein', 'lifecycleStore.ts');
const PAGE_FILE = path.join(repoRoot, 'app', 'sell-or-trade', 'page.tsx');

test('trade-in lifecycle store exists with offer and status transitions', () => {
  const source = fs.readFileSync(STORE_FILE, 'utf8');
  assert.match(source, /createTradeInOffer/);
  assert.match(source, /updateTradeInSubmissionState/);
  assert.match(source, /updateTradeInByExternalReference/);
});

test('trade-in offer route includes valuation and lifecycle write', () => {
  const source = fs.readFileSync(OFFER_ROUTE, 'utf8');
  assert.match(source, /estimateTradeInOffer/);
  assert.match(source, /createTradeInOffer/);
  assert.match(source, /tradein_offer/);
});

test('trade-in accept route enforces auth and offer-state transition', () => {
  const source = fs.readFileSync(ACCEPT_ROUTE, 'utf8');
  assert.match(source, /Unauthorized/);
  assert.match(source, /tradein_accept/);
  assert.match(source, /toStatus: 'accepted'/);
  assert.match(source, /toStatus: 'scheduled'/);
});

test('trade-in status and webhook routes are present', () => {
  const statusSource = fs.readFileSync(STATUS_ROUTE, 'utf8');
  const webhookSource = fs.readFileSync(WEBHOOK_ROUTE, 'utf8');
  assert.match(statusSource, /submissionId required/);
  assert.match(webhookSource, /x-tradein-secret/);
  assert.match(webhookSource, /resolveTradeInStatus/);
});

test('sell-or-trade page now exists and advertises API flow', () => {
  const source = fs.readFileSync(PAGE_FILE, 'utf8');
  assert.match(source, /Sell or Trade Your Vehicle/);
  assert.match(source, /\/api\/trade-in\/offer/);
});

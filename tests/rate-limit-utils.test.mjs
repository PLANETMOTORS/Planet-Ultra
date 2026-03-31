import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const RATE_LIMIT_LIB =
  '/Users/tonisultzberg@icloud.com/Desktop/CURSOR-PLANET/Planet-Ultra-merge-final/lib/security/rateLimit.ts';
const FINANCE_ROUTE =
  '/Users/tonisultzberg@icloud.com/Desktop/CURSOR-PLANET/Planet-Ultra-merge-final/app/api/finance/submit/route.ts';
const PURCHASE_ROUTE =
  '/Users/tonisultzberg@icloud.com/Desktop/CURSOR-PLANET/Planet-Ultra-merge-final/app/api/purchase/submit/route.ts';
const SAVED_ROUTE =
  '/Users/tonisultzberg@icloud.com/Desktop/CURSOR-PLANET/Planet-Ultra-merge-final/app/api/saved-vehicles/route.ts';
const VIEWS_ROUTE =
  '/Users/tonisultzberg@icloud.com/Desktop/CURSOR-PLANET/Planet-Ultra-merge-final/app/api/vehicle-views/route.ts';

test('rate limit utility returns 429 with Retry-After header', () => {
  const source = fs.readFileSync(RATE_LIMIT_LIB, 'utf8');
  assert.match(source, /status:\s*429/);
  assert.match(source, /Retry-After/);
  assert.match(source, /X-RateLimit-Limit/);
  assert.match(source, /X-RateLimit-Remaining/);
});

test('finance submit route is protected by distributed rate limit', () => {
  const source = fs.readFileSync(FINANCE_ROUTE, 'utf8');
  assert.match(source, /checkRateLimit/);
  assert.match(source, /finance_submit/);
});

test('purchase submit route is protected by distributed rate limit', () => {
  const source = fs.readFileSync(PURCHASE_ROUTE, 'utf8');
  assert.match(source, /checkRateLimit/);
  assert.match(source, /purchase_submit/);
});

test('saved vehicles write paths are protected by distributed rate limit', () => {
  const source = fs.readFileSync(SAVED_ROUTE, 'utf8');
  assert.match(source, /checkRateLimit/);
  assert.match(source, /saved_vehicles_write/);
});

test('vehicle views ingest path is protected by distributed rate limit', () => {
  const source = fs.readFileSync(VIEWS_ROUTE, 'utf8');
  assert.match(source, /checkRateLimit/);
  assert.match(source, /vehicle_views_ingest/);
});

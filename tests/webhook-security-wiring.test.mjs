import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEALERTRACK_WEBHOOK = path.join(repoRoot, 'app', 'api', 'webhooks', 'dealertrack', 'route.ts');
const ROUTEONE_WEBHOOK = path.join(repoRoot, 'app', 'api', 'webhooks', 'routeone', 'route.ts');
const AUTORAPTOR_WEBHOOK = path.join(repoRoot, 'app', 'api', 'webhooks', 'autoraptor', 'route.ts');
const STRIPE_WEBHOOK = path.join(repoRoot, 'app', 'api', 'webhooks', 'stripe', 'route.ts');

test('dealertrack and routeone webhooks fail closed when secret is missing', () => {
  const dealertrackSource = fs.readFileSync(DEALERTRACK_WEBHOOK, 'utf8');
  const routeoneSource = fs.readFileSync(ROUTEONE_WEBHOOK, 'utf8');
  assert.match(dealertrackSource, /if \(!expectedSecret\)/);
  assert.match(routeoneSource, /if \(!expectedSecret\)/);
  assert.match(dealertrackSource, /Webhook not configured/);
  assert.match(routeoneSource, /Webhook not configured/);
});

test('autoraptor webhook fails closed when secret is missing', () => {
  const source = fs.readFileSync(AUTORAPTOR_WEBHOOK, 'utf8');
  assert.match(source, /if \(!expectedSecret\)/);
  assert.match(source, /Webhook not configured/);
});

test('stripe webhook requires both webhook secret and stripe secret key', () => {
  const source = fs.readFileSync(STRIPE_WEBHOOK, 'utf8');
  assert.match(source, /STRIPE_WEBHOOK_SECRET/);
  assert.match(source, /STRIPE_SECRET_KEY/);
  assert.match(source, /Webhook not configured/);
});

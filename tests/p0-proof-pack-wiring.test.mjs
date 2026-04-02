import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const PROOF_SCRIPT = path.join(repoRoot, 'scripts', 'generate-p0-proof-pack.mjs');
const WEBHOOK_STORE = path.join(repoRoot, 'lib', 'webhooks', 'eventStore.ts');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('p0 proof pack script contains p0 lifecycle sections', () => {
  const source = fs.readFileSync(PROOF_SCRIPT, 'utf8');
  assert.match(source, /p0_03_dealertrack_lifecycle/);
  assert.match(source, /p0_04_finance_audit_trail/);
  assert.match(source, /p0_05_stripe_reconciliation/);
  assert.match(source, /p0_06_webhook_replay_safety/);
});

test('webhook event store records replay attempts on duplicate events', () => {
  const source = fs.readFileSync(WEBHOOK_STORE, 'utf8');
  assert.match(source, /webhook_replay_attempts/);
  assert.match(source, /return 'duplicate'/);
});

test('package scripts include p0 proof pack command', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(pkg.scripts['ops:proof:p0'], 'node scripts/generate-p0-proof-pack.mjs');
});

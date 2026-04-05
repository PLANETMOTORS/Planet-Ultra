import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const ALERTS_SCRIPT = path.join(repoRoot, 'scripts', 'check-ops-alerts.mjs');
const SECURITY_SCRIPT = path.join(repoRoot, 'scripts', 'security-baseline-check.mjs');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('ops alerts script supports strict require-db execution', () => {
  const source = fs.readFileSync(ALERTS_SCRIPT, 'utf8');
  assert.match(source, /--require-db/);
  assert.match(source, /--strict/);
  assert.match(source, /verdict/);
});

test('security baseline script supports require-secrets execution', () => {
  const source = fs.readFileSync(SECURITY_SCRIPT, 'utf8');
  assert.match(source, /--require-secrets/);
  assert.match(source, /AUTORAPTOR_WEBHOOK_SECRET/);
  assert.match(source, /DEALERTRACK_WEBHOOK_SECRET/);
});

test('package scripts expose ops alerts and security checks', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(pkg.scripts['ops:alerts'], 'node scripts/check-ops-alerts.mjs');
  assert.equal(pkg.scripts['ops:security:check'], 'node scripts/security-baseline-check.mjs');
});

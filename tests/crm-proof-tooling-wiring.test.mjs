import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CRM_PROOF_SCRIPT = path.join(repoRoot, 'scripts', 'generate-crm-evidence.mjs');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('crm evidence script supports strict require-db execution', () => {
  const source = fs.readFileSync(CRM_PROOF_SCRIPT, 'utf8');
  assert.match(source, /--require-db/);
  assert.match(source, /--strict/);
  assert.match(source, /crm_dispatch_log/);
  assert.match(source, /PASS_CANDIDATE/);
});

test('package scripts expose crm evidence command', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(pkg.scripts['ops:proof:crm'], 'node scripts/generate-crm-evidence.mjs');
});

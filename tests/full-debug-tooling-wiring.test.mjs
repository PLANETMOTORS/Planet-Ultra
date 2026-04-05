import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const RECONCILE_SCRIPT = path.join(repoRoot, 'scripts', 'reconcile-runtime-health.mjs');
const PROOF_SCRIPT = path.join(repoRoot, 'scripts', 'generate-p0-proof-pack.mjs');
const FULL_DEBUG_SCRIPT = path.join(repoRoot, 'scripts', 'run-full-debug-check.mjs');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('ops scripts support safe no-database mode', () => {
  const reconcileSource = fs.readFileSync(RECONCILE_SCRIPT, 'utf8');
  const proofSource = fs.readFileSync(PROOF_SCRIPT, 'utf8');
  assert.match(reconcileSource, /NO_DATABASE/);
  assert.match(proofSource, /NO_DATABASE/);
});

test('full debug script verifies docs, routes, and migrations', () => {
  const source = fs.readFileSync(FULL_DEBUG_SCRIPT, 'utf8');
  assert.match(source, /A0 package docs/);
  assert.match(source, /Core route pages/);
  assert.match(source, /Lifecycle migrations/);
  assert.match(source, /npm', \['run', 'ops:proof:p0'\]/);
});

test('package scripts expose full debug command', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(pkg.scripts['ops:debug:full'], 'node scripts/run-full-debug-check.mjs');
});

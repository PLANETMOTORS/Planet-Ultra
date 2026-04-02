import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CLOSEOUT_SCRIPT = path.join(repoRoot, 'scripts', 'run-a6-closeout.mjs');
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('a6 closeout script requires database-backed evidence and emits artifacts', () => {
  const source = fs.readFileSync(CLOSEOUT_SCRIPT, 'utf8');
  assert.match(source, /DATABASE_URL/);
  assert.match(source, /reconcile-runtime-health\.mjs/);
  assert.match(source, /generate-p0-proof-pack\.mjs/);
  assert.match(source, /check-ops-alerts\.mjs/);
  assert.match(source, /security-baseline-check\.mjs/);
  assert.match(source, /A6_CLOSEOUT_SUMMARY\.md/);
});

test('package scripts expose a6 closeout command', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(pkg.scripts['ops:close:a6'], 'node scripts/run-a6-closeout.mjs');
});

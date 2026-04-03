import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const IMPORT_SCRIPT = path.join(repoRoot, 'scripts', 'import-homenet-inventory.mjs');
const INVENTORY_PROOF_SCRIPT = path.join(
  repoRoot,
  'scripts',
  'generate-inventory-ingest-evidence.mjs',
);
const PACKAGE_JSON = path.join(repoRoot, 'package.json');

test('inventory import script persists run ledger and dead letters with retries', () => {
  const source = fs.readFileSync(IMPORT_SCRIPT, 'utf8');
  assert.match(source, /inventory_import_runs/);
  assert.match(source, /inventory_import_dead_letters/);
  assert.match(source, /runWithRetry/);
  assert.match(source, /TRUNCATE TABLE inventory_vehicles/);
  assert.match(source, /HOMENET_CSV_PATH/);
  assert.match(source, /data\/homenet\/latest\.csv/);
  assert.doesNotMatch(source, /InventoryReport-3-30-2026/);
});

test('inventory proof script supports strict require-db execution', () => {
  const source = fs.readFileSync(INVENTORY_PROOF_SCRIPT, 'utf8');
  assert.match(source, /--require-db/);
  assert.match(source, /--strict/);
  assert.match(source, /inventory_import_runs/);
  assert.match(source, /PASS_CANDIDATE/);
});

test('package scripts expose inventory evidence command', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  assert.equal(
    pkg.scripts['ops:proof:inventory'],
    'node scripts/generate-inventory-ingest-evidence.mjs',
  );
});

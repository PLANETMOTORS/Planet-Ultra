import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const FINANCE_ROUTE = path.join(repoRoot, 'app', 'api', 'finance', 'submit', 'route.ts');
const PURCHASE_ROUTE = path.join(repoRoot, 'app', 'api', 'purchase', 'submit', 'route.ts');
const INVENTORY_REPO = path.join(repoRoot, 'lib', 'inventory', 'repository.ts');

test('inventory repository exposes strict vehicle reference resolver', () => {
  const source = fs.readFileSync(INVENTORY_REPO, 'utf8');
  assert.match(source, /export async function getInventoryVehicleByReference/);
  assert.match(source, /WHERE vin = \$1 AND slug = \$2/);
});

test('finance route resolves vehicle truth from inventory boundary', () => {
  const source = fs.readFileSync(FINANCE_ROUTE, 'utf8');
  assert.match(source, /getInventoryVehicleByReference/);
  assert.match(source, /vehiclePriceCad:\s*verifiedVehicle\.priceCad/);
});

test('purchase route resolves vehicle truth from inventory boundary', () => {
  const source = fs.readFileSync(PURCHASE_ROUTE, 'utf8');
  assert.match(source, /getInventoryVehicleByReference/);
  assert.match(source, /vehiclePriceCad:\s*verifiedVehicle\.priceCad/);
});


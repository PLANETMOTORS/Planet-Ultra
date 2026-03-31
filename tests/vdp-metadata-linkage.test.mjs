import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CANONICAL_VDP_PAGE = path.join(
  repoRoot,
  'app',
  'inventory',
  'used',
  '[make]',
  '[model]',
  '[slug]',
  'page.tsx',
);
const HELPER_VDP_PAGE = path.join(repoRoot, 'app', 'inventory', '[slug]', 'page.tsx');

test('canonical VDP generateMetadata delegates to buildVehicleMetadata', () => {
  const source = fs.readFileSync(CANONICAL_VDP_PAGE, 'utf8');

  assert.match(source, /import\s+\{\s*buildVehicleMetadata\s*\}\s+from\s+'@\/lib\/seo\/buildVehicleMetadata'/);
  assert.match(source, /export\s+async\s+function\s+generateMetadata\s*\(/);
  assert.match(source, /return\s+buildVehicleMetadata\(vehicle\);/);
});

test('helper slug route never emits canonical VDP metadata helper', () => {
  const source = fs.readFileSync(HELPER_VDP_PAGE, 'utf8');

  assert.doesNotMatch(source, /buildVehicleMetadata/);
  assert.match(source, /robots:\s*\{\s*index:\s*false,?\s*follow:\s*false,?\s*\}/s);
});

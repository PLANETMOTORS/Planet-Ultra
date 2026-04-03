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
const VEHICLE_METADATA_HELPER = path.join(repoRoot, 'lib', 'seo', 'buildVehicleMetadata.ts');

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

test('vehicle metadata helper applies social card transform to ogImageUrl', () => {
  const source = fs.readFileSync(VEHICLE_METADATA_HELPER, 'utf8');

  assert.match(source, /import\s+\{\s*socialCardImageUrl,\s*SOCIAL_CARD_DIMS\s*\}\s+from\s+'@\/lib\/media\/cloudinary'/);
  assert.match(
    source,
    /const\s+ogImageUrl\s*=\s*rawHeroUrl\s*\?\s*socialCardImageUrl\(rawHeroUrl\)\s*:\s*undefined;/,
  );
});

test('vehicle metadata helper emits transformed ogImageUrl in Open Graph and Twitter', () => {
  const source = fs.readFileSync(VEHICLE_METADATA_HELPER, 'utf8');

  // Open Graph image URL is driven by the transformed ogImageUrl variable.
  assert.match(source, /openGraph:\s*\{[\s\S]*images:\s*ogImageUrl[\s\S]*url:\s*ogImageUrl,[\s\S]*\}/s);

  // Twitter image URL mirrors the same transformed value.
  assert.match(source, /twitter:\s*\{[\s\S]*images:\s*ogImageUrl\s*\?\s*\[\s*ogImageUrl\s*\]\s*:\s*\[\s*\]/s);
});

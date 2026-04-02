import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const ADMIN_PAGE = path.join(repoRoot, 'app', 'admin', 'page.tsx');
const ADMIN_API = path.join(repoRoot, 'app', 'api', 'admin', 'ops', 'route.ts');
const ADMIN_AUTH = path.join(repoRoot, 'lib', 'auth', 'admin.ts');
const ADMIN_SNAPSHOT = path.join(repoRoot, 'lib', 'ops', 'adminSnapshot.ts');
const MIDDLEWARE = path.join(repoRoot, 'middleware.ts');

test('admin auth helper enforces allowlist model', () => {
  const source = fs.readFileSync(ADMIN_AUTH, 'utf8');
  assert.match(source, /ADMIN_CLERK_USER_IDS/);
  assert.match(source, /requireAdminSession/);
});

test('admin ops api route is protected and serves snapshot', () => {
  const source = fs.readFileSync(ADMIN_API, 'utf8');
  assert.match(source, /requireAdminSession/);
  assert.match(source, /getAdminOpsSnapshot/);
});

test('admin page exists and handles unauthorized users safely', () => {
  const source = fs.readFileSync(ADMIN_PAGE, 'utf8');
  assert.match(source, /redirect\('\/sign-in\?redirect_url=\/admin'\)/);
  assert.match(source, /Forbidden: your account is not in the admin allowlist/);
});

test('admin snapshot pulls recent finance, webhook, and crm data', () => {
  const source = fs.readFileSync(ADMIN_SNAPSHOT, 'utf8');
  assert.match(source, /recentFinance/);
  assert.match(source, /recentWebhooks/);
  assert.match(source, /recentCrmDispatch/);
});

test('middleware protects /admin paths', () => {
  const source = fs.readFileSync(MIDDLEWARE, 'utf8');
  assert.match(source, /\/admin\(\.\*\)/);
});

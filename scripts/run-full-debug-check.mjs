import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();

function run(cmd, args) {
  const pretty = `${cmd} ${args.join(' ')}`.trim();
  console.log(`\n$ ${pretty}`);
  const result = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${pretty}`);
  }
}

function verifyFilesExist(groupName, files) {
  const missing = files.filter((f) => !fs.existsSync(path.join(repoRoot, f)));
  if (missing.length > 0) {
    throw new Error(
      `[${groupName}] missing files:\n${missing.map((m) => `- ${m}`).join('\n')}`,
    );
  }
  console.log(`[ok] ${groupName}: ${files.length} files verified`);
}

function main() {
  verifyFilesExist('A0 package docs', [
    'docs/A0-Developer-Package/1-Planet_Ultra_Package_Coverage_Check.md',
    'docs/A0-Developer-Package/2-Planet_Ultra_Doc1_Blueprint_IA.md',
    'docs/A0-Developer-Package/3-Planet_Ultra_BlueSheet.md',
    'docs/A0-Developer-Package/4-Planet_Ultra_PreProject_Developer_Requirements.md',
    'docs/A0-Developer-Package/5-Planet_Ultra_PreProject_Gates_Tracker.md',
    'docs/A0-Developer-Package/6-Planet_Ultra_Doc3_Schema_API_Blueprint.md',
    'docs/A0-Developer-Package/7-Planet_Ultra_Doc4_Brand_UI_Style_Guide.md',
    'docs/A0-Developer-Package/8-Planet_Ultra_DEC_Package.md',
    'docs/A0-Developer-Package/9-Planet_Ultra_Developer_Handoff_Checklist.md',
    'docs/A0-Developer-Package/10-Planet_Ultra_A6_Target_Architecture_Adoption.md',
    'docs/A0-Developer-Package/11-Planet_Ultra_Master_Execution_Board.md',
  ]);

  verifyFilesExist('Core route pages', [
    'app/page.tsx',
    'app/inventory/page.tsx',
    'app/finance/page.tsx',
    'app/purchase/page.tsx',
    'app/protection/page.tsx',
    'app/sell-or-trade/page.tsx',
    'app/admin/page.tsx',
  ]);

  verifyFilesExist('Lifecycle APIs', [
    'app/api/finance/submit/route.ts',
    'app/api/purchase/submit/route.ts',
    'app/api/purchase/return/route.ts',
    'app/api/purchase/delivery/route.ts',
    'app/api/trade-in/offer/route.ts',
    'app/api/trade-in/accept/route.ts',
    'app/api/trade-in/status/route.ts',
    'app/api/webhooks/stripe/route.ts',
    'app/api/webhooks/dealertrack/route.ts',
    'app/api/webhooks/routeone/route.ts',
    'app/api/webhooks/delivery/route.ts',
    'app/api/webhooks/tradein/route.ts',
  ]);

  verifyFilesExist('Lifecycle migrations', [
    'db/migrations/001_saved_vehicles.sql',
    'db/migrations/002_inventory_feed_snapshot.sql',
    'db/migrations/003_finance_lifecycle.sql',
    'db/migrations/004_webhook_events.sql',
    'db/migrations/005_crm_dispatch_log.sql',
    'db/migrations/006_purchase_lifecycle.sql',
    'db/migrations/007_delivery_lifecycle.sql',
    'db/migrations/008_tradein_lifecycle.sql',
    'db/migrations/009_webhook_replay_attempts.sql',
  ]);

  run('npm', ['run', 'test']);
  run('npm', ['run', 'lint']);
  run('npm', ['run', 'typecheck']);
  run('npm', ['run', 'build']);
  run('npm', ['run', 'ops:reconcile']);
  run('npm', ['run', 'ops:proof:p0']);

  console.log('\n[PASS] Full A0->current debug check completed successfully.');
}

try {
  main();
} catch (error) {
  console.error('\n[FAIL] Full debug check failed.');
  console.error((error instanceof Error ? error.message : String(error)));
  process.exit(1);
}

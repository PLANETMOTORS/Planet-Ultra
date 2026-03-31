import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { neon } from '@neondatabase/serverless';
import { summarizeMismatchCounters } from './reconcile-runtime-health-utils.mjs';

function nowIso() {
  return new Date().toISOString();
}

async function scalar(sql, query) {
  const rows = await sql.query(query);
  return Number.parseInt(String(rows?.[0]?.count ?? 0), 10) || 0;
}

async function buildReport(sql) {
  const totals = {
    inventoryRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM inventory_vehicles'),
    financeSubmissions: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM finance_submissions'),
    webhookEvents: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM webhook_events'),
    crmDispatchRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM crm_dispatch_log'),
  };

  const mismatches = {
    financeTerminalMissingError: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM finance_submissions
       WHERE status IN ('failed', 'dead_letter')
         AND (last_error IS NULL OR length(trim(last_error)) = 0)`,
    ),
    financeAcknowledgedMissingReference: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM finance_submissions
       WHERE status = 'acknowledged'
         AND (external_reference IS NULL OR length(trim(external_reference)) = 0)`,
    ),
    webhookFailedMissingError: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM webhook_events
       WHERE status = 'failed'
         AND (error_message IS NULL OR length(trim(error_message)) = 0)`,
    ),
    webhookProcessedMissingTimestamp: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM webhook_events
       WHERE status = 'processed'
         AND processed_at IS NULL`,
    ),
    crmSentMissingDeliveryTimestamp: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM crm_dispatch_log
       WHERE status = 'sent'
         AND delivered_at IS NULL`,
    ),
    crmDeadLetterMissingError: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM crm_dispatch_log
       WHERE dead_letter = TRUE
         AND (error_message IS NULL OR length(trim(error_message)) = 0)`,
    ),
  };

  const summary = summarizeMismatchCounters(mismatches);

  return {
    generatedAt: nowIso(),
    totals,
    mismatches: summary.mismatches,
    criticalMismatchCount: summary.criticalMismatchCount,
    verdict: summary.verdict,
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const outputArg = process.argv[2];
  const strict = process.argv.includes('--strict');
  const sql = neon(databaseUrl);

  const report = await buildReport(sql);
  console.log(JSON.stringify(report, null, 2));

  if (outputArg) {
    const outPath = path.resolve(outputArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`Report written: ${outPath}`);
  }

  if (strict && report.criticalMismatchCount > 0) {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

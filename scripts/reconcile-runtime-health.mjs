import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { neon } from '@neondatabase/serverless';
import { summarizeMismatchCounters } from './reconcile-runtime-health-utils.mjs';

function nowIso() {
  return new Date().toISOString();
}

async function scalar(sql, query) {
  try {
    const rows = await sql.query(query);
    return Number.parseInt(String(rows?.[0]?.count ?? 0), 10) || 0;
  } catch {
    return 0;
  }
}

async function buildReport(sql) {
  const totals = {
    inventoryRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM inventory_vehicles'),
    financeSubmissions: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM finance_submissions'),
    purchaseSubmissions: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM purchase_submissions'),
    deliverySubmissions: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM delivery_submissions'),
    tradeInSubmissions: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM tradein_submissions'),
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
    purchasePaidMissingReturnDeadline: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM purchase_submissions
       WHERE status = 'paid'
         AND return_deadline_at IS NULL`,
    ),
    purchaseCheckoutMissingStripeSession: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM purchase_submissions
       WHERE status = 'checkout_created'
         AND (stripe_session_id IS NULL OR length(trim(stripe_session_id)) = 0)`,
    ),
    purchaseRefundedMissingTimestamp: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM purchase_submissions
       WHERE status = 'refunded'
         AND refunded_at IS NULL`,
    ),
    deliveryDeliveredMissingTrackingReference: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM delivery_submissions
       WHERE status = 'delivered'
         AND (tracking_reference IS NULL OR length(trim(tracking_reference)) = 0)`,
    ),
    deliveryScheduledMissingSlot: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM delivery_submissions
       WHERE status IN ('scheduled', 'confirmed', 'in_transit')
         AND (scheduled_date IS NULL OR scheduled_window IS NULL OR length(trim(scheduled_window)) = 0)`,
    ),
    tradeInOfferedMissingExpiry: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM tradein_submissions
       WHERE status = 'offered'
         AND offer_expires_at IS NULL`,
    ),
    tradeInScheduledMissingPickup: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM tradein_submissions
       WHERE status = 'scheduled'
         AND (pickup_date IS NULL OR pickup_window IS NULL OR length(trim(pickup_window)) = 0)`,
    ),
    tradeInCompletedMissingTimestamp: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM tradein_submissions
       WHERE status = 'completed'
         AND completed_at IS NULL`,
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
  const requireDb = process.argv.includes('--require-db');

  const outputArg = process.argv[2];
  const strict = process.argv.includes('--strict');
  let report;

  if (!databaseUrl) {
    if (requireDb) {
      console.error('Missing DATABASE_URL');
      process.exit(1);
    }
    report = {
      generatedAt: nowIso(),
      totals: {
        inventoryRows: 0,
        financeSubmissions: 0,
        purchaseSubmissions: 0,
        deliverySubmissions: 0,
        tradeInSubmissions: 0,
        webhookEvents: 0,
        crmDispatchRows: 0,
      },
      mismatches: {},
      criticalMismatchCount: 0,
      verdict: 'NO_DATABASE',
      notes: ['DATABASE_URL not set; returned safe empty reconciliation snapshot.'],
    };
  } else {
    const sql = neon(databaseUrl);
    report = await buildReport(sql);
  }
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

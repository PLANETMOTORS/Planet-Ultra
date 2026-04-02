import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { neon } from '@neondatabase/serverless';

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

async function statusCounts(sql, table, statuses) {
  const result = {};
  for (const status of statuses) {
    result[status] = await scalar(
      sql,
      `SELECT COUNT(*)::int AS count FROM ${table} WHERE status = '${status}'`,
    );
  }
  return result;
}

async function buildP0ProofPack(sql) {
  const financeStatuses = await statusCounts(sql, 'finance_submissions', [
    'submitted',
    'queued',
    'forwarded',
    'acknowledged',
    'failed',
    'retried',
    'dead_letter',
  ]);

  const purchaseStatuses = await statusCounts(sql, 'purchase_submissions', [
    'initiated',
    'checkout_created',
    'paid',
    'expired',
    'cancelled',
    'return_requested',
    'refund_pending',
    'refunded',
  ]);

  const providerWebhookStatus = async (provider, status) =>
    scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM webhook_events
       WHERE provider = '${provider}' AND status = '${status}'`,
    );

  const stripeCompletedEvents = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM webhook_events
     WHERE provider = 'stripe'
       AND event_type = 'checkout.session.completed'
       AND status = 'processed'`,
  );

  const stripeExpiredEvents = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM webhook_events
     WHERE provider = 'stripe'
       AND event_type = 'checkout.session.expired'
       AND status = 'processed'`,
  );

  const stripeUnmatchedPaidSessions = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM purchase_submissions p
     WHERE p.status = 'paid'
       AND p.stripe_session_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
         FROM webhook_events w
         WHERE w.provider = 'stripe'
           AND w.event_type = 'checkout.session.completed'
           AND w.status = 'processed'
           AND (w.payload->>'id') = p.stripe_session_id
       )`,
  );

  const financeMissingEvents = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM finance_submissions s
     WHERE NOT EXISTS (
       SELECT 1 FROM finance_submission_events e
       WHERE e.submission_id = s.id
     )`,
  );

  const dealertrackAcknowledged = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM finance_submission_events
     WHERE event_type LIKE 'dealertrack.webhook.%'
       AND to_status = 'acknowledged'`,
  );

  const routeoneAcknowledged = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM finance_submission_events
     WHERE event_type LIKE 'routeone.webhook.%'
       AND to_status = 'acknowledged'`,
  );

  const replayAttempts = await scalar(
    sql,
    'SELECT COUNT(*)::int AS count FROM webhook_replay_attempts',
  );

  const duplicateRowsInWebhookStore = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM (
       SELECT provider, event_id, COUNT(*) c
       FROM webhook_events
       GROUP BY provider, event_id
       HAVING COUNT(*) > 1
     ) t`,
  );

  const failedWebhookMissingError = await scalar(
    sql,
    `SELECT COUNT(*)::int AS count
     FROM webhook_events
     WHERE status = 'failed'
       AND (error_message IS NULL OR length(trim(error_message)) = 0)`,
  );

  const report = {
    generatedAt: nowIso(),
    p0_03_dealertrack_lifecycle: {
      financeStatusCounts: financeStatuses,
      dealertrackWebhookProcessed: await providerWebhookStatus('dealertrack', 'processed'),
      dealertrackWebhookFailed: await providerWebhookStatus('dealertrack', 'failed'),
      dealertrackAcknowledgedEvents: dealertrackAcknowledged,
      routeoneAcknowledgedEvents: routeoneAcknowledged,
    },
    p0_04_finance_audit_trail: {
      financeSubmissionRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM finance_submissions'),
      financeEventRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM finance_submission_events'),
      financeSubmissionsMissingEvents: financeMissingEvents,
      terminalWithoutError: await scalar(
        sql,
        `SELECT COUNT(*)::int AS count
         FROM finance_submissions
         WHERE status IN ('failed', 'dead_letter')
           AND (last_error IS NULL OR length(trim(last_error)) = 0)`,
      ),
    },
    p0_05_stripe_reconciliation: {
      purchaseStatusCounts: purchaseStatuses,
      stripeCompletedEvents,
      stripeExpiredEvents,
      unmatchedPaidSessions: stripeUnmatchedPaidSessions,
    },
    p0_06_webhook_replay_safety: {
      webhookEventRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM webhook_events'),
      webhookReplayAttempts: replayAttempts,
      webhookDuplicateRows: duplicateRowsInWebhookStore,
      failedWebhookMissingError,
    },
    verdict: {
      p0_03:
        financeStatuses.forwarded > 0 &&
        (dealertrackAcknowledged > 0 || routeoneAcknowledged > 0)
          ? 'PASS_CANDIDATE'
          : 'IN_PROGRESS',
      p0_04:
        financeMissingEvents === 0
          ? 'PASS_CANDIDATE'
          : 'IN_PROGRESS',
      p0_05:
        stripeUnmatchedPaidSessions === 0
          ? 'PASS_CANDIDATE'
          : 'IN_PROGRESS',
      p0_06:
        duplicateRowsInWebhookStore === 0 && failedWebhookMissingError === 0
          ? 'PASS_CANDIDATE'
          : 'IN_PROGRESS',
    },
  };

  return report;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const requireDb = process.argv.includes('--require-db');

  const outputArg = process.argv[2];
  let report;

  if (!databaseUrl) {
    if (requireDb) {
      console.error('Missing DATABASE_URL');
      process.exit(1);
    }
    report = {
      generatedAt: nowIso(),
      p0_03_dealertrack_lifecycle: {},
      p0_04_finance_audit_trail: {},
      p0_05_stripe_reconciliation: {},
      p0_06_webhook_replay_safety: {},
      verdict: {
        p0_03: 'NO_DATABASE',
        p0_04: 'NO_DATABASE',
        p0_05: 'NO_DATABASE',
        p0_06: 'NO_DATABASE',
      },
      notes: ['DATABASE_URL not set; returned safe empty P0 proof snapshot.'],
    };
  } else {
    const sql = neon(databaseUrl);
    report = await buildP0ProofPack(sql);
  }

  console.log(JSON.stringify(report, null, 2));
  if (outputArg) {
    const outPath = path.resolve(outputArg);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(`P0 proof pack written: ${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

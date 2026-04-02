import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { neon } from '@neondatabase/serverless';

function nowIso() {
  return new Date().toISOString();
}

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function scalar(sql, query) {
  try {
    const rows = await sql.query(query);
    return Number.parseInt(String(rows?.[0]?.count ?? 0), 10) || 0;
  } catch {
    return 0;
  }
}

async function scalarFloat(sql, query) {
  try {
    const rows = await sql.query(query);
    const value = Number.parseFloat(String(rows?.[0]?.value ?? 0));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

async function buildReport(sql) {
  const thresholds = {
    financeDeadLetterMax: intEnv('ALERT_FINANCE_DEAD_LETTER_MAX', 0),
    webhookFailedMax: intEnv('ALERT_WEBHOOK_FAILED_MAX', 0),
    crmDeadLetterMax: intEnv('ALERT_CRM_DEAD_LETTER_MAX', 0),
    deliveryFailedMax: intEnv('ALERT_DELIVERY_FAILED_MAX', 0),
    inventoryStaleHoursMax: intEnv('ALERT_INVENTORY_STALE_HOURS_MAX', 24),
  };

  const snapshot = {
    financeDeadLetter: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM finance_submissions WHERE status = 'dead_letter'",
    ),
    webhookFailed: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM webhook_events WHERE status = 'failed'",
    ),
    crmDeadLetter: await scalar(
      sql,
      'SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE dead_letter = TRUE',
    ),
    deliveryFailed: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM delivery_submissions WHERE status = 'failed'",
    ),
    inventoryRows: await scalar(
      sql,
      'SELECT COUNT(*)::int AS count FROM inventory_vehicles',
    ),
    inventoryStaleHours: await scalarFloat(
      sql,
      `SELECT COALESCE(EXTRACT(EPOCH FROM (NOW() - MAX(imported_at))) / 3600, 0)::float AS value
       FROM inventory_vehicles`,
    ),
  };

  const alerts = [];
  if (snapshot.financeDeadLetter > thresholds.financeDeadLetterMax) {
    alerts.push({
      code: 'FINANCE_DEAD_LETTER_HIGH',
      severity: 'critical',
      current: snapshot.financeDeadLetter,
      max: thresholds.financeDeadLetterMax,
    });
  }
  if (snapshot.webhookFailed > thresholds.webhookFailedMax) {
    alerts.push({
      code: 'WEBHOOK_FAILURE_HIGH',
      severity: 'critical',
      current: snapshot.webhookFailed,
      max: thresholds.webhookFailedMax,
    });
  }
  if (snapshot.crmDeadLetter > thresholds.crmDeadLetterMax) {
    alerts.push({
      code: 'CRM_DEAD_LETTER_HIGH',
      severity: 'critical',
      current: snapshot.crmDeadLetter,
      max: thresholds.crmDeadLetterMax,
    });
  }
  if (snapshot.deliveryFailed > thresholds.deliveryFailedMax) {
    alerts.push({
      code: 'DELIVERY_FAILURE_HIGH',
      severity: 'critical',
      current: snapshot.deliveryFailed,
      max: thresholds.deliveryFailedMax,
    });
  }
  if (
    snapshot.inventoryRows > 0 &&
    snapshot.inventoryStaleHours > thresholds.inventoryStaleHoursMax
  ) {
    alerts.push({
      code: 'INVENTORY_STALE',
      severity: 'warning',
      current: snapshot.inventoryStaleHours,
      max: thresholds.inventoryStaleHoursMax,
    });
  }

  return {
    generatedAt: nowIso(),
    thresholds,
    snapshot,
    alertCount: alerts.length,
    alerts,
    verdict: alerts.length === 0 ? 'PASS' : 'ALERT',
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const requireDb = process.argv.includes('--require-db');
  const strict = process.argv.includes('--strict');

  const outputArg = process.argv[2];
  let report;

  if (!databaseUrl) {
    if (requireDb) {
      console.error('Missing DATABASE_URL');
      process.exit(1);
    }
    report = {
      generatedAt: nowIso(),
      thresholds: {},
      snapshot: {},
      alertCount: 0,
      alerts: [],
      verdict: 'NO_DATABASE',
      notes: ['DATABASE_URL not set; returned safe empty alert snapshot.'],
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
    console.log(`Ops alert report written: ${outPath}`);
  }

  if (strict && report.verdict !== 'PASS') {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

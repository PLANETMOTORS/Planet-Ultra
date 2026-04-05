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

async function groupedCounts(sql, query) {
  try {
    const rows = await sql.query(query);
    return Array.isArray(rows)
      ? rows.map((r) => ({
          key: String(r.key ?? ''),
          count: Number.parseInt(String(r.count ?? 0), 10) || 0,
        }))
      : [];
  } catch {
    return [];
  }
}

async function recentFailures(sql, limit = 20) {
  try {
    const rows = await sql.query(
      `SELECT source, event_type, provider, attempt_count, dead_letter, error_message, updated_at
       FROM crm_dispatch_log
       WHERE status = 'failed' OR dead_letter = TRUE
       ORDER BY updated_at DESC
       LIMIT $1`,
      [limit],
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function buildReport(sql) {
  const totals = {
    dispatchRows: await scalar(sql, 'SELECT COUNT(*)::int AS count FROM crm_dispatch_log'),
    sent: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE status = 'sent'",
    ),
    queued: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE status = 'queued'",
    ),
    disabled: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE status = 'disabled'",
    ),
    failed: await scalar(
      sql,
      "SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE status = 'failed'",
    ),
    deadLetter: await scalar(
      sql,
      'SELECT COUNT(*)::int AS count FROM crm_dispatch_log WHERE dead_letter = TRUE',
    ),
    sentMissingDeliveredAt: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM crm_dispatch_log
       WHERE status = 'sent'
         AND delivered_at IS NULL`,
    ),
    failedMissingError: await scalar(
      sql,
      `SELECT COUNT(*)::int AS count
       FROM crm_dispatch_log
       WHERE (status = 'failed' OR dead_letter = TRUE)
         AND (error_message IS NULL OR length(trim(error_message)) = 0)`,
    ),
  };

  const attempts = {
    byAttemptCount: await groupedCounts(
      sql,
      `SELECT COALESCE(attempt_count, 0)::text AS key, COUNT(*)::int AS count
       FROM crm_dispatch_log
       GROUP BY COALESCE(attempt_count, 0)
       ORDER BY COALESCE(attempt_count, 0) ASC`,
    ),
    avgAttemptCountTimes100: await scalar(
      sql,
      `SELECT COALESCE(ROUND(AVG(COALESCE(attempt_count, 0)) * 100), 0)::int AS count
       FROM crm_dispatch_log`,
    ),
  };

  const byProvider = await groupedCounts(
    sql,
    `SELECT COALESCE(provider, 'unknown') AS key, COUNT(*)::int AS count
     FROM crm_dispatch_log
     GROUP BY COALESCE(provider, 'unknown')
     ORDER BY count DESC`,
  );

  const bySource = await groupedCounts(
    sql,
    `SELECT COALESCE(source, 'unknown') AS key, COUNT(*)::int AS count
     FROM crm_dispatch_log
     GROUP BY COALESCE(source, 'unknown')
     ORDER BY count DESC`,
  );

  const recentFailedRows = await recentFailures(sql);

  const verdict =
    totals.sentMissingDeliveredAt === 0 &&
    totals.failedMissingError === 0 &&
    totals.deadLetter === 0
      ? 'PASS_CANDIDATE'
      : 'IN_PROGRESS';

  return {
    generatedAt: nowIso(),
    totals,
    attempts: {
      ...attempts,
      avgAttemptCount: attempts.avgAttemptCountTimes100 / 100,
    },
    byProvider,
    bySource,
    recentFailedRows,
    verdict,
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
      totals: {},
      attempts: {},
      byProvider: [],
      bySource: [],
      recentFailedRows: [],
      verdict: 'NO_DATABASE',
      notes: ['DATABASE_URL not set; returned safe empty CRM evidence snapshot.'],
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
    console.log(`CRM evidence written: ${outPath}`);
  }

  if (strict && report.verdict !== 'PASS_CANDIDATE') {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

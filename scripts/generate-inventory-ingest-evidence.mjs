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

async function getLatestRun(sql) {
  try {
    const rows = await sql.query(
      `SELECT id, source_file, started_at, finished_at, status,
              total_rows, inserted_rows, skipped_rows, dead_letter_rows,
              retry_attempts, inventory_rows_after, error_message
       FROM inventory_import_runs
       ORDER BY started_at DESC
       LIMIT 1`,
    );
    return rows?.[0] ?? null;
  } catch {
    return null;
  }
}

async function getRecentDeadLetters(sql, limit = 20) {
  try {
    return await sql.query(
      `SELECT run_id, row_number, vin, reason, created_at
       FROM inventory_import_dead_letters
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
  } catch {
    return [];
  }
}

async function buildReport(sql) {
  const latestRun = await getLatestRun(sql);
  const inventoryRows = await scalar(
    sql,
    'SELECT COUNT(*)::int AS count FROM inventory_vehicles',
  );
  const recentDeadLetters = await getRecentDeadLetters(sql);
  const totalRuns = await scalar(
    sql,
    'SELECT COUNT(*)::int AS count FROM inventory_import_runs',
  );
  const failedRuns = await scalar(
    sql,
    "SELECT COUNT(*)::int AS count FROM inventory_import_runs WHERE status = 'failed'",
  );

  const latestRunPass =
    latestRun &&
    latestRun.status === 'success' &&
    Number(latestRun.dead_letter_rows ?? 0) === 0 &&
    Number(latestRun.error_message ? 1 : 0) === 0 &&
    Number(latestRun.inventory_rows_after ?? -1) === inventoryRows;

  return {
    generatedAt: nowIso(),
    totals: {
      totalRuns,
      failedRuns,
      inventoryRows,
    },
    latestRun,
    recentDeadLetters,
    verdict: latestRunPass ? 'PASS_CANDIDATE' : 'IN_PROGRESS',
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
      latestRun: null,
      recentDeadLetters: [],
      verdict: 'NO_DATABASE',
      notes: ['DATABASE_URL not set; returned safe empty inventory evidence snapshot.'],
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
    console.log(`Inventory evidence written: ${outPath}`);
  }

  if (strict && report.verdict !== 'PASS_CANDIDATE') {
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

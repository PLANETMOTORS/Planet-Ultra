import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { neon } from '@neondatabase/serverless';

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  cells.push(current);
  return cells;
}

function parseCsv(content) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = (values[j] ?? '').trim();
    }
    rows.push(row);
  }

  return { headers, rows };
}

function toInt(value) {
  if (!value) return null;
  const v = Number.parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(v) ? v : null;
}

function toDecimal(value) {
  if (!value) return null;
  const v = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(v) ? v : null;
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString().slice(0, 10);
}

function toTimestamp(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString();
}

function splitMakeModelTrim(value, fallbackYear) {
  if (!value) return { make: null, model: null, trim: null };
  const parts = String(value).trim().split(/\s+/);
  if (parts.length === 0) return { make: null, model: null, trim: null };

  if (fallbackYear && /^\d{4}$/.test(parts[0])) parts.shift();
  const make = parts.shift() ?? null;
  const model = parts.shift() ?? null;
  const trim = parts.length > 0 ? parts.join(' ') : null;
  return { make, model, trim };
}

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractSlug(row, year, make, model) {
  const vdpUrl = row['Website VDP URL'] || '';
  if (vdpUrl) {
    try {
      const parsed = new URL(vdpUrl.replace('//inventory', '/inventory'));
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const candidate = parts[parts.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
        if (candidate) return slugify(candidate);
      }
    } catch {
      // Fall through to generated slug.
    }
  }

  const stock = row.Stock || row.VIN || `${year}-${make}-${model}`;
  return slugify(stock);
}

function parseIntEnv(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isRetryableError(error) {
  const message = String(error instanceof Error ? error.message : error).toLowerCase();
  const retryHints = [
    'timeout',
    'timed out',
    'connection',
    'socket',
    'econnreset',
    'enotfound',
    'too many requests',
    '429',
    '503',
    '504',
  ];
  return retryHints.some((hint) => message.includes(hint));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithRetry(fn, options) {
  const maxRetries = options.maxRetries;
  const baseDelayMs = options.baseDelayMs;

  let attempts = 0;
  let retriesUsed = 0;
  while (true) {
    attempts += 1;
    try {
      const value = await fn();
      return { value, attempts, retriesUsed };
    } catch (error) {
      const canRetry = attempts <= maxRetries && isRetryableError(error);
      if (!canRetry) {
        throw Object.assign(
          new Error(error instanceof Error ? error.message : String(error)),
          { attempts, retriesUsed },
        );
      }
      retriesUsed += 1;
      const waitMs = baseDelayMs * 2 ** (attempts - 1);
      await sleep(waitMs);
    }
  }
}

function resolveCsvPath(argvPath) {
  const explicitArg = argvPath?.trim();
  if (explicitArg) {
    return path.resolve(explicitArg);
  }

  const fromEnv = process.env.HOMENET_CSV_PATH?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  return path.resolve(process.cwd(), 'data/homenet/latest.csv');
}

async function main() {
  const csvPath = resolveCsvPath(process.argv[2]);
  const outputPath = process.argv[3] ?? null;
  const databaseUrl = process.env.DATABASE_URL;
  const maxRetries = parseIntEnv('INVENTORY_IMPORT_MAX_RETRIES', 2);
  const baseRetryDelayMs = parseIntEnv('INVENTORY_IMPORT_RETRY_DELAY_MS', 200);

  if (!databaseUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    console.error('Pass file path as arg: npm run inventory:import:homenet:file -- "/abs/path/feed.csv"');
    console.error('Or set HOMENET_CSV_PATH, or place file at ./data/homenet/latest.csv');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCsv(csvContent);
  const sourceFile = path.basename(csvPath);
  const deadLetters = [];
  let insertedRows = 0;
  let skippedRows = 0;
  let retryAttempts = 0;
  let runId = null;

  try {
    const runRows = await sql.query(
      `INSERT INTO inventory_import_runs (
        source_file, status, total_rows
      ) VALUES ($1, 'running', $2)
      RETURNING id`,
      [sourceFile, rows.length],
    );
    runId = runRows?.[0]?.id ?? null;

    await sql.query('BEGIN');

    // Required rule: replace current inventory snapshot entirely.
    await sql.query('TRUNCATE TABLE inventory_vehicles');

    for (let i = 0; i < rows.length; i += 1) {
      const rowNumber = i + 2;
      const row = rows[i];
      const vin = row.VIN || null;
      if (!vin) {
        skippedRows += 1;
        deadLetters.push({
          rowNumber,
          vin: null,
          reason: 'missing_vin',
          payload: row,
        });
        continue;
      }

      const year = toInt(row.Year);
      const parsed = splitMakeModelTrim(row['Make Model Trim'], year);
      const make = parsed.make || row['Make | Model | Trim']?.split(' ')[0] || null;
      const model = parsed.model || null;
      const trim = parsed.trim || null;

      if (!year || !make || !model) {
        skippedRows += 1;
        deadLetters.push({
          rowNumber,
          vin,
          reason: 'missing_required_vehicle_identity',
          payload: row,
        });
        continue;
      }

      const status =
        row.Sold === 'Yes'
          ? 'sold'
          : row.Locked === 'Yes'
            ? 'locked'
            : 'available';

      const slug = extractSlug(row, year, make, model);

      try {
        const insertResult = await runWithRetry(
          () =>
            sql.query(
              `INSERT INTO inventory_vehicles (
                slug, vin, stock, rooftop, vehicle_type, year, make, model, trim,
                exterior_color, interior_color, transmission, fuel_type,
                selling_price_cad, mileage_km, date_in_stock, date_last_touched,
                days_in_stock, vdp_url, photos_count, status, source_file, imported_at, raw_payload
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9,
                $10, $11, $12, $13,
                $14, $15, $16, $17,
                $18, $19, $20, $21, $22, NOW(), $23::jsonb
              )
              ON CONFLICT (vin)
              DO UPDATE SET
                slug = EXCLUDED.slug,
                stock = EXCLUDED.stock,
                rooftop = EXCLUDED.rooftop,
                vehicle_type = EXCLUDED.vehicle_type,
                year = EXCLUDED.year,
                make = EXCLUDED.make,
                model = EXCLUDED.model,
                trim = EXCLUDED.trim,
                exterior_color = EXCLUDED.exterior_color,
                interior_color = EXCLUDED.interior_color,
                transmission = EXCLUDED.transmission,
                fuel_type = EXCLUDED.fuel_type,
                selling_price_cad = EXCLUDED.selling_price_cad,
                mileage_km = EXCLUDED.mileage_km,
                date_in_stock = EXCLUDED.date_in_stock,
                date_last_touched = EXCLUDED.date_last_touched,
                days_in_stock = EXCLUDED.days_in_stock,
                vdp_url = EXCLUDED.vdp_url,
                photos_count = EXCLUDED.photos_count,
                status = EXCLUDED.status,
                source_file = EXCLUDED.source_file,
                imported_at = NOW(),
                raw_payload = EXCLUDED.raw_payload`,
              [
                slug,
                vin,
                row.Stock || vin,
                row.Rooftop || null,
                row.Type || null,
                year,
                make,
                model,
                trim,
                row['Ext. Color Desc.'] || null,
                row['Int. Color'] || null,
                row.Transmission || null,
                row['Fuel Type'] || null,
                toDecimal(row['Selling Price']),
                toInt(row.Mileage),
                toDate(row['Date in Stock']),
                toTimestamp(row['Date Last Touched']),
                toInt(row['Days in Stock']),
                row['Website VDP URL'] || null,
                toInt(row.Photos),
                status,
                sourceFile,
                JSON.stringify(row),
              ],
            ),
          { maxRetries, baseDelayMs: baseRetryDelayMs },
        );
        insertedRows += 1;
        retryAttempts += insertResult.retriesUsed;
      } catch (error) {
        skippedRows += 1;
        retryAttempts += Number(error?.retriesUsed ?? 0);
        deadLetters.push({
          rowNumber,
          vin,
          reason: `insert_failed:${String(error instanceof Error ? error.message : error).slice(0, 300)}`,
          payload: row,
        });
      }
    }

    const [{ count }] = await sql.query('SELECT COUNT(*)::int AS count FROM inventory_vehicles');
    await sql.query('COMMIT');

    if (runId && deadLetters.length > 0) {
      for (const dead of deadLetters) {
        await sql.query(
          `INSERT INTO inventory_import_dead_letters (
             run_id, row_number, vin, reason, payload
           ) VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [runId, dead.rowNumber, dead.vin, dead.reason, JSON.stringify(dead.payload)],
        );
      }
    }

    if (runId) {
      await sql.query(
        `UPDATE inventory_import_runs
         SET status = 'success',
             inserted_rows = $2,
             skipped_rows = $3,
             dead_letter_rows = $4,
             retry_attempts = $5,
             inventory_rows_after = $6,
             finished_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [runId, insertedRows, skippedRows, deadLetters.length, retryAttempts, Number(count)],
      );
    }

    const report = {
      sourceFile,
      runId,
      totalRows: rows.length,
      insertedRows,
      skippedRows,
      deadLetterRows: deadLetters.length,
      retryAttempts,
      inventoryRowsAfter: Number(count),
      verdict: deadLetters.length === 0 ? 'PASS_CANDIDATE' : 'IN_PROGRESS',
    };

    console.log(JSON.stringify(report, null, 2));
    if (outputPath) {
      const resolved = path.resolve(outputPath);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
      console.log(`Inventory import report written: ${resolved}`);
    }
  } catch (error) {
    await sql.query('ROLLBACK');
    if (runId) {
      await sql.query(
        `UPDATE inventory_import_runs
         SET status = 'failed',
             inserted_rows = $2,
             skipped_rows = $3,
             dead_letter_rows = $4,
             retry_attempts = $5,
             finished_at = NOW(),
             updated_at = NOW(),
             error_message = $6
         WHERE id = $1`,
        [
          runId,
          insertedRows,
          skippedRows,
          deadLetters.length,
          retryAttempts,
          String(error instanceof Error ? error.message : error).slice(0, 2000),
        ],
      );
    }
    console.error('Import failed. Rolled back transaction.');
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

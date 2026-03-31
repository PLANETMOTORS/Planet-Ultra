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

async function main() {
  const csvPath =
    process.argv[2] ??
    '/Users/tonisultzberg@icloud.com/Desktop/InventoryReport-3-30-2026 (1).csv';
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCsv(csvContent);
  const sourceFile = path.basename(csvPath);

  await sql.query('BEGIN');
  try {
    // Required rule: replace current inventory snapshot entirely.
    await sql.query('TRUNCATE TABLE inventory_vehicles');

    for (const row of rows) {
      const vin = row.VIN || null;
      if (!vin) continue;

      const year = toInt(row.Year);
      const parsed = splitMakeModelTrim(row['Make Model Trim'], year);
      const make = parsed.make || row['Make | Model | Trim']?.split(' ')[0] || null;
      const model = parsed.model || null;
      const trim = parsed.trim || null;

      if (!year || !make || !model) continue;

      const status =
        row.Sold === 'Yes'
          ? 'sold'
          : row.Locked === 'Yes'
            ? 'locked'
            : 'available';

      const slug = extractSlug(row, year, make, model);

      await sql.query(
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
        )`,
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
      );
    }

    const [{ count }] = await sql.query('SELECT COUNT(*)::int AS count FROM inventory_vehicles');
    await sql.query('COMMIT');
    console.log(`HomeNet import complete. Active rows: ${count}`);
  } catch (error) {
    await sql.query('ROLLBACK');
    console.error('Import failed. Rolled back transaction.');
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

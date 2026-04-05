# Inventory Import Rule (HomeNet)

Date: March 30, 2026

## Non-negotiable rule
- Every new HomeNet inventory upload **replaces** the existing inventory snapshot.
- No historical inventory rows are kept in `inventory_vehicles`.
- Import behavior is `TRUNCATE TABLE inventory_vehicles` then insert current feed rows in one transaction.
- Reliability controls:
  - Row-level retry with backoff for transient insert failures.
  - Run-level ledger in `inventory_import_runs`.
  - Invalid/failed rows captured in `inventory_import_dead_letters`.

## Files
- Migration: `db/migrations/002_inventory_feed_snapshot.sql`
- Migration: `db/migrations/010_inventory_import_runs.sql`
- Import script: `scripts/import-homenet-inventory.mjs`
- Evidence script: `scripts/generate-inventory-ingest-evidence.mjs`

## Runbook
1. Ensure `DATABASE_URL` is set.
2. Apply migration in Neon SQL editor.
3. Run importer:
   - default file path in repo:
     - `npm run inventory:import:homenet`
     - expected location: `./data/homenet/latest.csv`
   - env-defined file:
     - `HOMENET_CSV_PATH="/absolute/path/to/feed.csv" npm run inventory:import:homenet`
   - explicit file path:
     - `npm run inventory:import:homenet:file -- "/absolute/path/to/feed.csv"`
4. Generate evidence:
   - `npm run ops:proof:inventory`
   - strict DB closeout mode:
     - `node scripts/generate-inventory-ingest-evidence.mjs artifacts/inventory-proof.json --require-db --strict`

## Notes
- No personal machine path is hardcoded in importer runtime.
- Runtime resolution order for input CSV:
  1. CLI arg (`process.argv[2]`)
  2. `HOMENET_CSV_PATH`
  3. `./data/homenet/latest.csv`

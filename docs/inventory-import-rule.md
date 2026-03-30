# Inventory Import Rule (HomeNet)

Date: March 30, 2026

## Non-negotiable rule
- Every new HomeNet inventory upload **replaces** the existing inventory snapshot.
- No historical inventory rows are kept in `inventory_vehicles`.
- Import behavior is `TRUNCATE TABLE inventory_vehicles` then insert current feed rows in one transaction.

## Files
- Migration: `db/migrations/002_inventory_feed_snapshot.sql`
- Import script: `scripts/import-homenet-inventory.mjs`

## Runbook
1. Ensure `DATABASE_URL` is set.
2. Apply migration in Neon SQL editor.
3. Run importer:
   - default file:
     - `npm run inventory:import:homenet`
   - explicit file path:
     - `npm run inventory:import:homenet:file -- "/absolute/path/to/feed.csv"`

## Source file used for initial implementation
- `/Users/tonisultzberg@icloud.com/Desktop/InventoryReport-3-30-2026 (1).csv`


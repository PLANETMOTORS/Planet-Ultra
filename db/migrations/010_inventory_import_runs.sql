-- Inventory ingestion run ledger + dead-letter records (P0-02 hardening).

CREATE TABLE IF NOT EXISTS inventory_import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file VARCHAR(255) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'running',
  total_rows INTEGER NOT NULL DEFAULT 0,
  inserted_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,
  dead_letter_rows INTEGER NOT NULL DEFAULT 0,
  retry_attempts INTEGER NOT NULL DEFAULT 0,
  inventory_rows_after INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_import_runs_started
  ON inventory_import_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_import_runs_status
  ON inventory_import_runs (status, started_at DESC);

CREATE TABLE IF NOT EXISTS inventory_import_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES inventory_import_runs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  vin VARCHAR(17),
  reason TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_import_dead_letters_run
  ON inventory_import_dead_letters (run_id, row_number);

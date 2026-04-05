-- HomeNet inventory snapshot table.
-- Import rule: each new feed run replaces all existing rows.

CREATE TABLE IF NOT EXISTS inventory_vehicles (
  slug VARCHAR(255) NOT NULL UNIQUE,
  vin VARCHAR(17) PRIMARY KEY,
  stock VARCHAR(64) NOT NULL,
  rooftop VARCHAR(128),
  vehicle_type VARCHAR(32),
  year INTEGER NOT NULL,
  make VARCHAR(64) NOT NULL,
  model VARCHAR(64) NOT NULL,
  trim VARCHAR(128),
  exterior_color VARCHAR(128),
  interior_color VARCHAR(128),
  transmission VARCHAR(64),
  fuel_type VARCHAR(64),
  selling_price_cad NUMERIC(12,2),
  mileage_km INTEGER,
  date_in_stock DATE,
  date_last_touched TIMESTAMPTZ,
  days_in_stock INTEGER,
  vdp_url TEXT,
  photos_count INTEGER,
  status VARCHAR(32) DEFAULT 'available',
  source_file VARCHAR(255),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE inventory_vehicles
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

UPDATE inventory_vehicles
SET slug = COALESCE(NULLIF(slug, ''), LOWER(REGEXP_REPLACE(COALESCE(stock, vin), '[^a-zA-Z0-9]+', '-', 'g')))
WHERE slug IS NULL OR slug = '';

ALTER TABLE inventory_vehicles
  ALTER COLUMN slug SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_vehicles_stock ON inventory_vehicles (stock);
CREATE INDEX IF NOT EXISTS idx_inventory_vehicles_make_model ON inventory_vehicles (make, model);
CREATE INDEX IF NOT EXISTS idx_inventory_vehicles_year_price ON inventory_vehicles (year, selling_price_cad);
CREATE INDEX IF NOT EXISTS idx_inventory_vehicles_slug ON inventory_vehicles (slug);

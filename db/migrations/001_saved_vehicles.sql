-- Migration: 001_saved_vehicles
-- Run once against your Neon Postgres database.
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING.
--
-- Required env var: DATABASE_URL (set in Vercel project settings)
-- Neon connection string format:
--   postgres://[user]:[password]@[host]/[dbname]?sslmode=require
--
-- Apply via Neon SQL editor or:
--   psql $DATABASE_URL -f db/migrations/001_saved_vehicles.sql

CREATE TABLE IF NOT EXISTS saved_vehicles (
  id             SERIAL PRIMARY KEY,
  clerk_user_id  VARCHAR(255)  NOT NULL,
  vehicle_id     VARCHAR(255)  NOT NULL,
  vehicle_slug   VARCHAR(500)  NOT NULL,
  saved_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (clerk_user_id, vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_vehicles_user
  ON saved_vehicles (clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_saved_vehicles_vehicle
  ON saved_vehicles (vehicle_id);

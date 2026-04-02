-- Trade-in lifecycle store for offer/accept/inspect/complete flow evidence.

CREATE TABLE IF NOT EXISTS tradein_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  status VARCHAR(32) NOT NULL,
  vin VARCHAR(17),
  year INTEGER NOT NULL,
  make VARCHAR(64) NOT NULL,
  model VARCHAR(64) NOT NULL,
  trim VARCHAR(128),
  mileage_km INTEGER NOT NULL,
  condition_grade VARCHAR(16) NOT NULL,
  offer_amount_cad NUMERIC(12,2) NOT NULL,
  offer_expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  pickup_date DATE,
  pickup_window VARCHAR(32),
  inspected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  external_reference VARCHAR(255),
  last_error TEXT,
  last_event_type VARCHAR(128),
  last_event_at TIMESTAMPTZ,
  payload_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tradein_submissions_external_reference
  ON tradein_submissions (external_reference)
  WHERE external_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tradein_submissions_status
  ON tradein_submissions (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_tradein_submissions_user
  ON tradein_submissions (clerk_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tradein_submissions_vehicle
  ON tradein_submissions (year, make, model);

CREATE TABLE IF NOT EXISTS tradein_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES tradein_submissions(id) ON DELETE CASCADE,
  event_type VARCHAR(128) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32) NOT NULL,
  external_reference VARCHAR(255),
  message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tradein_submission_events_submission
  ON tradein_submission_events (submission_id, created_at DESC);

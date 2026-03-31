-- Finance lifecycle store for deterministic submit/ack/retry/terminal flows.

CREATE TABLE IF NOT EXISTS finance_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_slug VARCHAR(500) NOT NULL,
  provider VARCHAR(32),
  status VARCHAR(32) NOT NULL,
  external_reference VARCHAR(255),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  last_event_type VARCHAR(128),
  last_event_at TIMESTAMPTZ,
  payload_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_finance_submissions_provider_reference
  ON finance_submissions (provider, external_reference)
  WHERE external_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_finance_submissions_status
  ON finance_submissions (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_finance_submissions_vehicle
  ON finance_submissions (vehicle_id, vehicle_slug);

CREATE TABLE IF NOT EXISTS finance_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES finance_submissions(id) ON DELETE CASCADE,
  event_type VARCHAR(128) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32) NOT NULL,
  provider VARCHAR(32),
  external_reference VARCHAR(255),
  message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_submission_events_submission
  ON finance_submission_events (submission_id, created_at DESC);

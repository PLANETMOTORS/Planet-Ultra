-- Delivery lifecycle store for scheduling/tracking/status proofs.

CREATE TABLE IF NOT EXISTS delivery_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_submission_id UUID NOT NULL UNIQUE REFERENCES purchase_submissions(id) ON DELETE CASCADE,
  clerk_user_id VARCHAR(255),
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_slug VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL,
  delivery_method VARCHAR(32) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_window VARCHAR(32) NOT NULL,
  delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking_reference VARCHAR(255),
  last_error TEXT,
  last_event_type VARCHAR(128),
  last_event_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_delivery_submissions_tracking_reference
  ON delivery_submissions (tracking_reference)
  WHERE tracking_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_delivery_submissions_status
  ON delivery_submissions (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_submissions_user
  ON delivery_submissions (clerk_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_submissions_vehicle
  ON delivery_submissions (vehicle_id, vehicle_slug);

CREATE TABLE IF NOT EXISTS delivery_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES delivery_submissions(id) ON DELETE CASCADE,
  event_type VARCHAR(128) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32) NOT NULL,
  tracking_reference VARCHAR(255),
  message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_submission_events_submission
  ON delivery_submission_events (submission_id, created_at DESC);

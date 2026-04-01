-- Purchase lifecycle store for deterministic checkout/payment/return/refund flows.

CREATE TABLE IF NOT EXISTS purchase_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_slug VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL,
  stripe_session_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  paid_at TIMESTAMPTZ,
  return_deadline_at TIMESTAMPTZ,
  return_requested_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  last_error TEXT,
  last_event_type VARCHAR(128),
  last_event_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_submissions_stripe_session
  ON purchase_submissions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchase_submissions_status
  ON purchase_submissions (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_submissions_user
  ON purchase_submissions (clerk_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_submissions_vehicle
  ON purchase_submissions (vehicle_id, vehicle_slug);

CREATE TABLE IF NOT EXISTS purchase_submission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES purchase_submissions(id) ON DELETE CASCADE,
  event_type VARCHAR(128) NOT NULL,
  from_status VARCHAR(32),
  to_status VARCHAR(32) NOT NULL,
  stripe_session_id VARCHAR(255),
  message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_submission_events_submission
  ON purchase_submission_events (submission_id, created_at DESC);

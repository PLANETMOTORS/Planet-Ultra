-- CRM dispatch receipt log (P0-10).

CREATE TABLE IF NOT EXISTS crm_dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  vehicle_id VARCHAR(255) NOT NULL,
  vehicle_slug VARCHAR(500) NOT NULL,
  provider VARCHAR(64) NOT NULL DEFAULT 'autoraptor',
  provider_reference VARCHAR(255),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  dead_letter BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  payload_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_dispatch_log_status
  ON crm_dispatch_log (status, dead_letter, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_dispatch_log_source
  ON crm_dispatch_log (source, event_type, updated_at DESC);

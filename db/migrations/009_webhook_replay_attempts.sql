-- Replay-attempt ledger for webhook idempotency evidence (P0-06).

CREATE TABLE IF NOT EXISTS webhook_replay_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  replayed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_replay_attempts_provider_event
  ON webhook_replay_attempts(provider, event_id, replayed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_replay_attempts_replayed_at
  ON webhook_replay_attempts(replayed_at DESC);

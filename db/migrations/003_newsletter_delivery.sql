ALTER TABLE newsletter_drafts ADD COLUMN IF NOT EXISTS early_access_episode integer REFERENCES studio_episodes(number) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES newsletter_drafts(id) ON DELETE CASCADE,
  draft_revision text NOT NULL,
  snapshot jsonb NOT NULL,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','paused','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (draft_id, draft_revision)
);
CREATE INDEX IF NOT EXISTS newsletter_campaigns_due ON newsletter_campaigns(send_at) WHERE status='queued';
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_campaigns_one_queue ON newsletter_campaigns(draft_id) WHERE status IN ('queued','paused');

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','accepted','failed','unknown','skipped')),
  claimed_at timestamptz,
  accepted_at timestamptz,
  last_error text,
  UNIQUE(campaign_id,subscriber_id)
);
CREATE INDEX IF NOT EXISTS newsletter_deliveries_pending ON newsletter_deliveries(campaign_id) WHERE status='pending';

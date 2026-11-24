CREATE TABLE IF NOT EXISTS studio_episodes (
  number integer PRIMARY KEY CHECK (number > 0),
  content jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_episodes_published ON studio_episodes (published, number DESC);

CREATE TABLE IF NOT EXISTS studio_content (
  key text PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
  status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source text NOT NULL DEFAULT 'website',
  consent_text text NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status ON newsletter_subscribers (status, subscribed_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  early_access_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS studio_sessions (
  token_hash text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_sessions_expiry ON studio_sessions (expires_at);

CREATE TABLE IF NOT EXISTS studio_rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);

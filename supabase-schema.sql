-- Zippy Scheduler Database Schema
-- Run this in Supabase SQL Editor after creating the project

-- Pinterest account connections (per user)
CREATE TABLE pinterest_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinterest_user_id TEXT NOT NULL,
  pinterest_username TEXT NOT NULL,
  business_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, pinterest_user_id)
);

-- Boards cache (synced from Pinterest)
CREATE TABLE pinterest_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES pinterest_accounts(id) ON DELETE CASCADE,
  pinterest_board_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  privacy TEXT DEFAULT 'PUBLIC',
  pin_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, pinterest_board_id)
);

-- Scheduled / posted pins
CREATE TABLE pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES pinterest_accounts(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES pinterest_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  pinterest_pin_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pins_user_id ON pins(user_id);
CREATE INDEX idx_pins_scheduled ON pins(status, scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_pins_status ON pins(status);
CREATE INDEX idx_pinterest_accounts_user ON pinterest_accounts(user_id);
CREATE INDEX idx_pinterest_boards_account ON pinterest_boards(account_id);

-- Row Level Security: users can only see their own data
ALTER TABLE pinterest_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinterest_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own Pinterest accounts"
  ON pinterest_accounts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users see boards from own accounts"
  ON pinterest_boards FOR ALL
  USING (
    account_id IN (
      SELECT id FROM pinterest_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see own pins"
  ON pins FOR ALL
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pinterest_accounts_updated_at
  BEFORE UPDATE ON pinterest_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pins_updated_at
  BEFORE UPDATE ON pins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

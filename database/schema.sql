-- ============================================================
-- Above & Beyond AI — Supabase Database Schema
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================

-- ── Enable UUID extension ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. Profiles (linked to auth.users) ──────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  company     TEXT,
  role        TEXT DEFAULT 'user',  -- 'user' | 'admin'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 2. Readiness Assessments ─────────────────────────────
CREATE TABLE IF NOT EXISTS readiness_assessments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  answers       JSONB NOT NULL DEFAULT '{}',
  scores        JSONB NOT NULL DEFAULT '{}',
  -- scores: { strategy: 72, data: 85, process: 60, tech: 75, culture: 58, compliance: 63 }
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  lang          TEXT DEFAULT 'de',
  company_name  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE readiness_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments"
  ON readiness_assessments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert assessment"
  ON readiness_assessments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own assessments"
  ON readiness_assessments FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. Contact Requests ──────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  topic       TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'new',  -- 'new' | 'in_progress' | 'done'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (only admins can read; anyone can insert)
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact"
  ON contact_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contacts"
  ON contact_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── 4. Useful Views ──────────────────────────────────────

-- Assessment summary view
CREATE OR REPLACE VIEW assessment_summary AS
SELECT
  a.id,
  a.user_id,
  p.full_name,
  p.company,
  a.overall_score,
  (a.scores->>'strategy')::INT  AS score_strategy,
  (a.scores->>'data')::INT      AS score_data,
  (a.scores->>'process')::INT   AS score_process,
  (a.scores->>'tech')::INT      AS score_tech,
  (a.scores->>'culture')::INT   AS score_culture,
  (a.scores->>'compliance')::INT AS score_compliance,
  a.lang,
  a.created_at
FROM readiness_assessments a
LEFT JOIN profiles p ON a.user_id = p.id;

-- ── 5. Indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assessments_user_id  ON readiness_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created  ON readiness_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created     ON contact_requests(created_at DESC);

-- ── 6. Trigger: auto-update updated_at ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SETUP COMPLETE
-- Next steps:
-- 1. Enable Email Auth in Supabase Authentication settings
-- 2. Set Site URL to https://tewers.github.io/above-beyond-ai.com
-- 3. Add redirect URLs for login/reset flows
-- 4. Copy your Project URL + anon key to assets/js/supabase-client.js
-- ============================================================

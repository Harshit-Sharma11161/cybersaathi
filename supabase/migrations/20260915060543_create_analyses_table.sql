/*
# Create analyses table for CyberSaathi

1. New Tables
- `analyses`
- `id` (uuid, primary key)
- `input` (text, the message or URL the user submitted)
- `type` (text, either 'message' or 'url')
- `risk_score` (integer, 0-100)
- `risk_level` (text, LOW / SUSPICIOUS / HIGH / CRITICAL)
- `category` (text, scam category e.g. Phishing, Job Scam, UPI Scam)
- `summary` (text, short explanation of the risk)
- `red_flags` (jsonb, array of identified red flags)
- `recommendations` (jsonb, array of recommended safety actions)
- `hindi_explanation` (text, Hindi/Hinglish explanation)
- `created_at` (timestamptz, defaults to now)
2. Security
- Enable RLS on `analyses`.
- Allow anon + authenticated CRUD because this is a single-tenant app with no sign-in.
- All data is intentionally public/shared across visitors.
3. Indexes
- Index on `created_at` descending for history/dashboard queries.
- Index on `risk_level` for dashboard filtering.
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input text NOT NULL,
  type text NOT NULL DEFAULT 'message',
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'LOW',
  category text NOT NULL DEFAULT 'Unknown',
  summary text NOT NULL DEFAULT '',
  red_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  hindi_explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analyses" ON analyses;
CREATE POLICY "anon_select_analyses" ON analyses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analyses" ON analyses;
CREATE POLICY "anon_insert_analyses" ON analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analyses" ON analyses;
CREATE POLICY "anon_update_analyses" ON analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analyses" ON analyses;
CREATE POLICY "anon_delete_analyses" ON analyses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses (risk_level);

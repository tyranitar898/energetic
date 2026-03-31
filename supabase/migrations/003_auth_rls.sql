-- Replace permissive RLS policies with proper auth-based policies

-- Drop old open policies
DROP POLICY IF EXISTS "Allow all entries" ON entries;
DROP POLICY IF EXISTS "Allow all ratings" ON daily_ratings;

-- Entries: users can only see and modify their own entries
CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- Daily ratings: users can only see and modify their own ratings
CREATE POLICY "Users can view own ratings"
  ON daily_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings"
  ON daily_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON daily_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix unique constraint: should be per-user, not global
ALTER TABLE daily_ratings DROP CONSTRAINT IF EXISTS daily_ratings_date_key;
ALTER TABLE daily_ratings ADD CONSTRAINT daily_ratings_user_date_unique UNIQUE (user_id, date);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_ratings_user_id ON daily_ratings(user_id);

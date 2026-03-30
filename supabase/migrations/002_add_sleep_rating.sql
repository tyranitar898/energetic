-- Add sleep rating to daily_ratings
alter table daily_ratings add column if not exists sleep_rating integer check (sleep_rating >= 1 and sleep_rating <= 10);

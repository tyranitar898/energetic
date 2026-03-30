-- Entries table: stores all daily log items
create table if not exists entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users default auth.uid(),
  date date not null default current_date,
  time text not null,
  category text not null check (category in ('food', 'hydration', 'exercise', 'sleep', 'supplement', 'other')),
  item text not null,
  quantity text,
  duration text,
  calories integer,
  raw_text text not null,
  created_at timestamptz default now()
);

-- Daily ratings table: one energy rating per day
create table if not exists daily_ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users default auth.uid(),
  date date not null default current_date,
  energy_rating integer not null check (energy_rating >= 1 and energy_rating <= 10),
  notes text,
  created_at timestamptz default now(),
  unique(date)
);

-- Enable RLS
alter table entries enable row level security;
alter table daily_ratings enable row level security;

-- For now, allow all operations (no auth required)
-- Replace these with proper user-based policies when auth is added
create policy "Allow all entries" on entries for all using (true) with check (true);
create policy "Allow all ratings" on daily_ratings for all using (true) with check (true);

-- Indexes for common queries
create index if not exists idx_entries_date on entries(date);
create index if not exists idx_daily_ratings_date on daily_ratings(date);

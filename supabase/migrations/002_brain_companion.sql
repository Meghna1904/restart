-- =============================================================
-- Restart App — v2 Brain Companion Schema
-- Run this in the Supabase SQL editor
-- =============================================================

-- ---------------------------------------------------------------
-- PROFILES (simplified)
-- ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "own profile only" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------
-- BRAIN ITEMS (the core table — everything goes here)
-- ---------------------------------------------------------------
create table if not exists brain_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  category text check (category in (
    'ideas', 'learn', 'social', 'remember', 'buy', 'people', 'random'
  )) default 'random',
  is_idea boolean generated always as (category = 'ideas') stored,
  archived boolean default false,
  source text default 'brain', -- 'quick' (from home), 'brain', 'ideas'
  created_at timestamptz default now()
);

alter table brain_items enable row level security;
create policy "own rows only" on brain_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Index for faster category filtering
create index if not exists brain_items_user_category
  on brain_items(user_id, category, created_at desc);

-- ---------------------------------------------------------------
-- NUDGE RESPONSES
-- ---------------------------------------------------------------
create table if not exists nudge_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  nudge_type text not null, -- 'move', 'study', 'brain', 'checkin'
  nudge_message text,
  response text check (response in ('yeah', 'later', 'not_today')) not null,
  responded_at timestamptz default now()
);

alter table nudge_responses enable row level security;
create policy "own rows only" on nudge_responses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- REALITY CHECKS ("what was I supposed to be doing?")
-- ---------------------------------------------------------------
create table if not exists reality_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  intended_task text,
  was_on_task boolean,
  distraction_reason text check (distraction_reason in (
    'tired', 'distracted', 'avoiding', 'entertainment', 'unknown'
  )),
  restarted boolean default false,
  created_at timestamptz default now()
);

alter table reality_checks enable row level security;
create policy "own rows only" on reality_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- COMEBACKS (when user returns after absence)
-- ---------------------------------------------------------------
create table if not exists comebacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  returned_on date default current_date,
  gap_days int,
  restart_action text,
  created_at timestamptz default now()
);

alter table comebacks enable row level security;
create policy "own rows only" on comebacks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- TRIGGER: auto-create profile on signup
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

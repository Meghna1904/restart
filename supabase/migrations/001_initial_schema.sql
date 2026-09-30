-- =============================================================
-- Restart App — Phase 1 Initial Schema
-- Run this in your Supabase SQL editor or via the CLI
-- =============================================================

-- ---------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  morning_nudge time,
  evening_nudge time,
  struggle_target_min int default 20,
  low_move_min int default 15,
  low_study_min int default 25,
  okay_move_min int default 20,
  okay_study_min int default 45,
  theme text default 'system',
  revisit_day int default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "own profile only" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------
-- DAY LOGS
-- ---------------------------------------------------------------
create table if not exists day_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  energy text check (energy in ('low','okay','good')),
  move_done boolean default false,
  study_done boolean default false,
  counted boolean generated always as (move_done and study_done) stored,
  paper_dump_done boolean default false,
  self_test_done boolean default false,
  unique (user_id, log_date)
);

alter table day_logs enable row level security;
create policy "own rows only" on day_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- WORKOUTS
-- ---------------------------------------------------------------
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  logged_at timestamptz default now(),
  kind text check (kind in ('workout','walk')),
  minutes int,
  rung int,
  routine_note text
);

alter table workouts enable row level security;
create policy "own rows only" on workouts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- STUDY SESSIONS
-- ---------------------------------------------------------------
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  problem text,
  pattern text,
  target_min int,
  actual_min int,
  phone_away boolean,
  takeaway text,
  redo_reminders boolean default false
);

alter table study_sessions enable row level security;
create policy "own rows only" on study_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- HELP EVENTS
-- ---------------------------------------------------------------
create table if not exists help_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  session_id uuid references study_sessions on delete cascade,
  minute_asked int,
  source text check (source in ('google','youtube','ai','friend','editorial')),
  amount text check (amount in ('nudge','hint','approach','full')),
  before_state text check (before_state in ('approach','syntax','anxious','other')),
  logged_late boolean default false
);

alter table help_events enable row level security;
create policy "own rows only" on help_events for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- RECONSTRUCTS
-- ---------------------------------------------------------------
create table if not exists reconstructs (
  session_id uuid primary key references study_sessions on delete cascade,
  user_id uuid references auth.users on delete cascade not null,
  result text check (result in ('yes','partly','not_yet'))
);

alter table reconstructs enable row level security;
create policy "own rows only" on reconstructs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- REDO REMINDERS
-- ---------------------------------------------------------------
create table if not exists redo_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  session_id uuid references study_sessions on delete cascade,
  remind_on date not null,
  done boolean default false
);

alter table redo_reminders enable row level security;
create policy "own rows only" on redo_reminders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- SYNTAX LOOKUPS
-- ---------------------------------------------------------------
create table if not exists syntax_lookups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  looked_up_at timestamptz default now(),
  note text
);

alter table syntax_lookups enable row level security;
create policy "own rows only" on syntax_lookups for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- SCROLL LOGS
-- ---------------------------------------------------------------
create table if not exists scroll_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  app text not null,
  minutes int not null,
  time_of_day text check (time_of_day in ('morning','afternoon','night')),
  reason text check (reason in ('bored','avoiding','tired','habit')),
  created_at timestamptz default now()
);

alter table scroll_logs enable row level security;
create policy "own rows only" on scroll_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- BODY CHECKS
-- ---------------------------------------------------------------
create table if not exists body_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  sleep_hours numeric(3,1),
  energy int check (energy between 1 and 5),
  note text
);

alter table body_checks enable row level security;
create policy "own rows only" on body_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- OPTIONAL LOGS
-- ---------------------------------------------------------------
create table if not exists optional_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null,
  kind text check (kind in ('reading','podcast','music_walk','life')),
  minutes int,
  note text
);

alter table optional_logs enable row level security;
create policy "own rows only" on optional_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- SAVED ITEMS
-- ---------------------------------------------------------------
create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  title text,
  url text,
  source text,
  note text,
  status text default 'saved' check (status in ('saved','in_progress','done','dropped')),
  revisit_on date,
  deadline date,
  company text,
  role text,
  applied boolean default false,
  rating int check (rating between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists saved_items_user_cat_status
  on saved_items (user_id, category, status);

alter table saved_items enable row level security;
create policy "own rows only" on saved_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- WEEKLY REVIEWS
-- ---------------------------------------------------------------
create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  week_start date not null,
  worked text,
  hard text,
  keep text,
  drop text,
  unique (user_id, week_start)
);

alter table weekly_reviews enable row level security;
create policy "own rows only" on weekly_reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- COMEBACKS
-- ---------------------------------------------------------------
create table if not exists comebacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  returned_on date not null,
  gap_days int
);

alter table comebacks enable row level security;
create policy "own rows only" on comebacks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- PUSH SUBSCRIPTIONS
-- ---------------------------------------------------------------
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  endpoint text unique not null,
  keys jsonb not null
);

alter table push_subscriptions enable row level security;
create policy "own rows only" on push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- VIEWS (security_invoker = true so RLS applies)
-- ---------------------------------------------------------------
create or replace view help_timing_weekly
  with (security_invoker = true)
  as
  select
    he.user_id,
    date_trunc('week', ss.started_at) as week_start,
    round(avg(he.minute_asked)) as avg_minute_asked,
    count(*) as help_count
  from help_events he
  join study_sessions ss on ss.id = he.session_id
  where he.minute_asked is not null
  group by he.user_id, week_start;

create or replace view scroll_weekly
  with (security_invoker = true)
  as
  select
    user_id,
    date_trunc('week', log_date::timestamptz) as week_start,
    app,
    sum(minutes) as total_minutes
  from scroll_logs
  group by user_id, week_start, app;

create or replace view revisit_candidates
  with (security_invoker = true)
  as
  select *
  from saved_items
  where status = 'saved'
    and created_at < now() - interval '7 days';

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
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------
-- TRIGGER: update saved_items.updated_at
-- ---------------------------------------------------------------
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_items_updated_at on saved_items;
create trigger saved_items_updated_at
  before update on saved_items
  for each row execute function update_updated_at();

-- Repair migration for projects where 002_brain_companion stopped
-- while recreating the profiles policy from the original schema.

create table if not exists brain_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  category text check (category in ('ideas', 'learn', 'social', 'remember', 'buy', 'people', 'random')) default 'random',
  is_idea boolean generated always as (category = 'ideas') stored,
  archived boolean default false,
  source text default 'brain',
  created_at timestamptz default now()
);

create table if not exists nudge_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  nudge_type text not null,
  nudge_message text,
  response text check (response in ('yeah', 'later', 'not_today')) not null,
  responded_at timestamptz default now()
);

create table if not exists reality_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  intended_task text,
  was_on_task boolean,
  distraction_reason text,
  restarted boolean default false,
  created_at timestamptz default now()
);

create table if not exists comebacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  returned_on date default current_date,
  gap_days int,
  restart_action text,
  created_at timestamptz default now()
);

alter table brain_items enable row level security;
alter table nudge_responses enable row level security;
alter table reality_checks enable row level security;
alter table comebacks enable row level security;

drop policy if exists "own rows only" on brain_items;
create policy "own rows only" on brain_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on nudge_responses;
create policy "own rows only" on nudge_responses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on reality_checks;
create policy "own rows only" on reality_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on comebacks;
create policy "own rows only" on comebacks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists brain_items_user_category
  on brain_items(user_id, category, created_at desc);

-- Migration: create playbook_view_presets table (server-backed saved views)
-- Generated 2025-08-11

create table if not exists playbook_view_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Soft delete / future
  archived boolean not null default false
);

-- Helpful index for listing per user/team ordering by recency
create index if not exists idx_playbook_view_presets_user_team_recency
  on playbook_view_presets(user_id, team_id, updated_at desc);

-- RLS policies skeleton (adjust once auth model finalized)
alter table playbook_view_presets enable row level security;

-- Allow owners to CRUD their presets (development permissive policy)
create policy "playbook_view_presets_select_own" on playbook_view_presets
  for select using (auth.uid() = user_id);
create policy "playbook_view_presets_insert_own" on playbook_view_presets
  for insert with check (auth.uid() = user_id);
create policy "playbook_view_presets_update_own" on playbook_view_presets
  for update using (auth.uid() = user_id);
create policy "playbook_view_presets_delete_own" on playbook_view_presets
  for delete using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_playbook_view_presets_updated
  before update on playbook_view_presets
  for each row execute procedure set_updated_at();

-- Apply in the chosen Supabase project's SQL editor.
-- Each signed-in user owns one revisioned workspace document.
create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"tasks":[],"activities":[],"preferences":{}}'::jsonb,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint valid_workspace_payload check (
    jsonb_typeof(payload->'tasks') = 'array'
    and jsonb_typeof(payload->'activities') = 'array'
  )
);
alter table public.workspaces enable row level security;
revoke all on public.workspaces from anon;
grant select, insert, update, delete on public.workspaces to authenticated;
drop policy if exists "Read own workspace" on public.workspaces;
create policy "Read own workspace" on public.workspaces for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Create own workspace" on public.workspaces;
create policy "Create own workspace" on public.workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own workspace" on public.workspaces;
create policy "Update own workspace" on public.workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Remove own workspace" on public.workspaces;
create policy "Remove own workspace" on public.workspaces for delete to authenticated using ((select auth.uid()) = user_id);

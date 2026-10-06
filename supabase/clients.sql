create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  full_name text not null,
  email text,
  company_name text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

revoke all on table public.clients from anon, authenticated;
grant select, insert, update, delete on table public.clients to authenticated;

create policy "clients: owner can select"
  on public.clients for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "clients: owner can insert"
  on public.clients for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "clients: owner can update"
  on public.clients for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "clients: owner can delete"
  on public.clients for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index clients_user_id_idx on public.clients (user_id);


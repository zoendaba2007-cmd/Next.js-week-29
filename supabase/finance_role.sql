-- Finance manager role. Run in Supabase -> SQL Editor. 
-- Option A: the finance manager has every feature a practice user has (own patients, appointments, charts, files)
-- PLUS Invoices and Customers. Patient and appointment policies are NOT changed: they stay owner-only.

-- 1. Who is a finance manager. No row = ordinary practice user.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('finance_manager'))
);
alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;

drop policy if exists "user_roles: read own" on public.user_roles;
create policy "user_roles: read own"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);
-- No insert, update or delete policy: roles are assigned from the SQL Editor only,
-- so nobody can promote themselves.

-- 2. Helper used by the policies below
create or replace function public.has_role(r text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = r
  );
$$;
revoke all on function public.has_role(text) from public, anon;
grant execute on function public.has_role(text) to authenticated;

-- 3. The course tables: RLS on, finance manager only
alter table public.customers enable row level security;
alter table public.invoices  enable row level security;
alter table public.revenue   enable row level security;

revoke all on table public.customers, public.invoices, public.revenue from anon, authenticated;
grant select on table public.customers, public.revenue to authenticated;
grant select, insert, update, delete on table public.invoices to authenticated;

drop policy if exists "customers: finance can read" on public.customers;
drop policy if exists "revenue: finance can read"   on public.revenue;
drop policy if exists "invoices: finance can read"   on public.invoices;
drop policy if exists "invoices: finance can insert" on public.invoices;
drop policy if exists "invoices: finance can update" on public.invoices;
drop policy if exists "invoices: finance can delete" on public.invoices;

create policy "customers: finance can read" on public.customers
  for select to authenticated using ((select public.has_role('finance_manager')));
create policy "revenue: finance can read" on public.revenue
  for select to authenticated using ((select public.has_role('finance_manager')));

create policy "invoices: finance can read" on public.invoices
  for select to authenticated using ((select public.has_role('finance_manager')));
create policy "invoices: finance can insert" on public.invoices
  for insert to authenticated with check ((select public.has_role('finance_manager')));
create policy "invoices: finance can update" on public.invoices
  for update to authenticated
  using ((select public.has_role('finance_manager')))
  with check ((select public.has_role('finance_manager')));
create policy "invoices: finance can delete" on public.invoices
  for delete to authenticated using ((select public.has_role('finance_manager')));

-- 4. Assign the role (run once, with the finance user's id from Authentication -> Users):
-- insert into public.user_roles (user_id, role) values ('<finance user id>', 'finance_manager')
--   on conflict (user_id) do nothing;

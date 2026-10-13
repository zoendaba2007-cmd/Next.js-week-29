-- DO NOT commit with real ids. Replace <finance user id> and <user one id> (Authentication -> Users).

-- 1. Assign the role
insert into public.user_roles (user_id, role) values ('<finance user id>', 'finance_manager')
  on conflict (user_id) do nothing;

-- 2. Finance manager reads the course tables: expect the full counts
begin; set local role authenticated;
set local request.jwt.claim.sub = '<finance user id>';
select count(*) from public.invoices;
select count(*) from public.customers;
rollback;

-- 3. Finance manager still sees only THEIR OWN patients (Option A): expect their own rows only (0 if none seeded)
begin; set local role authenticated;
set local request.jwt.claim.sub = '<finance user id>';
select count(*) from public.patients;
rollback;

-- 4. Ordinary user one: expect 0 rows from the course tables
begin; set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
select count(*) from public.invoices;
select count(*) from public.customers;
rollback;

-- 5. Ordinary user one must not write invoices: expect ERROR 42501 (row-level security)
begin; set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
insert into public.invoices (customer_id, amount, status, date)
  values ((select id from public.customers limit 1), 100, 'pending', current_date);
rollback;

-- 6. A user cannot promote themselves: expect ERROR 42501 (permission denied)
begin; set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
insert into public.user_roles (user_id, role) values ('<user one id>', 'finance_manager');
rollback;

-- 7. Not signed in: expect "permission denied" or 0 rows
begin; set local role anon;
select count(*) from public.invoices;
rollback;

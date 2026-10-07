-- Replace <user one id> and <user two id> with the ids from Supabase -> Authentication -> Users.

-- 1. Seed (the SQL Editor runs as postgres, so user_id is set by hand)
insert into public.patients (user_id, full_name, phone, date_of_birth) values
  ('<user one id>', 'Thandi Nkosi',   '082 000 0001', '1988-04-12'),
  ('<user one id>', 'Pieter van Wyk', '083 000 0002', '1975-11-30'),
  ('<user two id>', 'Ayesha Patel',   '084 000 0003', '1992-07-08');

select full_name, user_id from public.patients;   -- all 3 rows (postgres bypasses RLS)

-- 2. As user one: expect Thandi and Pieter only
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
select full_name from public.patients;
rollback;

-- 3. As user two: expect Ayesha only
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user two id>';
select full_name from public.patients;
rollback;

-- 4. No user: expect 0 rows
begin;
set local role authenticated;
select full_name from public.patients;
rollback;

-- 5. Optional, for the chart: 30 realistic rows spread over five months (user one)
insert into public.patients (user_id, full_name, created_at)
select
  '<user one id>'::uuid,
  'Seed patient ' || g,
  now() - ((g * 37) % 150) * interval '1 day'
from generate_series(1, 30) as g;
-- remove them later:
-- delete from public.patients where full_name like 'Seed patient %';

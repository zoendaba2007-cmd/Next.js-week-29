-- Replace <user one id> and <user two id> with the ids from Authentication -> Users.

-- 1. Seed 18 appointments this month for user one's patients (the SQL Editor is postgres, so user_id is set by hand)
insert into public.appointments (user_id, patient_id, starts_at, status)
select
  '<user one id>'::uuid,
  p.id,
  date_trunc('month', now()) + (g * interval '1 day') + interval '9 hours',
  case when g % 6 = 0 then 'no_show' when g % 3 = 0 then 'booked' else 'done' end
from public.patients p
cross join generate_series(1, 9) as g
where p.user_id = '<user one id>'
limit 18;

select a.status, count(*) from public.appointments a group by 1;   -- all users (postgres bypasses RLS)

-- 2. As user one: sees only their own appointments
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
select count(*) from public.appointments;
rollback;

-- 3. As user two: sees none of user one's rows (expect 0)
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user two id>';
select count(*) from public.appointments;
rollback;

-- 4. THE TRAP: user two books against user one's patient. Expect ERROR 42501 (row-level security).
--    First find a patient id:  select id from public.patients where user_id = '<user one id>' limit 1;
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user two id>';
insert into public.appointments (patient_id, starts_at)
  values ('<user one patient id>', now());
rollback;

-- 5. Control: user one books against their own patient. Expect success.
begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
insert into public.appointments (patient_id, starts_at)
  values ('<user one patient id>', now());
rollback;

-- Remove the seed later:
-- delete from public.appointments where user_id = '<user one id>';

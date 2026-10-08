-- DO NOT commit this file with real ids filled in.
-- Replace <user one id> and <user two id> with the ids from Authentication -> Users.

-- 1. Seed 45 appointments this month across all three statuses (the SQL Editor is postgres and bypasses RLS,
--    so the rows take user_id and patient ids from YOUR OWN patients; nothing is typed by hand except your user id)
--    Weighted about 3:1 towards done, with a realistic share of no_show.
--    If you already ran an earlier seed, clear it first:  delete from public.appointments where user_id = '<user one id>';
insert into public.appointments (user_id, patient_id, starts_at, status)
select
  s.user_id,
  s.patient_id,
  s.starts_at,
  case s.rn % 8
    when 0 then 'no_show'      -- 1 in 8
    when 1 then 'booked'       -- 2 in 8
    when 2 then 'booked'
    else 'done'                -- 5 in 8
  end
from (
  select
    p.user_id,
    p.id as patient_id,
    date_trunc('month', now())
      + make_interval(days => (random() * 27)::int, hours => 8 + (random() * 8)::int) as starts_at,
    row_number() over (order by random()) as rn
  from public.patients p
  cross join generate_series(1, 20) as n
  where p.user_id = '<user one id>'
) s
order by s.rn
limit 45;                     -- keeps the total between 30 and 60 however many patients you have

select status, count(*) from public.appointments group by status order by status;   -- want all three statuses

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

-- Chart two: this month's appointments by status (donut). Zero rows still appear for each status.
-- Month boundaries use South African time, so a booking at 00:30 on the 1st lands in the right month.
drop view if exists public.appointments_by_status;

create view public.appointments_by_status
with (security_invoker = true) as
select
  s.status,
  initcap(replace(s.status, '_', ' ')) as label,
  count(a.id)::int as appointments
from (values ('booked'), ('done'), ('no_show')) as s(status)
left join public.appointments a
  on a.status = s.status
 and (a.starts_at at time zone 'Africa/Johannesburg')
       >= date_trunc('month', now() at time zone 'Africa/Johannesburg')
 and (a.starts_at at time zone 'Africa/Johannesburg')
       <  date_trunc('month', now() at time zone 'Africa/Johannesburg') + interval '1 month'
group by s.status
order by s.status;

revoke all on table public.appointments_by_status from anon, authenticated;
grant select on table public.appointments_by_status to authenticated;

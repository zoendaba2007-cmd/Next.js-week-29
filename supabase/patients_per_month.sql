-- Chart one: new patients per month, last 6 months (quiet months show 0)
drop view if exists public.patients_per_month;

create view public.patients_per_month
with (security_invoker = true) as
select
  m.month_start,
  to_char(m.month_start, 'Mon YYYY') as label,
  count(p.id)::int as new_patients
from generate_series(
  date_trunc('month', now()) - interval '5 months',
  date_trunc('month', now()),
  interval '1 month'
) as m(month_start)
left join public.patients p
  on p.created_at >= m.month_start
 and p.created_at < m.month_start + interval '1 month'
group by m.month_start
order by m.month_start;

revoke all on table public.patients_per_month from anon, authenticated;
grant select on table public.patients_per_month to authenticated;


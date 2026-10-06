-- Chart one: new clients per month, last 6 months (quiet months show 0)
drop view if exists public.clients_per_month;

create view public.clients_per_month
with (security_invoker = true) as
select
  m.month_start,
  to_char(m.month_start, 'Mon YYYY') as label,
  count(c.id)::int as new_clients
from generate_series(
  date_trunc('month', now()) - interval '5 months',
  date_trunc('month', now()),
  interval '1 month'
) as m(month_start)
left join public.clients c
  on c.created_at >= m.month_start
 and c.created_at < m.month_start + interval '1 month'
group by m.month_start
order by m.month_start;

revoke all on table public.clients_per_month from anon, authenticated;
grant select on table public.clients_per_month to authenticated;


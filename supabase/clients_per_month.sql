create view public.clients_per_month
with (security_invoker = true) as
select
  date_trunc('month', created_at)::date as month,
  count(*)::int as clients
from public.clients
group by 1
order by 1;

revoke all on table public.clients_per_month from anon, authenticated;
grant select on table public.clients_per_month to authenticated;

select * from public.clients_per_month;

begin;
set local role authenticated;
set local request.jwt.claim.sub = '<user one id>';
select * from public.clients_per_month;
rollback;

begin;
set local role authenticated;
select * from public.clients_per_month;
rollback;

/* If user one sees user two's clients mixed in: the view isn't using security_invoker. Drop it and recreate it exactly as above */

drop view public.clients_per_month;

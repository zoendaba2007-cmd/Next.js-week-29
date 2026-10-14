-- Prevent booked appointments for the same practice from overlapping.
-- Run in Supabase -> SQL Editor after appointments.sql. Safe to run again.

begin;

create extension if not exists btree_gist;

alter table public.appointments
  add column if not exists ends_at timestamptz;

update public.appointments
set ends_at = starts_at + interval '30 minutes'
where ends_at is null;

alter table public.appointments
  alter column ends_at set not null;

create or replace function public.set_appointment_end_time()
returns trigger
language plpgsql
as $$
begin
  new.ends_at := new.starts_at + interval '30 minutes';
  return new;
end;
$$;

drop trigger if exists appointments_set_end_time on public.appointments;
create trigger appointments_set_end_time
  before insert or update on public.appointments
  for each row
  execute function public.set_appointment_end_time();

do $$
declare
  conflicting_pairs bigint;
begin
  select count(*)
  into conflicting_pairs
  from public.appointments a
  join public.appointments b
    on a.user_id = b.user_id
   and a.id < b.id
   and a.status = 'booked'
   and b.status = 'booked'
   and tstzrange(a.starts_at, a.ends_at, '[)')
       && tstzrange(b.starts_at, b.ends_at, '[)');

  if conflicting_pairs > 0 then
    raise exception 'Cannot prevent double bookings: found % pairs of overlapping booked appointments.',
      conflicting_pairs
      using hint = 'Resolve existing overlapping booked appointments, then run this script again.';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_no_overlapping_booked_slots'
  ) then
    alter table public.appointments
      add constraint appointments_no_overlapping_booked_slots
      exclude using gist (
        user_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status = 'booked');
  end if;
end;
$$;

commit;

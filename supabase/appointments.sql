-- Entity two: appointments (child of patients). Run in Supabase -> SQL Editor.
-- patients and its four policies must already exist.

create table public.appointments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id),
  patient_id uuid not null references public.patients (id) on delete cascade,
  starts_at  timestamptz not null,
  status     text not null default 'booked' check (status in ('booked', 'done', 'no_show')),
  created_at timestamptz not null default now()
);
-- "on delete cascade": deleting a patient also deletes their appointments.
-- If your domain must keep them, remove those three words: the database then refuses
-- to delete a patient who still has appointments.

alter table public.appointments enable row level security;
revoke all on table public.appointments from anon, authenticated;
grant select, insert, update, delete on table public.appointments to authenticated;

-- Index what policies and joins filter on
create index appointments_user_id_idx    on public.appointments (user_id);
create index appointments_patient_id_idx on public.appointments (patient_id);

-- Foreign key checks bypass RLS, so insert and update must ALSO prove the patient is visible to you.
create policy "appointments: owner can select" on public.appointments
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "appointments: owner can insert" on public.appointments
  for insert to authenticated
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.patients p where p.id = patient_id));

create policy "appointments: owner can update" on public.appointments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id
    and exists (select 1 from public.patients p where p.id = patient_id));

create policy "appointments: owner can delete" on public.appointments
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Live updates on the front end
alter publication supabase_realtime add table public.appointments;

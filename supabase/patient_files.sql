-- Storage stretch: a PRIVATE bucket for patient files, limited by size and type, readable only by the owner.
-- Run in Supabase -> SQL Editor. Safe to run again.

alter table public.patients add column if not exists file_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-files', 'patient-files',
  false,                                              -- private: no public URL ever
  2097152,                                            -- 2 MB (2 x 1024 x 1024 bytes)
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf'];

-- Each user may only touch files inside a folder named with their own user id:
--   <user id>/<patient id>/<random>.pdf
drop policy if exists "patient-files: owner can read"   on storage.objects;
drop policy if exists "patient-files: owner can upload" on storage.objects;
drop policy if exists "patient-files: owner can update" on storage.objects;
drop policy if exists "patient-files: owner can delete" on storage.objects;

create policy "patient-files: owner can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "patient-files: owner can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'patient-files'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "patient-files: owner can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'patient-files'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "patient-files: owner can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

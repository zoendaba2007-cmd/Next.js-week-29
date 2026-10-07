insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-files', 'patient-files', false,
  2097152,
  array['image/jpeg', 'image/png', 'application/pdf']
);

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


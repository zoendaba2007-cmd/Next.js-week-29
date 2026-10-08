-- Run these three on the project production uses. Expected results are in the comments.

-- 1. The bucket is private and limited: expect public = false, 2097152, {image/jpeg,image/png,application/pdf}
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'patient-files';

-- 2. The four policies exist: expect 4 rows (select, insert, update, delete)
select policyname, cmd from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like 'patient-files:%'
order by cmd;

-- 3. The tables are in the Realtime publication: expect patients and appointments
select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename;

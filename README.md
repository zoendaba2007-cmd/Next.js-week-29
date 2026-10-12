# Family Clinic Dashboard

Production: https://week-29.vercel.app

## What it is
A dashboard for a small family practice. The owner and front-desk staff manage their own patients and appointments, and the owner uses two charts to decide whether to open a second consulting day and whether to send reminder messages.

## Entities and the two questions the charts answer
Entities: patients, appointments (foreign key to patients)
1. Is the practice growing?: bar chart of new patients per month (last 6 months). Who acts: the owner decides whether to open a second consulting day.
2. What share of this month's appointments are no-shows?: donut of appointment status this month. Who acts: the owner decides whether to send reminder messages.

## Chart honesty checklist (both charts)
- [ ] The title states the question the chart answers
- [ ] Both axes are labelled, with units (the donut: every slice labelled, plus a legend)
- [ ] With no rows for the signed-in user, a sentence shows instead of an empty chart
- [ ] One "so what" line under the chart names who acts and on what

## DEMO LOGIN (for reviewers)
Email: demouser@example.com
Password: 1478910
A demo-only account with seed data; not a real person.

## How to run locally
1. Clone the repository and run pnpm install (run pnpm approve-builds if pnpm reports ignored build scripts).
2. Create .env.local with these variable NAMES (values from your own Supabase project):
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY   (holds the publishable key)
   POSTGRES_URL   (only for the sample Invoices and Customers pages from the Next.js course)
3. Run the SQL in the supabase/ folder in the SQL Editor, in this order:
   patients.sql, patients_per_month.sql, appointments.sql, appointments_by_status.sql, patient_files.sql
4. Run pnpm dev and open http://localhost:3000.

## Smoke test (<date>, run on production as two users)
- [ ] 1. Signed out, /dashboard redirects to login
- [ ] 2. User one signs in and lands on /dashboard
- [ ] 3. Patients: create, edit, delete; list updates
- [ ] 4. Appointments: create (select shows only my patients), edit, delete
- [ ] 5. Both charts render from real rows, question as title
- [ ] 6. User two (private window) sees empty states, then none of user one's rows
- [ ] 7. User two opening user one's edit URL gets not-found
- [ ] 8. Empty create form shows messages, saves nothing
- [ ] 9. Unknown URL (including /seed) shows the not-found page
- [ ] 10. Sign out works; .env.local is not on GitHub
- [ ] R. Realtime: an insert in window A updates window B within a second
- [ ] S. Storage: upload and signed link work; user two cannot open user one's file; the bucket is private
RLS: user B cannot see or edit user A's patients or appointments (checked <date>).

## Freeze plan (8 Oct)

### Must ship today (max 5, each one testable on the preview URL)
1. Verify patients and appointments create, edit and delete work in production, and the appointment's patient select shows only my rows; smoke checks 3, 4 and 7.
2. Verify both charts render from seeded rows, and a user with no rows sees a sentence, not an error; smoke checks 5 and 6.
3. Verify the two stretch features that already work: Realtime updates lists and charts in a second window within a second (check R), and Storage keeps patient files in a private bucket that user two cannot open (check S).
4. Delete the public /seed route so an unknown or removed URL shows the not-found page; smoke check 9.

### Cut (one honest sentence each)
- Third entity (treatments): not built; both existing entities have full CRUD behind RLS and both charts are finished, and a half-built third table would add risk.

### Monday polish (max 3, cosmetic or README-only)
1. Add a screenshot of each chart to this README.
2. Fill in the real production domain and demo login wording.

## Stretch: Realtime and Storage
**Realtime.** Lists and charts refresh when a row changes. The patients and appointments tables are in the supabase_realtime publication, and a small client component calls router.refresh() on each change, so the server re-queries through the Row Level Security policies and a user only ever receives their own rows. Smoke check R ticked above.

**Storage.** One file per patient, kept in the bucket patient-files: private (no public URL), size limit 2 MB, JPG, PNG or PDF only. Files live under a folder named with the owner's user id, and four policies on storage.objects let a user read, upload, replace and delete only inside their own folder. The app checks type, size and the file's first bytes before uploading, shows the file through a signed link that expires after 60 seconds, and deletes the file when the patient is deleted. Smoke check S ticked above.

## Known gaps
- Two users can book the same appointment slot; this app assumes one calendar owner.
- Deleting a patient also deletes their appointments (on delete cascade); a real practice would keep records and block the delete instead.
- Times are entered in South African time (+02:00, no daylight saving).
- Storage: one file per patient, replaced on each upload; no virus scan.
- The sample Invoices and Customers pages from the Next.js course read through a direct database connection and are not behind Row Level Security; they hold sample data only.

## Notes
Chart one uses `patients` only, so the charts were not swapped.
Realtime in supabase
Buckets in supabase
- limit size
- limit type of file
- restrict who has permission

What is defined as done?
- Create an acceptence criter

Create a roadmap for ideas that you want to add to the project

For today, I need to do smoke testing against the Proposal.md file

- fix what is broken
- Does the project work with a stranger for 1 min (is it easy to use)
 What is this? (one sentence)
 Does it run? (is there a live link that works)
 Can you explainyour choices?
 
- README that can  be read in 1 min
 What it does?
 Live link and demo login
 How to run it?
 Tech stack
 Known limitations -be honest
 What I would do next - 3 concrete things
  DON'T DO
  No .env
  Live link that doesn't work
  Setup steps that fail in a fresh machine
  Default create-next-app taext still in place
  "Project for school" and nothing else
- Fix bugs that would embarrass you in demo
- Reach feature freeze by end of day
 Can log in and out
 Create edit delete each work
 Chart renders
 README written
 No secrets in the repo
 Last commit is pushed and deployed

- Always have a backup

- What a demo tell an employer
 Can you explain what you built?
 Do you know how it works?
 Are you honest about what is not finished?
 Can you stay calm when something goes wrong?

- What a demo is NOT
 A tour of every page
 Reading code aloud line by line
 Apologising before you start
 Something you only run for the first time on the day

- Priorities
 Broken in production
 README appears on a freash clone
 Seed data so demo is empty
 Demo account that works (patients don't need to login)
 Extras if 1-4 are done
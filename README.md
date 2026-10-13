# Family Clinic Dashboard

A small web app where a family practice manages its patients and appointments and sees two charts that help the owner decide what to do next.

**Live:** https://week-29.vercel.app

## DEMO LOGIN (for reviewers)
Email: demo@<your-project>.example
Password: <a throwaway password used nowhere else>
A demo-only account with seed data; not a real person.

Finance manager demo login (sees Invoices and Customers as well)
Email: finance@<your-project>.example
Password: <a different throwaway password>

## What it does
- Sign in and out; every page under /dashboard redirects to the login page when you are signed out.
- Patients and appointments: list, create, edit, delete. An appointment belongs to one of your patients.
- Two charts on the dashboard (see below), built from your own rows.
- Each user sees only their own patients and appointments (Row Level Security in the database, not just hidden buttons).
- A finance manager role sees the course's Invoices and Customers pages and can create, edit and delete invoices; ordinary users cannot open them.
- Lists and charts update by themselves when a row changes in another window (Realtime).
- One private file per patient (a referral letter or ID photo), limited to JPG, PNG or PDF and 2 MB.

## Roles
| Role | Patients, appointments, charts, files | Invoices and Customers |
|---|---|---|
| practice user (default) | own rows only | no access: redirected to the dashboard |
| finance manager | own rows only (same as a practice user) | full access: read, and create, edit, delete invoices |

A user is a finance manager only if a row exists for them in the user_roles table. Roles are assigned from the SQL Editor; there is no policy that lets a user write to that table, so nobody can promote themselves. The finance manager deliberately does not see other users' patients, because those are health records and finance does not need clinical detail.

## The two questions the charts answer
Entities: patients, appointments (each appointment points at a patient)
1. Is the practice growing? Bar chart of new patients per month (last 6 months). Who acts: the owner decides whether to open a second consulting day.
2. What share of this month's appointments are no-shows? Donut of appointment status this month. Who acts: the owner decides whether to send reminder messages.

## Tech stack
Next.js (App Router, Server Components, Server Actions), TypeScript, Tailwind CSS, Supabase (Auth, Postgres with Row Level Security, Realtime, Storage), Zod for validation, Recharts for charts, pnpm, deployed on Vercel.

## How to run it
1. Clone the repository, then run pnpm install. If pnpm reports ignored build scripts, run pnpm approve-builds and approve them.
2. Create .env.local in the project root with these variable NAMES (values from your own Supabase project; never commit this file):
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY   (holds the publishable key)
   POSTGRES_URL   (only for the sample Invoices and Customers pages from the Next.js course)
3. In the Supabase SQL Editor, run the files in the supabase/ folder in this order:
   patients.sql, patients_per_month.sql, appointments.sql, appointments_by_status.sql, patient_files.sql, finance_role.sql
4. In Supabase, create a user under Authentication -> Users with Auto Confirm ticked.
5. Run pnpm dev and open http://localhost:3000.

## Chart honesty checklist (both charts)
- [ ] The title states the question the chart answers
- [ ] Both axes are labelled, with units (the donut: every slice labelled, plus a legend)
- [ ] With no rows for the signed-in user, a sentence shows instead of an empty chart
- [ ] One "so what" line under the chart names who acts and on what

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
- [ ] F. Finance manager sees Invoices and Customers and can edit invoices; user one is redirected away from them
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
2. Fill in the real demo login wording.

## Stretch: Realtime and Storage
**Realtime.** The patients and appointments tables are in the supabase_realtime publication, and a small client component calls router.refresh() on each change. The server then re-queries through the Row Level Security policies, so a user only ever receives their own rows.

**Storage.** One file per patient in the bucket patient-files: private (no public URL), 2 MB limit, JPG, PNG or PDF only. Files live under a folder named with the owner's user id, and four policies on storage.objects let a user read, upload, replace and delete only inside their own folder. The app checks type, size and the file's first bytes before uploading, shows the file through a signed link that expires after 60 seconds, and deletes the file when the patient is deleted. A text file renamed to .pdf was accepted in the first test, which is why the first-bytes check was added.

## Known limitations
- Only two roles exist: a practice user (own rows only) and a finance manager. There is no finer permission, for example a front-desk role that can create but not delete.
- Two people can book the same appointment slot; the app assumes one calendar owner.
- Deleting a patient also deletes their appointments (on delete cascade). A real practice would keep records and block the delete instead.
- Times are entered in South African time (+02:00, no daylight saving).
- Storage: one file per patient, replaced on each upload; no virus scan.
- The finance role on Invoices and Customers is enforced by a guard on each page and Server Action. Those pages still query through a direct database connection, which bypasses Row Level Security, so the matching database policies protect the Supabase API path but not these queries yet. They hold sample data only.
- The third entity (treatments) was planned and not built.

## What I would do next
1. Move the Invoices and Customers data functions from the direct database connection to the Supabase client, so the database enforces the finance role on every query and not just the page guards. Done when no page reads through a direct connection and user one still gets no rows.
2. Stop double bookings in the database: add an end time and an exclusion constraint on overlapping time ranges, and show "That time is already booked." Done when booking the same slot twice leaves one row.
3. Add a front-desk role that can create and edit appointments but not delete them, using the same user_roles table. Done when a front-desk test user cannot delete an appointment.

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
 1. Broken in production
 2. README appears on a freash clone
 3. Seed data so demo is empty
 4. Demo account that works (patients don't need to login)
 5. Extras if 1-4 are done


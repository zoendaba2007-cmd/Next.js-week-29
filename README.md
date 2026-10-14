# Medic Clinic Dashboard

Production: https://week-29.vercel.app

## 1. What it does
Medic Clinic Dashboard is a web app where a small family practice manages its patients and appointments. Two charts show the owner whether the practice is growing and what share of this month's appointments are no-shows, so they can decide whether to open a second consulting day or send reminders. Every user only ever sees their own data, and a finance manager role also gets the Invoices and Customers pages.

## 2. Live link and demo login
Live: https://week-29.vercel.app

DEMO LOGIN (practice user)
Email: demouser@example.com
Password: 1478910

DEMO LOGIN (finance manager: also sees Invoices and Customers)
Email: financeuser@example.com
Password: 3691215

Both are demo-only accounts with seed data; they are not real people.

## 3. How to run it
1. Clone the repository, then run pnpm install. If pnpm reports ignored build scripts, run pnpm approve-builds and approve them.
2. Create .env.local in the project root with these variable NAMES (values from your own Supabase project; never commit this file):
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY   (holds the publishable key)
   POSTGRES_URL   (only for the Invoices and Customers pages from the Next.js course)
3. In the Supabase SQL Editor, run the files in the supabase/ folder in this order:
   patients.sql, patients_per_month.sql, appointments.sql, appointments_prevent_double_booking.sql, appointments_by_status.sql, patient_files.sql, finance_role.sql
4. Create a user under Authentication -> Users with Auto Confirm ticked. 
5. Run pnpm dev and open http://localhost:3000.

## 4. Tech stack and why
- Next.js (App Router, Server Components, Server Actions) with TypeScript: pages fetch data on the server, and every create, edit and delete runs as a Server Action, so database access never reaches the browser.
- Supabase (Auth, Postgres, Row Level Security, Realtime, Storage): sign-in, the database, the privacy rules, live updates and file storage in one place, so the rules that protect the data live next to the data.
- Tailwind CSS: fast, consistent styling without separate style files, with a calm teal palette chosen because teal reads as trustworthy and soothing in health settings, and one warm coral kept for the thing that needs action (no-shows).
- Zod: checks every form on the server, so bad input is rejected even if the browser check is skipped.
- Recharts: React charts that can be labelled and sized for a phone.
- Vercel: deploys from GitHub on every push, with a preview URL for each branch.

## 5. Known limitations
- Only two roles exist: a practice user (own rows only) and a finance manager. There is no finer permission, for example a front-desk role that can create but not delete.
- Appointments last 30 minutes. Booked appointments for the same practice cannot overlap; completed and no-show appointments do not block a time. Currently not worrking
- If appointments_prevent_double_booking.sql reports existing overlapping bookings, resolve those conflicts before rerunning the migration.
- The finance role on Invoices and Customers is enforced by a guard on each page and Server Action. Those pages still query through a direct database connection, which bypasses Row Level Security, so the database policies protect the API path but not these queries yet. They hold sample data only.
- Deleting a patient also deletes their appointments (on delete cascade). A real practice would keep records and block the delete instead.
- Times are entered in South African time (+02:00, no daylight saving).
- Storage: one file per patient, replaced on each upload; no virus scan.
- The third entity in the proposal (treatments) was planned and not built.

## 6. What I would do next
1. Move the Invoices and Customers data functions from the direct database connection to the Supabase client, so the database enforces the finance role on every query and not just the page guards. Done when no page reads through a direct connection and user one still gets no rows.
2. Add a front-desk role that can create and edit appointments but not delete them, using the same user_roles table. Done when a front-desk test user cannot delete an appointment.

---

## Reference: the two chart questions
Entities: patients, appointments (each appointment points at a patient)
1. Is the practice growing? Bar chart of new patients per month (last 6 months). Who acts: the owner decides whether to open a second consulting day.
2. What share of this month's appointments are no-shows? Donut of appointment status this month. Who acts: the owner decides whether to send reminder messages.

## Reference: roles
| Role | Patients, appointments, charts, files | Invoices and Customers |
|---|---|---|
| practice user (default) | own rows only | no access: redirected to the dashboard |
| finance manager | own rows only (same as a practice user) | full access: read, and create, edit, delete invoices |

A user is a finance manager only if a row exists for them in the user_roles table. Roles are assigned from the SQL Editor, and no policy lets a user write to that table, so nobody can promote themselves. The finance manager does not see other users' patients, because those are health records and finance does not need clinical detail.

## Reference: stretch features
**Realtime.** The patients and appointments tables are in the supabase_realtime publication, and a small client component calls router.refresh() on each change. The server then re-queries through the Row Level Security policies, so a user only ever receives their own rows.

**Storage.** One file per patient in the bucket patient-files: private (no public URL), 2 MB limit, JPG, PNG or PDF only. Files live under a folder named with the owner's user id, and four policies on storage.objects let a user read, upload, replace and delete only inside their own folder. The app checks type, size and the file's first bytes before uploading, shows the file through a signed link that expires after 60 seconds, and deletes the file when the patient is deleted. A text file renamed to .pdf was accepted in the first test, which is why the first-bytes check was added.

## Reference: chart honesty checklist (both charts)
- [x] The title states the question the chart answers
- [x] Both axes are labelled, with units (the donut: every slice labelled, plus a legend)
- [x] With no rows for the signed-in user, a sentence shows instead of an empty chart
- [x] One "so what" line under the chart names who acts and on what

## Reference: smoke test ( run on production as two users)
- [x] 1. Signed out, /dashboard redirects to login
- [x] 2. User one signs in and lands on /dashboard
- [x] 3. Patients: create, edit, delete; list updates
- [x] 4. Appointments: create (select shows only my patients), edit, delete
- [x] 5. Both charts render from real rows, question as title
- [x] 6. User two (private window) sees empty states, then none of user one's rows
- [x] 7. User two opening user one's edit URL gets not-found
- [x] 8. Empty create form shows messages, saves nothing
- [x] 9. Unknown URL (including /seed) shows the not-found page
- [x] 10. Sign out works; .env.local is not on GitHub
- [x] F. Finance manager sees Invoices and Customers and can edit invoices; user one is redirected away from them
- [x] R. Realtime: an insert in window A updates window B within a second
- [x] S. Storage: upload and signed link work; user two cannot open user one's file; the bucket is private
RLS: user B cannot see or edit user A's patients or appointments .

### Cut (one honest sentence each)
- Third entity (treatments): not built; both existing entities have full CRUD behind RLS and both charts are finished, and a half-built third table would add risk.
- Prevent double booking :built but not implemented. Haven't ran sql

### Polish (max 3, cosmetic or README-only)
1. Apply the Calm Teal colour scheme and add a screenshot of each chart to this README.
2. Fill in the real demo login wording.

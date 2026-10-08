## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

# This is additional features I add

# Family Clinic Dashboard

A dashboard for a small family practice, built with Next.js (App Router), Tailwind CSS and Supabase.
Signed-in users manage their own patients, and Row Level Security keeps each user's data private.
Built from the Next.js Learn dashboard course, then extended with Supabase Auth, RLS and charts.

**Live site:** https://week-29.vercel.app

## Tech stack
- Next.js (Server Components, Server Actions), Tailwind CSS
- Supabase (Auth and Postgres with Row Level Security)
- Zod for validation, Recharts for charts, pnpm

## Features
- Sign in and sign out with Supabase Auth; `/dashboard` redirects to `/login` when signed out
- Patients: list, create, edit, delete
- Chart one: new patients per month (last 6 months)
- Accessible form errors, `error.tsx` and `not-found.tsx`
- Row Level Security: each user only sees their own rows

## Run it locally
1. `pnpm install` (run `pnpm approve-builds` if pnpm reports ignored build scripts)
2. Create `.env` in the project root:

   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key

   Never commit `.env`.
3. Run the SQL in `supabase/` in the Supabase SQL Editor (`patients.sql`, then `patients_per_month.sql`)
4. `pnpm dev`, then open http://localhost:3000

See `PROPOSAL.md` for the entities and charts.

## Known gaps
See section 7 of `PROPOSAL.md`: double booking, cascade delete, time zone.

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
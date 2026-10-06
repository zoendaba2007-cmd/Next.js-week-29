## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

# This is additional features I add

# Acme Dashboard

An invoicing dashboard built with Next.js (App Router), Tailwind CSS and Supabase. Signed-in users manage their own clients and invoices, and Row Level Security keeps each user's data private.

Built from the Next.js Learn dashboard course, then extended with Supabase Auth, RLS and charts.

**Live site:** _add your Vercel URL here_

## Tech stack

- Next.js (App Router, Server Components, Server Actions)
- Tailwind CSS
- Supabase (Auth and Postgres with Row Level Security)
- Zod for form validation
- pnpm

## Features

- Sign in and sign out with Supabase Auth
- `/dashboard` redirects to `/login` when signed out
- Clients: list, create, edit, delete
- Client invoices: list, create, edit, delete
- Form validation with accessible error messages
- Error handling with `error.tsx` and `not-found.tsx`
- Row Level Security: each user only sees their own rows

## Run it locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

   If pnpm reports ignored build scripts, run `pnpm approve-builds` and approve the listed packages.

2. Create a `.env` file in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```

   Never commit `.env`. It is listed in `.gitignore`.

3. Create the tables by running the SQL in the `supabase/` folder in the Supabase SQL Editor.

4. Start the dev server:

   ```bash
   pnpm dev
   ```

5. Open http://localhost:3000.

## Database

The SQL for each table, including its RLS policies, is in the `supabase/` folder. See `PROPOSAL.md` for the entities and charts.

## Notes

_If you swapped the order of your charts, say so here._
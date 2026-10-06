# Proposal

## Project

Acme Dashboard is an invoicing dashboard for a small business owner. It lets a signed-in user manage their own clients and invoices and see how the business is doing in charts. It is built on the Next.js Learn dashboard course project, extended with Supabase Auth and Row Level Security so every user only ever sees their own data.

## Entities

### 1. clients (entity one, parent)

The people or companies the user invoices. Invoices point at a client.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key, `gen_random_uuid()` |
| user_id | uuid | owner, defaults to `auth.uid()` |
| full_name | text | required |
| email | text | optional |
| company_name | text | optional |
| created_at | timestamptz | defaults to `now()` |

### 2. client_invoices (entity two, child)

Invoices issued to a client.

| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | owner, defaults to `auth.uid()` |
| client_id | uuid | foreign key to `clients.id` |
| amount | integer | stored in cents |
| status | text | `pending` or `paid` |
| date | date | invoice date |
| created_at | timestamptz | defaults to `now()` |

## Access rules (Row Level Security)

Both tables have RLS enabled with four policies each (select, insert, update, delete). A signed-in user can only read and change rows where `user_id` equals their own `auth.uid()`.

## Charts

1. **Chart one: "How many clients did I add each month?"** Uses the `clients` table only (`created_at`), so it needs no join.
2. **Chart two: "How much is paid versus pending?"** Uses the `client_invoices` table (`status`, `amount`).

## Pages

- `/login`: sign in with Supabase Auth
- `/dashboard`: overview with charts
- `/dashboard/clients`: list, create, edit, delete
- `/dashboard/client-invoices`: list, create, edit, delete

## Note

The Learn course tables (`customers`, `invoices`) stay in the database untouched. The capstone tables use the names `clients` and `client_invoices` to avoid clashing with them.

## Chart one plan

**Question:** How many clients did I add each month?

**Why it matters:** It shows whether the business is growing its client base over time, so the owner can see busy and slow months at a glance.

**Data source:** the `clients` table only (entity one). No join is needed.
- Column used: `created_at`
- Each signed-in user sees only their own rows, because Row Level Security filters `clients` by `user_id`.

**Query (view):** `public.clients_per_month`

    select
      date_trunc('month', created_at)::date as month,
      count(*)::int as clients
    from public.clients
    group by 1
    order by 1;

The view is created with `security_invoker = true`, so the RLS policies on `clients` still apply and one user can never see another user's counts.

**Chart type:** Bar chart.
- X axis: month (for example "Aug 26")
- Y axis: number of clients added (whole numbers)
- Reason: bars suit comparing counts across separate categories such as months.

**Library:** Recharts (`pnpm add recharts`).
- Reason: it is built for React, works in a Client Component, and `ResponsiveContainer` makes the chart fit mobile and desktop.

**Where it appears:** the `/dashboard` page, loaded by a Server Component through `fetchClientsPerMonth()` and drawn by the `ClientsChart` Client Component.

**Edge cases:**
- No clients yet: the chart shows the message "No clients yet."
- Months with no new clients do not appear as bars.

**Proof it works:**
1. User one signs in and sees bars for their own months only.
2. User two signs in and sees a different chart.
3. The live site at https://week-29.vercel.app shows the same result.

**Build steps:**
1. Spread the sample `created_at` dates across several months.
2. Create the `clients_per_month` view and test it as two users in SQL.
3. Add `fetchClientsPerMonth()` to `app/lib/data.ts`.
4. Build `app/ui/dashboard/clients-chart.tsx` with Recharts.
5. Render the chart on `/dashboard`.
6. Commit, push, and test on the live site.

**Order of charts:** chart one uses `clients` only, so no swap was needed.
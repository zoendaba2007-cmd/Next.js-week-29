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
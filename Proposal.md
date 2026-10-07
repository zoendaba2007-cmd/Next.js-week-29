# Family Clinic Dashboard

**Deployed base**: https://week-29.vercel.app
**Repo**: https://github.com/<you>/<repo>
**Student**: <your name>

## 1. Domain
A small family practice with one owner and two front-desk staff.
The owner uses the dashboard every Monday to decide whether the
practice needs more consulting days and how to cut missed appointments.

## 2. Entities (exactly three)
| Entity | Replaces | Fields (name: type) |
|---|---|---|
| patients | customers | id: uuid, user_id: uuid, full_name: text, phone: text, date_of_birth: date, created_at: timestamp |
| appointments | invoices | id: uuid, user_id: uuid, patient_id: uuid (fk to patients), starts_at: timestamp, status: enum(booked, done, no_show), created_at: timestamp |
| treatments | revenue | id: uuid, user_id: uuid, appointment_id: uuid (fk to appointments), procedure: text, fee_cents: integer, created_at: timestamp |

The Learn tables (`customers`, `invoices`, `revenue`) stay in the database untouched.

## 3. Charts (exactly two)
| # | Question it answers | Who acts on the answer | Chart type | Data it needs |
|---|---|---|---|---|
| 1 | Is the practice growing? How many new patients joined each month? | owner decides whether to open a second consulting day | bar, one bar per month | count of patients by month of created_at, last 6 months |
| 2 | What share of this month's appointments are no-shows? | owner decides whether to send reminder messages | donut | appointments this month joined to patients, counted by status |

## 4. Roles
| Role | Can see | Can change |
|---|---|---|
| owner | everything | everything |
| front desk | patients and appointments | create and edit patients and appointments; no deletes, no treatments |

## 5. Stretch
A "tomorrow" page listing booked appointments with each patient's phone number.

## 6. Out of scope
Online booking by patients, sending messages, medical aid claims,
more than one practice, a mobile app.


## Chart one plan

**Question:** Is the practice growing? How many new patients joined each month?

**Who acts on it:** the owner decides whether to open a second consulting day.

**Data source:** the `patients` table only (entity one). No join.
- Column used: `created_at`
- Each signed-in user sees only their own rows, because RLS filters `patients` by `user_id`.

**Query (view):** `public.patients_per_month`, created with `security_invoker = true` so the RLS
policies on `patients` still apply. It returns the last six months, with 0 for quiet months
(columns: `month_start`, `label`, `new_patients`).

**Chart type:** bar chart. One bar per month, so counts can be compared across months.
- X axis: month ("Mon YYYY"), labelled "Month"
- Y axis: new patients (count), starting at zero, whole numbers

**Library:** Recharts (`pnpm add recharts react-is`). It is built for React, runs in a Client
Component, and `ResponsiveContainer` fits mobile and desktop.

**Where it appears:** `/dashboard`, fetched by the `PatientsPerMonth` Server Component through the
Supabase server client, and drawn by the `PatientsPerMonthChart` Client Component.

**Honesty checklist:** title states the question; both axes labelled with units; bars start at zero;
an empty state when there are no rows; one "so what" line naming who acts.

**Empty state:** if the six-month total is 0, the page shows "No patients in the last six months yet."

**Proof it works:**
1. User one signs in and sees bars for their own patients only.
2. User two signs in and sees a different chart.
3. https://week-29.vercel.app shows the same.

**Order of charts:** chart one needs only `patients`, so no swap was needed.

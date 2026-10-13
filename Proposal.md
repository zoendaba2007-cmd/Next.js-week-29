# Medic Clinic Dashboard

**Deployed base**: https://week-29.vercel.app
**Repo**: https://github.com/zoendaba2007-cmd/Next.js-week-29
**Student**: Zoe

## 1. Domain
A small family practice with one owner and two front-desk staff.
The owner uses the dashboard every Monday to decide whether the
practice needs more consulting days and how to cut missed appointments.

## 2. Entities (exactly three)
| Entity | Replaces | Fields (name: type) |
|---|---|---|
| patients | customers | id: uuid, user_id: uuid, full_name: text, phone: text, date_of_birth: date, created_at: timestamp |
| appointments | invoices | id: uuid, user_id: uuid, patient_id: uuid (fk to patients, on delete cascade), starts_at: timestamp, status: enum(booked, done, no_show), created_at: timestamp |
| treatments | revenue | id: uuid, user_id: uuid, appointment_id: uuid (fk to appointments), procedure: text, fee_cents: integer, created_at: timestamp |

The Learn tables (`customers`, `invoices`, `revenue`) stay in the database untouched.

## 3. Charts (exactly two)
| # | Question it answers | Who acts on the answer | Chart type | Data it needs |
|---|---|---|---|---|
| 1 | Is the practice growing? How many new patients joined each month? | owner decides whether to open a second consulting day | bar, one bar per month | count of patients by month of created_at, last 6 months |
| 2 | What share of this month's appointments are no-shows? | owner decides whether to send reminder messages | donut | appointments this month, counted by status |

## 4. Roles
| Role | Can see | Can change |
|---|---|---|
| practice user (default) | own patients, own appointments, own patient files, both charts | create, edit and delete own patients and appointments |
| finance manager | the same as a practice user, plus the Invoices and Customers pages and the revenue cards | the same as a practice user, plus create, edit and delete invoices |

The finance manager does not see other users' patients or appointments: those are health records and finance does not need them.

## 5. Known gaps
- **Double booking:** two people can book the same time slot at the same moment, and both succeed. The app
  assumes one calendar owner. A fix would be an exclusion constraint on overlapping time ranges, so the
  database refuses the second booking, with a clear message to the person who lost. Not built this week.
- **Cascade delete:** deleting a patient also deletes their appointments (`on delete cascade`). A real
  practice would keep medical records, so it would drop the cascade and block the delete instead.
- **Time zone:** times are entered as South African time (+02:00, no daylight saving).

## 6. What changed since I wrote this
- **Third entity cut.** Treatments was not built. Two entities with full create, edit and delete behind Row Level Security, and two charts, were finished instead.
- **Chart two reads appointments only.** The donut counts this month's appointments by status, without a join to patients, because the question does not need one.
- **Finance manager added.** A role that also sees the course's Invoices and Customers pages. The front-desk role in the original idea was not built and is the first thing on the next-steps list.
- **Realtime and Storage added** as extras: lists and charts update live, and each patient can have one private file (JPG, PNG or PDF, up to 2 MB).
- **Renamed** from "Family Clinic Dashboard" to "Medic Clinic Dashboard".
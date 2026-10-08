## Chart two plan

**Question:** What share of this month's appointments are no-shows?
**Who acts on it:** the owner decides whether to send reminder messages.

**Data source:** the `appointments` table (entity two). Because the view is created with
`security_invoker = true`, the select policy on `appointments` still applies, so each user only counts their own rows.

**View:** `public.appointments_by_status` returns one row per status (booked, done, no_show) with a count for
the current month in South African time, and a 0 for statuses with no rows.

**Chart type:** donut. It shows parts of a whole (the three statuses add up to this month's appointments),
a different shape from chart one's bar chart over time.

**Library:** Recharts `PieChart` with `innerRadius`. Colour is never the only signal: the legend carries the
status name and count, and a sentence under the chart states "X of Y appointments were no-shows (Z%)".

**Empty state:** "No appointments this month yet."

## W30.3 checklist
- [ ] Table, grants, four policies, two indexes (`appointments.sql`)
- [ ] Create works in the app; update and delete work
- [ ] User two sees none of user one's rows; the trap insert gives 42501 (`appointments_seed_and_test.sql`, test 4)
- [ ] Chart two titled with the question, labelled, deployed, a different shape from chart one, reading appointments
- [ ] Known gaps written in PROPOSAL.md

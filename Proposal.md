# Acme Invoicing Dashboard

**Deployed base**: https://week-29.vercel.app
**Repo**: https://github.com/<you>/<repo>
**Student**: <your name>

## 1. Domain
A small business with one owner and one part-time bookkeeper that invoices its clients.
The owner opens the dashboard every Monday to decide whether to spend time and money
finding new clients, and which late payments to chase first.

## 2. Entities (exactly three)
| Entity | Replaces | Fields (name: type) |
|---|---|---|
| clients | customers | id: uuid, user_id: uuid, full_name: text, email: text, company_name: text, created_at: timestamp |
| client_invoices | invoices | id: uuid, user_id: uuid, client_id: uuid (fk to clients), amount_cents: integer, status: enum(pending, paid, overdue), due_on: date, created_at: timestamp |
| payments | revenue | id: uuid, user_id: uuid, invoice_id: uuid (fk to client_invoices), amount_cents: integer, paid_on: date, created_at: timestamp |

The Learn tables (`customers`, `invoices`, `revenue`) stay in the database untouched. The capstone
tables use different names so they never clash with them.

## 3. Charts (exactly two)
| # | Question it answers | Who acts on the answer | Chart type | Data it needs |
|---|---|---|---|---|
| 1 | Is the client base growing? How many new clients joined each month? | owner decides whether to spend on finding new clients | bar, one bar per month | count of clients by month of created_at, last 6 months |
| 2 | What share of this month's invoices are paid, pending or overdue? | owner decides which late payments to chase on Monday | donut | client_invoices this month joined to clients, counted by status |

## 4. Roles
| Role | Can see | Can change |
|---|---|---|
| owner | everything | everything |
| bookkeeper | clients, invoices and payments | create and edit clients, invoices and payments; no deletes |

## 5. Stretch
A "chase list" page showing overdue invoices with each client's email.

## 6. Out of scope
Sending invoices by email, online card payments, tax reports, more than one business, a mobile app.
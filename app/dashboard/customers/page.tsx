import { requireFinanceManager } from '@/app/lib/auth';

await requireFinanceManager();

export default function Page() {
  return <p>Customers Page</p>;
}
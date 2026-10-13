import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';
import { requireFinanceManager } from '@/app/lib/auth';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  await requireFinanceManager();

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const customers = await fetchFilteredCustomers(query);

  return (
    <main>
      <CustomersTable customers={customers} />
    </main>
  );
}
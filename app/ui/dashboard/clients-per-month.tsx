import { fetchClientsPerMonth } from '@/app/lib/charts';
import ClientsPerMonthChart from '@/app/ui/dashboard/clients-per-month-chart';

export default async function ClientsPerMonth() {
  const rows = await fetchClientsPerMonth();
  const total = rows.reduce((sum, r) => sum + r.new_clients, 0);
  return (
    <div className="w-full md:col-span-4">
      <h2 className="mb-4 text-xl md:text-2xl">
        Is the client base growing? New clients per month
      </h2>
      {total === 0 ? (
        <p className="text-gray-400">No clients in the last six months yet.</p>
      ) : (
        <ClientsPerMonthChart rows={rows} />
      )}
      <p className="mt-2 text-sm text-gray-600">
        So what: if the last three bars fall, the owner spends time finding new clients.
      </p>
    </div>
  );
}
import { fetchClients } from '@/app/lib/data';
import { CreateClient } from '@/app/ui/clients/buttons';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const clients = await fetchClients();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Clients</h1>
        <CreateClient />
      </div>

      {clients.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No clients yet. Add the first one.
        </p>
      ) : (
        <table className="mt-6 min-w-full text-gray-900">
          <thead className="text-left text-sm font-normal">
            <tr>
              <th className="px-4 py-3 font-medium">Full name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Company</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {clients.map((c) => (
              <tr key={c.id} className="border-b text-sm">
                <td className="whitespace-nowrap px-4 py-3">{c.full_name}</td>
                <td className="whitespace-nowrap px-3 py-3">{c.email ?? ''}</td>
                <td className="whitespace-nowrap px-3 py-3">{c.company_name ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
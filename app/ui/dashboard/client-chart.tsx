'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ClientsPerMonth } from '@/app/lib/data';

export default function ClientsChart({ data }: { data: ClientsPerMonth[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-gray-400">No clients yet.</p>;
  }

  const rows = data.map((d) => ({
    ...d,
    label: new Date(d.month).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
  }));

  return (
    <div className="w-full md:col-span-4">
      <h2 className="mb-4 text-xl md:text-2xl">Clients added per month</h2>
      <div className="h-72 rounded-xl bg-gray-50 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="clients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { ClientsPerMonthRow } from '@/app/lib/charts';

export default function ClientsPerMonthChart({ rows }: { rows: ClientsPerMonthRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
        <XAxis dataKey="label" label={{ value: 'Month', position: 'insideBottom', offset: -12 }} />
        <YAxis
          domain={[0, 'auto']}
          allowDecimals={false}
          label={{ value: 'New clients (count)', angle: -90, position: 'insideLeft' }}
        />
        <Bar dataKey="new_clients" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
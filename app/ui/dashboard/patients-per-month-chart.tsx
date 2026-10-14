'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { PatientsPerMonthRow } from '@/app/lib/charts';

export default function PatientsPerMonthChart({ rows }: { rows: PatientsPerMonthRow[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 12 }}>
          <XAxis
            dataKey="label"
            interval={0}
            angle={-35}
            textAnchor="end"
            height={64}
            tickMargin={8}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 'auto']}
            allowDecimals={false}
            width={56}
            tick={{ fontSize: 12 }}
            label={{
              value: 'New patients',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              style: { textAnchor: 'middle' },
            }}
          />
          <Bar dataKey="new_patients" fill="#0F766E" />
        </BarChart>
      </ResponsiveContainer>
      <p className="-mt-1 text-center text-xs text-gray-600">Month</p>
    </div>
  );
}

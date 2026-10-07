'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { AppointmentsByStatusRow } from '@/app/lib/charts';

// Colour is never the only signal: the legend and tooltip also carry the label and the count.
const COLORS: Record<AppointmentsByStatusRow['status'], string> = {
  booked: '#3b82f6',
  done: '#16a34a',
  no_show: '#dc2626',
};

export default function AppointmentsByStatusChart({ rows }: { rows: AppointmentsByStatusRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="appointments"
          nameKey="label"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {rows.map((r) => (
            <Cell key={r.status} fill={COLORS[r.status]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          formatter={(value, entry) => {
            const payload = entry.payload as unknown as AppointmentsByStatusRow;
            return `${value}: ${payload.appointments}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

'use client';

import { PieChart, Pie, Sector, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieSectorShapeProps, PieLabelRenderProps } from 'recharts';
import type { AppointmentsByStatusRow } from '@/app/lib/charts';

const DISPLAY: Record<string, string> = { booked: 'Booked', done: 'Done', no_show: 'No-show' };
// Colour is never the only carrier: every slice also has a text label and the legend repeats the name.
const COLOURS: Record<string, string> = { Booked: '#2563eb', Done: '#16a34a', 'No-show': '#dc2626' };

function Slice(props: PieSectorShapeProps) {
  return <Sector {...props} fill={COLOURS[String(props.name)] ?? '#9ca3af'} />;
}

function SliceLabel({ x, y, textAnchor, name, value, percent }: PieLabelRenderProps) {
  const pct = Math.round((percent ?? 0) * 100);
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontSize={12} fill="#111827">
      {String(name)}: {value} ({pct}%)
    </text>
  );
}

export default function AppointmentsByStatusChart({ rows }: { rows: AppointmentsByStatusRow[] }) {
  // The view returns a row for every status; zero slices only add label clutter, so draw non-zero ones
  const data = rows
    .filter((r) => r.appointments > 0)
    .map((r) => ({ name: DISPLAY[r.status] ?? r.status, value: r.appointments }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          shape={Slice}
          label={SliceLabel}
          labelLine
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

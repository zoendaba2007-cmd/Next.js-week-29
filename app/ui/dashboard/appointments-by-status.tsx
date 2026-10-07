import { fetchAppointmentsByStatus } from '@/app/lib/charts';
import AppointmentsByStatusChart from '@/app/ui/dashboard/appointments-by-status-chart';

export default async function AppointmentsByStatus() {
  const rows = await fetchAppointmentsByStatus();
  const total = rows.reduce((sum, r) => sum + r.appointments, 0);
  const noShows = rows.find((r) => r.status === 'no_show')?.appointments ?? 0;
  const pct = total === 0 ? 0 : Math.round((noShows / total) * 100);

  return (
    <div className="w-full md:col-span-4">
      <h2 className="mb-4 text-xl md:text-2xl">
        What share of this month&apos;s appointments are no-shows?
      </h2>
      {total === 0 ? (
        <p className="text-gray-400">No appointments this month yet.</p>
      ) : (
        <>
          <AppointmentsByStatusChart rows={rows} />
          <p className="mt-2 text-sm text-gray-700">
            {noShows} of {total} appointments this month were no-shows ({pct}%).
          </p>
        </>
      )}
      <p className="mt-2 text-sm text-gray-600">
        So what: if no-shows stay high, the owner starts sending reminder messages.
      </p>
    </div>
  );
}

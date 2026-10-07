import { fetchAppointments } from '@/app/lib/data';
import { formatAppointment } from '@/app/lib/datetime';
import {
  CreateAppointment,
  UpdateAppointment,
  DeleteAppointment,
} from '@/app/ui/appointments/buttons';
import { lusitana } from '@/app/ui/fonts';

const STATUS_LABEL = { booked: 'Booked', done: 'Done', no_show: 'No show' } as const;

export default async function Page() {
  const appointments = await fetchAppointments();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Appointments</h1>
        <CreateAppointment />
      </div>

      {appointments.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No appointments yet. Add the first one.</p>
      ) : (
        <table className="mt-6 min-w-full text-gray-900">
          <thead className="text-left text-sm font-normal">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-3 py-3 font-medium">When</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="py-3 pl-6 pr-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {appointments.map((a) => (
              <tr key={a.id} className="border-b text-sm">
                <td className="whitespace-nowrap px-4 py-3">{a.patients?.full_name ?? 'Unknown patient'}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatAppointment(a.starts_at)}</td>
                <td className="whitespace-nowrap px-3 py-3">{STATUS_LABEL[a.status]}</td>
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex justify-end gap-3">
                    <UpdateAppointment id={a.id} />
                    <DeleteAppointment id={a.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

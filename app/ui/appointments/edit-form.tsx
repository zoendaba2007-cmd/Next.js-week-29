'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { updateAppointment, type AppointmentState } from '@/app/lib/actions';
import { toDateTimeLocal } from '@/app/lib/datetime';
import type { Appointment } from '@/app/lib/data';

export default function EditAppointmentForm({
  appointment,
  patients,
}: {
  appointment: Appointment;
  patients: { id: string; full_name: string }[];
}) {
  const initialState: AppointmentState = { message: null, errors: {} };
  const updateWithId = updateAppointment.bind(null, appointment.id);
  const [state, formAction] = useActionState(updateWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="patient_id" className="mb-2 block text-sm font-medium">Patient</label>
          <select
            id="patient_id"
            name="patient_id"
            defaultValue={appointment.patient_id}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="patient_id-error"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <div id="patient_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.patient_id?.map((e) => (
              <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="starts_at" className="mb-2 block text-sm font-medium">Date and time</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toDateTimeLocal(appointment.starts_at)}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="starts_at-error"
          />
          <div id="starts_at-error" aria-live="polite" aria-atomic="true">
            {state.errors?.starts_at?.map((e) => (
              <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={appointment.status}
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="status-error"
          >
            <option value="booked">Booked</option>
            <option value="done">Done</option>
            <option value="no_show">No show</option>
          </select>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status?.map((e) => (
              <p className="mt-2 text-sm text-red-500" key={e}>{e}</p>
            ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/appointments"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

import Link from 'next/link';
import { fetchPatientOptions } from '@/app/lib/data';
import CreateAppointmentForm from '@/app/ui/appointments/create-form';

export default async function Page() {
  const patients = await fetchPatientOptions();

  return (
    <main>
      <h1 className="mb-6 text-2xl">Add appointment</h1>
      {patients.length === 0 ? (
        <p className="text-sm text-gray-600">
          You need a patient first.{' '}
          <Link href="/dashboard/patients/create" className="text-blue-600 underline">
            Add a patient
          </Link>
          .
        </p>
      ) : (
        <CreateAppointmentForm patients={patients} />
      )}
    </main>
  );
}

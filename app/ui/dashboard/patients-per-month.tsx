import { fetchPatientsPerMonth } from '@/app/lib/charts';
import PatientsPerMonthChart from '@/app/ui/dashboard/patients-per-month-chart';

export default async function PatientsPerMonth() {
  const rows = await fetchPatientsPerMonth();
  const total = rows.reduce((sum, r) => sum + r.new_patients, 0);
  return (
    <div className="w-full md:col-span-4">
      <h2 className="mb-4 text-xl md:text-2xl">
        Is the practice growing? New patients per month
      </h2>
      {total === 0 ? (
        <p className="text-gray-400">No patients in the last six months yet.</p>
      ) : (
        <PatientsPerMonthChart rows={rows} />
      )}
      <p className="mt-2 text-sm text-gray-600">
        So what: if the last three bars fall, the owner holds off on opening a second consulting day.
      </p>
    </div>
  );
}
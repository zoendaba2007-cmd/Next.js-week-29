import { createClient } from '@/lib/supabase/server';

export interface PatientsPerMonthRow {
  label: string;
  new_patients: number;
}

export async function fetchPatientsPerMonth(): Promise<PatientsPerMonthRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients_per_month')
    .select('label, new_patients')
    .order('month_start', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PatientsPerMonthRow[];
}

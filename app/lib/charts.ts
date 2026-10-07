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

export interface AppointmentsByStatusRow {
  status: 'booked' | 'done' | 'no_show';
  label: string;
  appointments: number;
}

export async function fetchAppointmentsByStatus(): Promise<AppointmentsByStatusRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments_by_status')
    .select('status, label, appointments');
  if (error) throw new Error(error.message);
  return (data ?? []) as AppointmentsByStatusRow[];
}

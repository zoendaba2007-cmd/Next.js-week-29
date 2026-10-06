import { createClient } from '@/lib/supabase/server';

export interface ClientsPerMonthRow {
  label: string;
  new_clients: number;
}

export async function fetchClientsPerMonth(): Promise<ClientsPerMonthRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients_per_month')
    .select('label, new_clients')
    .order('month_start', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ClientsPerMonthRow[];
}
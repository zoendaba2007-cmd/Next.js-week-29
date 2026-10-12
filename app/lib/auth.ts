import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'finance_manager' | 'practice';

export const getRole = cache(async (): Promise<Role> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  return data?.role === 'finance_manager' ? 'finance_manager' : 'practice';
});

export async function requireFinanceManager() {
  if ((await getRole()) !== 'finance_manager') redirect('/dashboard');
}
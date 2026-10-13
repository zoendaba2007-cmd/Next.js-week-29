import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'finance_manager' | 'practice';

// cache(): one lookup per request, however many components ask
export const getRole = cache(async (): Promise<Role> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Supabase role lookup failed:', error);
    throw new Error('Failed to determine the signed-in user role.', {
      cause: error,
    });
  }

  return data?.role === 'finance_manager' ? 'finance_manager' : 'practice';
});

// Use as the FIRST line of a page and of every Server Action that touches invoices or customers.
export async function requireFinanceManager() {
  if ((await getRole()) !== 'finance_manager') redirect('/dashboard');
}
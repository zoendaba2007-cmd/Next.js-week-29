import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Role = 'finance_manager' | 'practice';

const ALLOWED_FINANCE_USER_IDS = new Set(
  [process.env.FINANCE_MANAGER_USER_ID, process.env.USER_ONE_ID].filter(
    (id): id is string => Boolean(id),
  ),
);

function isAllowedFinanceUser(userId: string) {
  return ALLOWED_FINANCE_USER_IDS.has(userId);
}

export const getRole = cache(async (): Promise<Role> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle();

  const hasFinanceRole = data?.role === 'finance_manager';
  const isExplicitFinanceUser = isAllowedFinanceUser(user.id);

  return hasFinanceRole || isExplicitFinanceUser ? 'finance_manager' : 'practice';
});

export async function requireFinanceManager() {
  if ((await getRole()) !== 'finance_manager') redirect('/dashboard');
}
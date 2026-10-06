'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { createClient } from '@/lib/supabase/server';
 
const sql = postgres(process.env.POSTGRES_URL!, { 
  ssl: 'require', 
  prepare: false,
  max: 1,
});
 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
 
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error(error);
    throw new Error('Database Error: Failed to Delete Invoice.', {
      cause: error,
    });
  }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) return 'Invalid credentials.';
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

const ClientSchema = z.object({
  full_name: z.string().min(1, { message: "Please enter the client's full name." }),
  email: z.string().optional(),
  company_name: z.string().optional(),
});

export type ClientState = {
  errors?: {
    full_name?: string[];
    email?: string[];
    company_name?: string[];
  };
  message?: string | null;
};

export async function createClientRecord(
  prevState: ClientState,
  formData: FormData,
): Promise<ClientState> {
  const validated = ClientSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    company_name: formData.get('company_name'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create client.',
    };
  }
  const { full_name, email, company_name } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from('clients').insert({
    full_name,
    email: email || null,
    company_name: company_name || null,
    // user_id is not sent: the column default auth.uid() fills it
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Database error ${error.code}: failed to create client.` };
  }

  revalidatePath('/dashboard/clients');
  redirect('/dashboard/clients');
}

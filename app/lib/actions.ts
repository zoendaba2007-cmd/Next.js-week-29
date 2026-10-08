'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { createClient } from '@/lib/supabase/server';
import { fromDateTimeLocal } from '@/app/lib/datetime';
 
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
  if (error) {
    console.error('Login error:', error.message, error.status);
    return 'Invalid credentials.';
  }
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

const PatientSchema = z.object({
  full_name: z.string().min(1, { message: "Please enter the patient's full name." }),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

export type PatientState = {
  errors?: {
    full_name?: string[];
    phone?: string[];
    date_of_birth?: string[];
  };
  message?: string | null;
};

export async function createPatient(
  prevState: PatientState,
  formData: FormData,
): Promise<PatientState> {
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from('patients').insert({
    full_name,
    phone: phone || null,
    date_of_birth: date_of_birth || null,
    // user_id is not sent: the column default auth.uid() fills it
  });
  if (error) {
    console.error('Supabase error:', error);
    return { message: `Database error ${error.code}: failed to create patient.` };
  }

  revalidatePath('/dashboard/patients');
  revalidatePath('/dashboard');
  redirect('/dashboard/patients');
}

export async function updatePatient(
  id: string,
  prevState: PatientState,
  formData: FormData,
): Promise<PatientState> {
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from('patients')
    .update({ full_name, phone: phone || null, date_of_birth: date_of_birth || null })
    .eq('id', id);
  if (error) {
    console.error('Supabase error:', error);
    return { message: `Database error ${error.code}: failed to update patient.` };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}

export async function deletePatient(id: string) {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from('patients')
    .select('file_path')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Database error ${error.code}: failed to delete patient.`);
  }

  if (patient?.file_path) {
    await supabase.storage.from('patient-files').remove([patient.file_path]);
  }

  revalidatePath('/dashboard/patients');
  revalidatePath('/dashboard');
}


const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

export type UploadState = { message?: string | null };

// A browser decides the type from the file NAME, so also check the first bytes of the file itself.
function matchesSignature(type: string, bytes: Uint8Array): boolean {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (type === 'application/pdf') return starts([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
  if (type === 'image/png') return starts([0x89, 0x50, 0x4e, 0x47]);
  if (type === 'image/jpeg') return starts([0xff, 0xd8, 0xff]);
  return false;
}

export async function uploadPatientFile(
  id: string,
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { message: 'Please choose a file.' };
  }
  if (!(file.type in ALLOWED_TYPES)) {
    return { message: 'Only JPG, PNG or PDF files are allowed.' };
  }
  if (file.size > MAX_BYTES) {
    return { message: 'The file is larger than 2 MB.' };
  }

  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!matchesSignature(file.type, head)) {
    return { message: 'The file content does not match its type.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const path = `${user.id}/${id}/${crypto.randomUUID()}.${ALLOWED_TYPES[file.type]}`;

  const { error } = await supabase.storage
    .from('patient-files')
    .upload(path, file, { contentType: file.type });
  if (error) {
    console.error('Storage error:', error);
    return { message: 'Upload failed.' };
  }

  const { error: dbError } = await supabase
    .from('patients')
    .update({ file_path: path })
    .eq('id', id);
  if (dbError) {
    await supabase.storage.from('patient-files').remove([path]); // avoid an orphan file
    return { message: 'Could not save the file to the patient.' };
  }

  revalidatePath(`/dashboard/patients/${id}/edit`);
  return { message: 'File uploaded.' };
}

const AppointmentFields = z.object({
  patient_id: z.string().min(1, { message: 'Please select a patient.' }),
  starts_at: z.string().min(16, { message: 'Please choose a date and time.' }),
});
const CreateAppointmentSchema = AppointmentFields;
const UpdateAppointmentSchema = AppointmentFields.extend({
  status: z.enum(['booked', 'done', 'no_show'], { message: 'Please choose a status.' }),
});

export type AppointmentState = {
  errors?: {
    patient_id?: string[];
    starts_at?: string[];
    status?: string[];
  };
  message?: string | null;
};

// 23503 = foreign_key_violation (the patient id exists nowhere)
// 42501 = row-level security refused it (not your patient, or user_id sent by hand)
function appointmentDbMessage(code: string | undefined, verb: string): string {
  if (code === '23503') return 'That patient does not exist.';
  if (code === '42501') return 'Not allowed: that patient is not yours.';
  return `Database error ${code}: failed to ${verb} appointment.`;
}

export async function createAppointment(
  prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const validated = CreateAppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create appointment.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('appointments').insert({
    patient_id: validated.data.patient_id,
    starts_at: fromDateTimeLocal(validated.data.starts_at),
    // user_id is NOT sent: the column default auth.uid() fills it
  });
  if (error) {
    console.error('Supabase error:', error);
    return { message: appointmentDbMessage(error.code, 'create') };
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');
  redirect('/dashboard/appointments');
}

export async function updateAppointment(
  id: string,
  prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const validated = UpdateAppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    starts_at: formData.get('starts_at'),
    status: formData.get('status'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update appointment.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('appointments')
    .update({
      patient_id: validated.data.patient_id,
      starts_at: fromDateTimeLocal(validated.data.starts_at),
      status: validated.data.status,
    })
    .eq('id', id);
  if (error) {
    console.error('Supabase error:', error);
    return { message: appointmentDbMessage(error.code, 'update') };
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');
  redirect('/dashboard/appointments');
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Database error ${error.code}: failed to delete appointment.`);
  }
  revalidatePath('/dashboard/appointments');
  revalidatePath('/dashboard');
}

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

// A browser decides the type from the file NAME, so also check the first bytes of the file itself.
function matchesSignature(type: string, bytes: Uint8Array): boolean {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (type === 'application/pdf') return starts([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
  if (type === 'image/png') return starts([0x89, 0x50, 0x4e, 0x47]);
  if (type === 'image/jpeg') return starts([0xff, 0xd8, 0xff]);
  return false;
}

export type UploadState = { message?: string | null };

export async function uploadPatientFile(
  id: string,
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { message: 'Please choose a file.' };
  }
  if (!(file.type in ALLOWED_TYPES)) {
    return { message: 'Only JPG, PNG or PDF files are allowed.' };
  }
  if (file.size > MAX_BYTES) {
    return { message: 'The file is larger than 2 MB.' };
  }
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!matchesSignature(file.type, head)) {
    return { message: 'The file content does not match its type.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // the patient must be visible to this user (RLS), and we need the old file to replace it
  const { data: patient } = await supabase
    .from('patients')
    .select('file_path')
    .eq('id', id)
    .maybeSingle();
  if (!patient) return { message: 'Patient not found.' };

  const path = `${user.id}/${id}/${crypto.randomUUID()}.${ALLOWED_TYPES[file.type]}`;

  const { error: uploadError } = await supabase.storage
    .from('patient-files')
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    console.error('Storage error:', uploadError);
    return { message: 'Upload failed.' };
  }

  const { error: dbError } = await supabase
    .from('patients')
    .update({ file_path: path })
    .eq('id', id);
  if (dbError) {
    await supabase.storage.from('patient-files').remove([path]); // no orphan file
    return { message: 'Could not save the file to the patient.' };
  }

  if (patient.file_path) {
    await supabase.storage.from('patient-files').remove([patient.file_path]); // one file per patient
  }

  revalidatePath(`/dashboard/patients/${id}/edit`);
  return { message: 'File uploaded.' };
}


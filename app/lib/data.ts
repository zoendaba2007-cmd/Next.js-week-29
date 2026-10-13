import { createClient } from '@/lib/supabase/server';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

     console.log('Fetching revenue data...');
     await new Promise((resolve) => setTimeout(resolve, 3000));

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('revenue')
      .select('month, revenue')
      .order('month', { ascending: true });
    if (error) throw error;

     console.log('Data fetch completed after 3 seconds.');

    return (data ?? []) as Revenue[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('amount, id, customers!inner(name, image_url, email)')
      .order('date', { ascending: false })
      .limit(5);
    if (error) throw error;

    const latestInvoices = (data ?? []).map((invoice) => {
      const customer = Array.isArray(invoice.customers)
        ? invoice.customers[0]
        : invoice.customers;
      if (!customer) {
        throw new Error(`Invoice ${invoice.id} has no related customer.`);
      }
      return {
        id: invoice.id,
        name: customer.name,
        image_url: customer.image_url,
        email: customer.email,
        amount: formatCurrency(invoice.amount),
      };
    });
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const supabase = await createClient();
    const [invoiceCount, customerCount, invoiceAmounts] = await Promise.all([
      supabase.from('invoices').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('amount, status'),
    ]);
    if (invoiceCount.error) throw invoiceCount.error;
    if (customerCount.error) throw customerCount.error;
    if (invoiceAmounts.error) throw invoiceAmounts.error;

    const totalPaid = (invoiceAmounts.data ?? [])
      .filter((invoice) => invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
    const totalPending = (invoiceAmounts.data ?? [])
      .filter((invoice) => invoice.status === 'pending')
      .reduce((total, invoice) => total + invoice.amount, 0);

    return {
      numberOfCustomers: customerCount.count ?? 0,
      numberOfInvoices: invoiceCount.count ?? 0,
      totalPaidInvoices: formatCurrency(totalPaid),
      totalPendingInvoices: formatCurrency(totalPending),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  try {
    const invoices = await getInvoiceRows();
    const filteredInvoices = filterInvoiceRows(invoices, query);
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredInvoices.slice(offset, offset + ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const invoices = await getInvoiceRows();
    const totalPages = Math.ceil(filterInvoiceRows(invoices, query).length / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('id, customer_id, amount, status')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;

    return {
      ...data,
      amount: data.amount / 100,
    } as InvoiceForm;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .order('name', { ascending: true });
    if (error) throw error;

    return (data ?? []) as CustomerField[];
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email, image_url, invoices(amount, status)')
      .order('name', { ascending: true });
    if (error) throw error;

    const normalizedQuery = query.toLocaleLowerCase();
    const customers = ((data ?? []) as unknown as (CustomersTableType & {
      invoices: { amount: number; status: 'paid' | 'pending' }[];
    })[])
      .filter((customer) =>
        `${customer.name} ${customer.email}`.toLocaleLowerCase().includes(normalizedQuery),
      )
      .map((customer) => {
        const pending = customer.invoices
          .filter((invoice) => invoice.status === 'pending')
          .reduce((total, invoice) => total + invoice.amount, 0);
        const paid = customer.invoices
          .filter((invoice) => invoice.status === 'paid')
          .reduce((total, invoice) => total + invoice.amount, 0);

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url,
          total_invoices: customer.invoices.length,
          total_pending: formatCurrency(pending),
          total_paid: formatCurrency(paid),
        };
      });

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

type InvoiceRowWithCustomer = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  customers: {
    name: string;
    email: string;
    image_url: string;
  } | null;
};

async function getInvoiceRows(): Promise<InvoicesTable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('id, customer_id, amount, date, status, customers!inner(name, email, image_url)')
    .order('date', { ascending: false });
  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch invoices.');
  }

  return ((data ?? []) as unknown as InvoiceRowWithCustomer[]).map((invoice) => {
    if (!invoice.customers) {
      throw new Error(`Invoice ${invoice.id} has no related customer.`);
    }
    return {
      id: invoice.id,
      customer_id: invoice.customer_id,
      amount: invoice.amount,
      date: invoice.date,
      status: invoice.status,
      name: invoice.customers.name,
      email: invoice.customers.email,
      image_url: invoice.customers.image_url,
    };
  });
}

function filterInvoiceRows(invoices: InvoicesTable[], query: string): InvoicesTable[] {
  const normalizedQuery = query.toLocaleLowerCase();
  return invoices.filter((invoice) =>
    [
      invoice.name,
      invoice.email,
      String(invoice.amount),
      invoice.date,
      invoice.status,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
}

export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
  file_path: string | null;
};

export async function fetchPatients(): Promise<Patient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at, file_path')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patients.');
  }
  return data as Patient[];
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at, file_path')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patient.');
  }
  return (data as Patient | null) ?? null;
}

export type AppointmentStatus = 'booked' | 'done' | 'no_show';

export type Appointment = {
  id: string;
  user_id: string;
  patient_id: string;
  starts_at: string;
  status: AppointmentStatus;
  created_at: string;
  patients: { full_name: string } | null; // joined through the foreign key; RLS on patients applies
};

// RLS returns only YOUR patients, so the dropdown can never list someone else's
export async function fetchPatientOptions(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name');
  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patients.');
  }
  return data ?? [];
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, user_id, patient_id, starts_at, status, created_at, patients(full_name)')
    .order('starts_at', { ascending: false });
  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch appointments.');
  }
  return (data ?? []) as unknown as Appointment[];
}

export async function fetchAppointmentById(id: string): Promise<Appointment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, user_id, patient_id, starts_at, status, created_at, patients(full_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch appointment.');
  }
  return (data as unknown as Appointment | null) ?? null;
}

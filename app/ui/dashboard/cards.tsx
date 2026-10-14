import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { fetchCardData } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

const styleMap = {
  collected: {
    accent: 'border-l-emerald-500',
    icon: 'bg-emerald-50 text-emerald-700',
  },
  pending: {
    accent: 'border-l-amber-500',
    icon: 'bg-amber-50 text-amber-700',
  },
  invoices: {
    accent: 'border-l-sky-600',
    icon: 'bg-sky-50 text-sky-700',
  },
  customers: {
    accent: 'border-l-rose-500',
    icon: 'bg-rose-50 text-rose-700',
  },
};

export default async function CardWrapper() {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <>
      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      /> 
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];
  const styles = styleMap[type];

  return (
    <div
      className={`rounded-xl border border-gray-100 border-l-4 ${styles.accent} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
        <span className={`rounded-lg p-2 ${styles.icon}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p
        className={`${lusitana.className} mt-3 break-words text-3xl font-semibold tracking-tight text-gray-900`}
      >
        {value}
      </p>
    </div>
  );
}

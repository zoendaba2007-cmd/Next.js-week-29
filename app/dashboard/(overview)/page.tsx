import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import PatientsPerMonth from '@/app/ui/dashboard/patients-per-month';
import AppointmentsByStatus from '@/app/ui/dashboard/appointments-by-status';
import RealtimeRefresh from '@/app/ui/realtime-refresh';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { getRole } from '@/app/lib/auth';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/app/ui/skeletons';

export default async function Page() {
  const finance = (await getRole()) === 'finance_manager';
  const role = await getRole();
  return (
    <main>
      <RealtimeRefresh table="patients" />
      <RealtimeRefresh table="appointments" />
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      {/* Finance manager only: the course's money cards, revenue and latest invoices */}
      {finance && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Suspense fallback={<CardsSkeleton />}>
              <CardWrapper />
            </Suspense>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
            <Suspense fallback={<RevenueChartSkeleton />}>
              <RevenueChart />
            </Suspense>
            <Suspense fallback={<LatestInvoicesSkeleton />}>
              <LatestInvoices />
            </Suspense>
          </div>
        </>
      )}

      {/* Everyone: the two practice charts, from their OWN patients and appointments */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <PatientsPerMonth />
        </Suspense>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <AppointmentsByStatus />
        </Suspense>
      </div>
    </main>
  );
}

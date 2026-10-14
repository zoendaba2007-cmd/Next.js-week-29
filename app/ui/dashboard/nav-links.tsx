'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  HeartIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { Role } from '@/app/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon, roles: ['practice', 'finance_manager'] },
  { name: 'Patients', href: '/dashboard/patients', icon: HeartIcon, roles: ['practice', 'finance_manager'] },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon, roles: ['practice', 'finance_manager'] },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDaysIcon, roles: ['practice', 'finance_manager'] },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentDuplicateIcon, roles: ['finance_manager'] },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon, roles: ['finance_manager'] },
];

export default function NavLinks({ role }: { role: Role }) {
  const pathname = usePathname();
  const visible = links.filter((l) => l.roles.includes(role));

  return (
    <>
      {visible.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium text-clinic-side hover:bg-white/10 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-white/20 font-bold': pathname === link.href },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

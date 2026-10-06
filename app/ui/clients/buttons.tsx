import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateClient() {
  return (
    <Link
      href="/dashboard/clients/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
    >
      <span className="hidden md:block">Add client</span>
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}
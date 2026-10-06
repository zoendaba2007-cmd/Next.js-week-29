'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { createClientRecord, type ClientState } from '@/app/lib/actions';

export default function Form() {
  const initialState: ClientState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createClientRecord, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="full_name" className="mb-2 block text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            aria-describedby="full_name-error"
          />
          <div id="full_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.full_name?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="company_name" className="mb-2 block text-sm font-medium">
            Company
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/clients"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Add client</Button>
      </div>
    </form>
  );
}
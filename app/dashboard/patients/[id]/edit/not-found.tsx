import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested patient.</p>
      <Link href="/dashboard/patients"
        className="mt-4 rounded-md bg-clinic-primary px-4 py-2 text-sm text-white hover:bg-clinic-dark">
        Go back
      </Link>
    </main>
  );
}
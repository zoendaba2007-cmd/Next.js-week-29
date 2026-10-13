import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-clinic-primary p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>Welcome to Medic Clinic.</strong> A simple dashboard for managing
            patients and appointments, and seeing how the practice is doing.
          </p>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-clinic-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-clinic-dark md:text-base"
          >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="relative min-h-[320px] w-full overflow-hidden rounded-lg md:min-h-[500px] md:w-3/5">
          <Image
            src="/clinic-hero.jpg"
            alt="Stethoscope representing the clinic"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
      </div>
    </main>
  );
}

import { HeartIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row items-center gap-2 leading-none text-white`}>
      <HeartIcon className="h-10 w-10" />
      <p className="text-[24px] leading-tight">
        Medic
        <br />
        Clinic
      </p>
    </div>
  );
}

import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { fetchPatients } from '@/app/lib/data';
import { createClient } from '@/lib/supabase/server';
import RealtimeRefresh from '@/app/ui/realtime-refresh';
import { lusitana } from '@/app/ui/fonts';

const SIGNED_URL_EXPIRY_SECONDS = 5 * 60;

export default async function DocumentsPage() {
  const patients = await fetchPatients();
  const patientsWithFiles = patients.filter((patient) => patient.file_path);
  const supabase = await createClient();

  const documents = await Promise.all(
    patientsWithFiles.map(async (patient) => {
      const filePath = patient.file_path;
      if (!filePath) {
        throw new Error(`Patient ${patient.id} has no document path.`);
      }

      const { data, error } = await supabase.storage
        .from('patient-files')
        .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

      if (error) {
        console.error('Could not create signed patient document URL:', error);
        throw new Error(`Could not create a secure link for ${patient.full_name}'s document.`, {
          cause: error,
        });
      }
      if (!data?.signedUrl) {
        throw new Error(`No secure link was returned for ${patient.full_name}'s document.`);
      }

      const extension = filePath.split('.').pop()?.toUpperCase();
      return {
        id: patient.id,
        name: patient.full_name,
        extension,
        url: data.signedUrl,
      };
    }),
  );

  return (
    <div className="w-full">
      <RealtimeRefresh table="patients" />
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Documents</h1>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Files uploaded to patient records. Secure viewing links expire after five minutes.
      </p>

      {documents.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-sm text-gray-600">
          No patient documents have been uploaded yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg bg-white">
          <table className="min-w-full text-left text-sm text-gray-900">
            <thead className="border-b text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Document</th>
                <th scope="col" className="px-4 py-3 font-medium">Patient</th>
                <th scope="col" className="px-4 py-3 font-medium">File type</th>
                <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-clinic-primary" />
                      <span>Patient document</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{document.name}</td>
                  <td className="whitespace-nowrap px-4 py-4">{document.extension ?? 'File'}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-clinic-primary underline hover:text-clinic-dark"
                    >
                      View document
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

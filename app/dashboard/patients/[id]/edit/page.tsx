import { notFound } from 'next/navigation';
import { fetchPatientById } from '@/app/lib/data';
import EditForm from '@/app/ui/patients/edit-form';
import UploadForm from '@/app/ui/patients/upload-form';
import { createClient } from '@/lib/supabase/server';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const patient = await fetchPatientById(id);

  if (!patient) {
    notFound();
  }

    let fileUrl: string | null = null;
    if (patient.file_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage
        .from('patient-files')
        .createSignedUrl(patient.file_path, 60);
    fileUrl = data?.signedUrl ?? null;
    }

  return (
    <main>
      <h1 className="mb-6 text-2xl">Edit patient</h1>
      <EditForm patient={patient} />
      {fileUrl && (
      <p className="mt-6 text-sm">
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
          View current file
          </a>{' '}
          (link expires in 60 seconds)
      </p>
      )}
    <UploadForm patientId={patient.id} />
    </main>
  );
}

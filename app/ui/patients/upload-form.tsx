'use client';

import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { uploadPatientFile, type UploadState } from '@/app/lib/actions';

export default function UploadForm({ patientId }: { patientId: string }) {
  const initialState: UploadState = { message: null };
  const action = uploadPatientFile.bind(null, patientId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 rounded-md bg-gray-50 p-4 md:p-6">
      <label htmlFor="file" className="mb-2 block text-sm font-medium">
        Patient file (JPG, PNG or PDF, max 2 MB)
      </label>
      <input
        id="file"
        name="file"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="block w-full text-sm"
      />
      <div aria-live="polite" aria-atomic="true">
        {state.message && <p className="mt-2 text-sm text-gray-700">{state.message}</p>}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit">Upload</Button>
      </div>
    </form>
  );
}
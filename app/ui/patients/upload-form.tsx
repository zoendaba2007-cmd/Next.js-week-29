'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/app/ui/button';
import { uploadPatientFile, type UploadState } from '@/app/lib/actions';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf'];

export default function UploadForm({ patientId }: { patientId: string }) {
  const initialState: UploadState = { message: null };
  const action = uploadPatientFile.bind(null, patientId);
  const [state, formAction] = useActionState(action, initialState);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setLocalMessage(null);
    if (!ALLOWED.includes(file.type)) return setLocalMessage('Only JPG, PNG or PDF files are allowed.');
    if (file.size > MAX_BYTES) return setLocalMessage('The file is larger than 2 MB.');
    setLocalMessage(null);
  }

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
        onChange={handleChange}
        className="block w-full text-sm"
        aria-describedby="file-message"
      />
      <div id="file-message" aria-live="polite" aria-atomic="true">
        {(localMessage ?? state.message) && (
          <p className="mt-2 text-sm text-gray-700">{localMessage ?? state.message}</p>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={!!localMessage}>Upload</Button>
      </div>
    </form>
  );
}
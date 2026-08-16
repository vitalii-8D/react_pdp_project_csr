import { useState } from 'react';
import clsx from 'clsx';

import type { UploadPurpose } from '../enums/upload-purpose.enum';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '../lib/upload-constraints';
import { generateUploadUrlMutation } from '../lib/graphql/uploads';
import { useAuth } from '../context/AuthContext';
import { TextField } from './TextField';
import { buttonStyles } from './Button';

interface UploadedImageValue {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  originalFileName: string;
  altText?: string;
}

interface ImageUploadFieldFieldNames {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: string;
  originalFileName: string;
}

interface ImageUploadFieldProps {
  purpose: UploadPurpose;
  label: string;
  hint?: string;
  shape?: 'rectangle' | 'circle';
  fieldNames: ImageUploadFieldFieldNames;
  altTextField?: { name: string; label: string; defaultValue?: string };
  defaultValue?: UploadedImageValue;
  onUploadingChange?: (uploading: boolean) => void;
}

enum Status {
  Idle = 'idle',
  Uploading = 'uploading',
  Error = 'error',
}

export function ImageUploadField({
  purpose,
  label,
  hint,
  shape = 'rectangle',
  fieldNames,
  altTextField,
  defaultValue,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const { token } = useAuth();
  const [preview, setPreview] = useState<string | undefined>(defaultValue?.url);
  const [current, setCurrent] = useState<UploadedImageValue | undefined>(defaultValue);
  const [status, setStatus] = useState<Status>(Status.Idle);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      setStatus(Status.Error);
      setErrorMessage('Unsupported file type. Use JPEG, PNG, WebP or GIF.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setStatus(Status.Error);
      setErrorMessage('File is too large. Max size is 5MB.');
      event.target.value = '';
      return;
    }

    const previousPreview = preview;
    const previousCurrent = current;
    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
    setStatus(Status.Uploading);
    setErrorMessage(undefined);
    onUploadingChange?.(true);

    try {
      const { uploadUrl, publicUrl, key } = await generateUploadUrlMutation(token, {
        purpose,
        fileName: file.name,
        contentType: file.type,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadResponse.ok) {
        throw new Error('Could not upload the file.');
      }

      setCurrent({
        key,
        url: publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        originalFileName: file.name,
      });
      setStatus(Status.Idle);
    } catch (error) {
      setPreview(previousPreview);
      setCurrent(previousCurrent);
      setStatus(Status.Error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      onUploadingChange?.(false);
    }
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</span>

      {preview && (
        <img
          src={preview}
          alt=""
          className={clsx(
            'max-h-40 w-auto object-contain border border-slate-200 mb-2',
            shape === 'circle' ? 'rounded-full' : 'rounded-xl',
          )}
        />
      )}

      <label className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
        {preview ? 'Change image' : 'Upload image'}
        <input type="file" accept={ALLOWED_IMAGE_MIME_TYPES.join(',')} className="hidden" onChange={handleFileChange} />
      </label>

      {hint && !errorMessage && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {status === 'uploading' && <p className="text-xs text-slate-500 mt-1">Uploading…</p>}
      {errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}

      <input type="hidden" name={fieldNames.key} value={current?.key ?? ''} />
      <input type="hidden" name={fieldNames.url} value={current?.url ?? ''} />
      <input type="hidden" name={fieldNames.mimeType} value={current?.mimeType ?? ''} />
      <input type="hidden" name={fieldNames.sizeBytes} value={current?.sizeBytes ?? ''} />
      <input type="hidden" name={fieldNames.originalFileName} value={current?.originalFileName ?? ''} />

      {altTextField && (
        <div className="mt-3">
          <TextField
            id={altTextField.name}
            label={altTextField.label}
            name={altTextField.name}
            type="text"
            defaultValue={altTextField.defaultValue}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { removeArtworkFile, saveArtworkFile, StoredArtworkMeta } from '../../lib/artwork-store';

export type ArtworkInfo = {
  title?: string;
  description?: string;
  supportedFormats?: string[];
  maxFileSizeMb?: number;
  notes?: string[];
};

export type ArtworkUploadResult = StoredArtworkMeta;

const defaultFormats = ['PDF', 'AI', 'EPS', 'SVG', 'PNG', 'JPG'];

function buildAccept(formats: string[]) {
  const exts = new Set<string>();
  formats.forEach((f) => {
    const lower = f.trim().toLowerCase();
    if (!lower) return;
    if (lower === 'jpg' || lower === 'jpeg') {
      exts.add('.jpg');
      exts.add('.jpeg');
      return;
    }
    if (lower.startsWith('.')) {
      exts.add(lower);
      return;
    }
    exts.add(`.${lower}`);
  });
  return Array.from(exts).join(',');
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
}

export default function ArtworkUpload({
  info,
  onFileChange,
  productSlug
}: {
  info?: ArtworkInfo;
  onFileChange?: (file: File | null, upload?: ArtworkUploadResult | null) => void;
  productSlug?: string;
}) {
  const formats = info?.supportedFormats?.length ? info.supportedFormats : defaultFormats;
  const maxSize = info?.maxFileSizeMb ? info.maxFileSizeMb : 100;
  const accept = useMemo(() => buildAccept(formats), [formats]);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [storedResult, setStoredResult] = useState<ArtworkUploadResult | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] || null;
    setError(null);

    if (!next) {
      setFile(null);
      setStoredResult(null);
      onFileChange?.(null, null);
      return;
    }

    const ext = next.name.includes('.') ? `.${next.name.split('.').pop()?.toLowerCase()}` : '';
    const allowed = formats
      .map((f) => f.trim().toLowerCase())
      .flatMap((f) => (f === 'jpg' ? ['jpg', 'jpeg'] : f.startsWith('.') ? [f.slice(1)] : [f]))
      .filter(Boolean);

    if (ext && allowed.length && !allowed.includes(ext.replace('.', ''))) {
      setError('Nepodporovaný formát súboru.');
      setFile(null);
      setStoredResult(null);
      onFileChange?.(null, null);
      return;
    }

    const maxBytes = maxSize * 1024 * 1024;
    if (next.size > maxBytes) {
      setError(`Súbor je príliš veľký (max ${maxSize} MB).`);
      setFile(null);
      setStoredResult(null);
      onFileChange?.(null, null);
      return;
    }

    setFile(next);
    setStoredResult(null);
    onFileChange?.(next, null);

    try {
      setSaving(true);
      if (storedResult?.id) {
        await removeArtworkFile(storedResult.id);
      }
      const saved = await saveArtworkFile(next);
      setStoredResult(saved);
      onFileChange?.(next, saved);
    } catch (err) {
      setError((err as Error).message || 'Nepodarilo sa uložiť súbor.');
      setStoredResult(null);
      onFileChange?.(next, null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-[#111518] mb-3">{info?.title || 'Podklady na tlač'}</h3>
      {info?.description && <p className="text-sm text-[#4d5d6d] mb-3">{info.description}</p>}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full text-sm text-[#4d5d6d] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#0087E3] file:text-white file:font-semibold hover:file:bg-[#006bb3]"
        />

        <div className="mt-3 text-sm text-[#4d5d6d]">
          Podporované formáty: <span className="font-semibold">{formats.join(', ')}</span>
        </div>
        <div className="text-sm text-[#4d5d6d]">Max. veľkosť súboru: {maxSize} MB</div>

        {info?.notes?.length ? (
          <ul className="mt-3 list-disc list-inside text-sm text-[#4d5d6d] space-y-1">
            {info.notes.map((note, index) => (
              <li key={`${note}-${index}`}>{note}</li>
            ))}
          </ul>
        ) : null}

        {file && (
          <div className="mt-3 text-sm text-[#111518]">
            Vybraný súbor: <span className="font-semibold">{file.name}</span>{' '}
            <span className="text-[#4d5d6d]">({formatBytes(file.size)})</span>
          </div>
        )}
        {saving && (
          <div className="mt-2 text-sm text-[#4d5d6d]">Ukladám súbor…</div>
        )}
        {storedResult && !saving && !error && (
          <div className="mt-2 text-sm text-green-600">Súbor pripravený na odoslanie.</div>
        )}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

type SizeOption = {
  label: string;
  width: number;
  height: number;
};

type MaterialOption = {
  label: string;
  value: string;
};

const sizeOptions: SizeOption[] = [
  { label: 'A3 (420 × 594 mm)', width: 420, height: 594 },
  { label: 'A2 (594 × 841 mm)', width: 594, height: 841 },
  { label: 'A1 (841 × 1189 mm)', width: 841, height: 1189 },
];

const materialOptions: MaterialOption[] = [
  { label: 'Hladký papier 120g', value: 'Hladký papier 120g' },
  { label: 'Lesklý papier 135g', value: 'Lesklý papier 135g' },
  { label: 'Matný papier 150g', value: 'Matný papier 150g' },
];

const quantityOptions = [1, 5, 10, 25, 50, 100, 200, 500];

type PriceState = {
  unitPrice: number;
  totalWithoutVat: number;
  totalWithVat: number;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${sizes[i]}`;
}

export default function PlagatyCalculator() {
  const [size, setSize] = useState<SizeOption>(sizeOptions[0]);
  const [material, setMaterial] = useState<MaterialOption>(materialOptions[0]);
  const [quantity, setQuantity] = useState<number>(quantityOptions[0]);
  const [price, setPrice] = useState<PriceState>({ unitPrice: 0, totalWithoutVat: 0, totalWithVat: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkBase64, setArtworkBase64] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/poster-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            width: size.width,
            height: size.height,
            material: material.value,
            quantity,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Chyba pri načítaní ceny');
        }

        const data: {
          unitPriceWithoutVat: number;
          totalWithoutVat: number;
          totalWithVat: number;
        } = await res.json();

        setPrice({
          unitPrice: data.unitPriceWithoutVat,
          totalWithoutVat: data.totalWithoutVat,
          totalWithVat: data.totalWithVat,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(err);
        setError('Nepodarilo sa načítať cenu');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    return () => controller.abort();
  }, [size, material, quantity]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Plagáty',
      productSlug: 'plagaty',
      options: {
        size: size.label,
        material: material.label,
        quantity,
        ...(artworkFile
          ? {
              artwork: {
                name: artworkFile.name,
                size: artworkFile.size,
                base64: artworkBase64,
              },
            }
          : {}),
      },
      quantity: 1,
      price: price.totalWithVat,
      image: '/images/plagaty.svg',
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produkt bol pridaný do košíka!');
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-[#111518] mb-6">Kalkulácia ceny</h2>

      <div className="space-y-6">
        {/* Veľkosť */}
        <div>
          <label className="block text-sm font-semibold text-[#111518] mb-2">
            Veľkosť plagátu
          </label>
          <select
            value={size.label}
            onChange={(e) => {
              const selected = sizeOptions.find((s) => s.label === e.target.value);
              if (selected) setSize(selected);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] text-[#111518] font-medium"
          >
            {sizeOptions.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Materiál */}
        <div>
          <label className="block text-sm font-semibold text-[#111518] mb-2">
            Materiál
          </label>
          <select
            value={material.label}
            onChange={(e) => {
              const selected = materialOptions.find((m) => m.label === e.target.value);
              if (selected) setMaterial(selected);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] text-[#111518] font-medium"
          >
            {materialOptions.map((m) => (
              <option key={m.label} value={m.label}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Množstvo */}
        <div>
          <label className="block text-sm font-semibold text-[#111518] mb-2">
            Počet kusov
          </label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3] text-[#111518] font-medium"
          >
            {quantityOptions.map((q) => (
              <option key={q} value={q}>
                {q} ks
              </option>
            ))}
          </select>
        </div>

        {/* PDF Upload */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Podklady (PDF)</h3>
          <div className="text-sm text-[#4d5d6d] mb-3">
            Podporovaný formát: <span className="font-semibold">PDF</span>
          </div>
          <div className="text-xs text-[#4d5d6d] mb-3">
            Súbor sa nahrá na cloud až pri odoslaní objednávky.
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setArtworkError(null);
                setArtworkFile(file);
                setArtworkBase64(null);

                if (!file) return;
                if (file.type && file.type !== 'application/pdf') {
                  setArtworkError('Prosím nahrajte iba PDF súbor.');
                  return;
                }

                const maxBytes = 6 * 1024 * 1024;
                if (file.size > maxBytes) {
                  setArtworkError(
                    `PDF je príliš veľké (${formatBytes(file.size)}). Maximálna veľkosť je ${formatBytes(maxBytes)}.`
                  );
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                  const result = typeof reader.result === 'string' ? reader.result : null;
                  setArtworkBase64(result);
                };
                reader.onerror = () => {
                  setArtworkError('Nepodarilo sa načítať PDF. Skúste to prosím znovu.');
                };
                reader.readAsDataURL(file);
              }}
              className="block w-full text-sm text-[#4d5d6d] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#0087E3] file:text-white file:font-semibold hover:file:bg-[#006bb3]"
            />

            {artworkFile && (
              <div className="mt-3 text-sm text-[#111518]">
                Vybraný súbor: <span className="font-semibold">{artworkFile.name}</span>{' '}
                <span className="text-[#4d5d6d]">({formatBytes(artworkFile.size)})</span>
              </div>
            )}
            {artworkError && <div className="mt-2 text-sm text-red-600">{artworkError}</div>}
          </div>
        </div>

        {/* Cenový prehľad */}
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          {loading && <p className="text-[#4d5d6d] text-center">Načítavam cenu...</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}
          {!loading && !error && (
            <div className="space-y-3">
              <div className="flex justify-between text-[#4d5d6d]">
                <span>Cena za 1 ks (bez DPH):</span>
                <span className="font-semibold">{price.unitPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-[#4d5d6d]">
                <span>Medzisúčet (bez DPH):</span>
                <span className="font-semibold">{price.totalWithoutVat.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-[#4d5d6d]">
                <span>DPH (20%):</span>
                <span className="font-semibold">
                  {(price.totalWithVat - price.totalWithoutVat).toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#111518] pt-3 border-t-2 border-gray-200">
                <span>Celkom s DPH:</span>
                <span className="text-[#0087E3]">{price.totalWithVat.toFixed(2)} €</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pridať do košíka
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

type EyeletOption = {
  label: string;
  price: number; // flat surcharge per piece (bez DPH)
};

const eyeletOptions: EyeletOption[] = [
  { label: 'Štandardné očkovanie', price: 0 }
];

type PriceState = {
  areaM2Single: number;
  pricePerM2: number;
  subtotal: number;
};

export default function BanerCalculator({ artwork }: { artwork?: ArtworkInfo }) {
  const router = useRouter();
  const [widthMm, setWidthMm] = useState<number>(1000);
  const [heightMm, setHeightMm] = useState<number>(1000);
  const [quantity, setQuantity] = useState<number>(1);
  const [eyelet, setEyelet] = useState<EyeletOption>(eyeletOptions[0]);
  const [price, setPrice] = useState<PriceState>({ areaM2Single: 1, pricePerM2: 0, subtotal: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    const w = Math.max(1, Number(widthMm) || 1);
    const h = Math.max(1, Number(heightMm) || 1);
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));

    const controller = new AbortController();

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/banner-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widthMm: w, heightMm: h, quantity: qty }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Chyba pri načítaní ceny');
        }

        const data: {
          areaM2Single: number;
          pricePerM2WithVat: number;
          totalWithVat: number;
          totalWithoutVat: number;
        } = await res.json();

        const baseWithoutVat = data.totalWithoutVat;
        const subtotal = baseWithoutVat + eyelet.price * qty;

        setPrice({
          areaM2Single: data.areaM2Single,
          pricePerM2: baseWithoutVat / (data.areaM2Single * qty),
          subtotal: Math.round(subtotal * 100) / 100,
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
  }, [widthMm, heightMm, quantity, eyelet]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Baner',
      productSlug: 'baner',
      options: {
        widthMm,
        heightMm,
        quantity,
        eyelet: eyelet.label,
        ...(artworkFile
          ? {
              artwork: {
                name: artworkStored?.name || artworkFile.name,
                size: artworkStored?.size || artworkFile.size,
                type: artworkStored?.type,
                fileId: artworkStored?.id
              }
            }
          : {})
      },
      artworkFileName: artworkFile?.name || null,
      quantity: 1,
      price: price.subtotal,
      image: '/images/banner.svg'
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));

    setShowAdded(true);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <AddedToCartModal
        open={showAdded}
        productName="Baner"
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor baneru</h2>

      <div className="space-y-8">
        {/* Rozmery */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Rozmer (mm)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Šírka</label>
              <input
                type="number"
                min={100}
                value={widthMm}
                onChange={(e) => setWidthMm(e.target.value === '' ? 0 : Math.max(1, Number(e.target.value)))}
                onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setWidthMm(100); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Výška</label>
              <input
                type="number"
                min={100}
                value={heightMm}
                onChange={(e) => setHeightMm(e.target.value === '' ? 0 : Math.max(1, Number(e.target.value)))}
                onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setHeightMm(100); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Množstvo</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? 0 : Math.max(1, Math.floor(Number(e.target.value))))}
                onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setQuantity(1); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
          </div>
        </div>

        {/* Očkovanie */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Očkovanie</h3>
          <div className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base bg-gray-50">
            Štandardné očkovanie (zahrnuté v cene)
          </div>
        </div>
      </div>

      <ArtworkUpload
        info={artwork}
        productSlug="baner"
        onFileChange={(file, upload) => {
          setArtworkFile(file);
          setArtworkStored(upload || null);
        }}
      />

      {/* Cena */}
      <div className="mt-10 pt-8 border-top-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">
              {loading ? '…' : price.subtotal.toFixed(2)} €
            </div>
            <div className="text-sm text-[#4d5d6d] mt-1">bez DPH</div>
            <div className="text-xs text-[#4d5d6d] mt-2">
              {price.areaM2Single.toFixed(2)} m² / ks · {price.pricePerM2.toFixed(2)} € za m²
            </div>
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#0087E3] text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Pridať do košíka
          </button>
        </div>
      </div>
    </div>
  );
}

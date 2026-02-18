'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

export type PlagatyPriceResult = {
  priceExVat: number;
  priceIncVat?: number;
};

const paperOptions = [
  { label: '115g matná', grammage: 115 },
  { label: '115g lesklá', grammage: 115 },
  { label: '150g matná', grammage: 150 },
  { label: '150g lesklá', grammage: 150 },
  { label: '200g matná', grammage: 200 },
  { label: '200g lesklá', grammage: 200 },
  { label: '250g matná', grammage: 250 },
  { label: '250g lesklá', grammage: 250 },
  { label: '300g matná', grammage: 300 },
  { label: '300g lesklá', grammage: 300 },
] as const;

type PaperOption = (typeof paperOptions)[number];

type FormatKey = 'A4' | 'A3';

type FormatOption = {
  label: string;
  width: number;
  height: number;
  key: FormatKey;
};

const formatOptions: FormatOption[] = [
  { label: 'A4 (210 × 297 mm)', width: 210, height: 297, key: 'A4' },
  { label: 'A3 (297 × 420 mm)', width: 297, height: 420, key: 'A3' },
];

const quantityOptions = [10, 25, 50, 100, 250, 500, 1000];

const colorOptions = [
  { label: 'Jednostranná farebná (4/0)', value: '4/0' as const },
  { label: 'Obojstranná farebná (4/4)', value: '4/4' as const },
  { label: 'Jednostranná čiernobiela (1/0)', value: '1/0' as const },
  { label: 'Obojstranná čiernobiela (1/1)', value: '1/1' as const },
];

type ColorKey = '1/0' | '1/1' | '4/0' | '4/4';

function formatCurrency(value: number) {
  return value.toFixed(2) + ' €';
}

export default function PlagatyCalculator({
  onPriceChange,
  artwork,
}: {
  onPriceChange?: (price: PlagatyPriceResult) => void;
  artwork?: ArtworkInfo;
}) {
  const router = useRouter();
  const [paper, setPaper] = useState<PaperOption>(paperOptions[0]);
  const [format, setFormat] = useState<FormatOption>(formatOptions[1]);
  const [quantity, setQuantity] = useState<number>(100);
  const [color, setColor] = useState<ColorKey>('4/0');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (onPriceChange) onPriceChange({ priceExVat: 0 });
  }, [paper, format, quantity, color, onPriceChange]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Plagáty',
      productSlug: 'plagaty',
      options: {
        paper: paper.label,
        format: format.label,
        color: colorOptions.find((c) => c.value === color)?.label ?? color,
        quantity,
        ...(note ? { note } : {}),
        ...(artworkFile
          ? {
              artwork: {
                name: artworkStored?.name || artworkFile.name,
                size: artworkStored?.size || artworkFile.size,
                type: artworkStored?.type,
                fileId: artworkStored?.id,
              },
            }
          : {}),
      },
      artworkFileName: artworkFile?.name || null,
      quantity: 1,
      price: 0,
      image: '/images/plagat.svg',
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
        productName="Plagáty"
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor plagátov</h2>

      <div className="space-y-8">
        {/* Papier */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Papier</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={paper.label}
            onChange={(e) => {
              const next = paperOptions.find((o) => o.label === e.target.value);
              if (next) setPaper(next);
            }}
          >
            {paperOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tlač */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Tlač</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={color}
            onChange={(e) => setColor(e.target.value as ColorKey)}
          >
            {colorOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Formát */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Formát</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={format.label}
            onChange={(e) => {
              const next = formatOptions.find((o) => o.label === e.target.value);
              if (next) setFormat(next);
            }}
          >
            {formatOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Množstvo */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Množstvo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Počet kusov</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value === '' ? 0 : Math.max(1, Math.floor(Number(e.target.value))))
                }
                onBlur={(e) => {
                  if (!e.target.value || Number(e.target.value) < 1) setQuantity(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {quantityOptions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    quantity === q
                      ? 'border-[#0087E3] bg-[#0087E3]/5'
                      : 'border-gray-200 hover:border-[#0087E3]/50'
                  }`}
                >
                  <div className="font-bold text-lg text-[#111518]">{q} ks</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Poznámka */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Poznámka</h3>
          <p className="text-sm text-[#4d5d6d] mb-3">
            Špeciálne požiadavky alebo link na súbory (WeTransfer, Úschovna…).
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vaša poznámka alebo link na podklady..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#0087E3] resize-y"
          />
        </div>
      </div>

      <ArtworkUpload
        info={artwork}
        productSlug="plagaty"
        onFileChange={(file, upload) => {
          setArtworkFile(file);
          setArtworkStored(upload || null);
        }}
      />

      {/* Tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200 flex justify-end">
        <button
          onClick={handleAddToCart}
          className="bg-[#0087E3] text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Pridať do košíka
        </button>
      </div>
    </div>
  );
}

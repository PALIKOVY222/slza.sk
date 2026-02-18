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
  { label: '115g matn\u00e1', grammage: 115, description: 'Ekonomick\u00fd plag\u00e1t' },
  { label: '115g leskl\u00e1', grammage: 115, description: 'Ekonomick\u00fd plag\u00e1t' },
  { label: '150g matn\u00e1', grammage: 150, description: 'Univerz\u00e1lny kompromis' },
  { label: '150g leskl\u00e1', grammage: 150, description: 'Univerz\u00e1lny kompromis' },
  { label: '200g matn\u00e1', grammage: 200, description: 'Pevnej\u0161\u00ed papier' },
  { label: '200g leskl\u00e1', grammage: 200, description: 'Pevnej\u0161\u00ed papier' },
  { label: '250g matn\u00e1', grammage: 250, description: 'Pr\u00e9miovej\u0161\u00ed feel' },
  { label: '250g leskl\u00e1', grammage: 250, description: 'Pr\u00e9miovej\u0161\u00ed feel' },
  { label: '300g matn\u00e1', grammage: 300, description: 'Najpevnej\u0161\u00ed z ponuky' },
  { label: '300g leskl\u00e1', grammage: 300, description: 'Najpevnej\u0161\u00ed z ponuky' }
] as const;

type PaperOption = (typeof paperOptions)[number];

type FormatOption = {
  label: string;
  width: number;
  height: number;
  key: FormatKey;
};

type FormatKey = 'A4' | 'A3';

const formatOptions: FormatOption[] = [
  { label: 'A4 (210 \u00d7 297 mm)', width: 210, height: 297, key: 'A4' },
  { label: 'A3 (297 \u00d7 420 mm)', width: 297, height: 420, key: 'A3' }
];

type QuantityOption = { amount: number };

const quantityOptions: QuantityOption[] = [
  { amount: 10 },
  { amount: 25 },
  { amount: 50 },
  { amount: 100 },
  { amount: 250 },
  { amount: 500 },
  { amount: 1000 }
];

const colorOptions = [
  { label: 'Jednostrann\u00e1 farebn\u00e1 (4/0)', value: '4/0' as const },
  { label: 'Obojstrann\u00e1 farebn\u00e1 (4/4)', value: '4/4' as const },
  { label: 'Jednostrann\u00e1 \u010diernobiela (1/0)', value: '1/0' as const },
  { label: 'Obojstrann\u00e1 \u010diernobiela (1/1)', value: '1/1' as const }
];

type ColorKey = '1/0' | '1/1' | '4/0' | '4/4';

function formatCurrency(value: number) {
  return `${value.toFixed(2)} \u20ac`;
}

export default function PlagatyCalculator({
  onPriceChange,
  artwork
}: {
  onPriceChange?: (price: PlagatyPriceResult) => void;
  artwork?: ArtworkInfo;
}) {
  const router = useRouter();
  const [paper, setPaper] = useState<PaperOption>(paperOptions[0]);
  const [format, setFormat] = useState<FormatOption>(formatOptions[1]);
  const [quantity, setQuantity] = useState<number>(100);
  const [color, setColor] = useState<ColorKey>('4/0');
  const [price, setPrice] = useState<PlagatyPriceResult>({ priceExVat: 0, priceIncVat: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/poster-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: format.key,
            grammage: paper.grammage,
            colorKey: color,
            quantity
          })
        });

        if (!res.ok) throw new Error('Chyba pri na\u010d\u00edtan\u00ed ceny');

        const data = (await res.json()) as PlagatyPriceResult;
        if (!cancelled) {
          setPrice(data);
          if (onPriceChange) onPriceChange(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Nepodarilo sa na\u010d\u00edta\u0165 cenu. Sk\u00faste to pros\u00edm znova.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrice();
    return () => { cancelled = true; };
  }, [paper, format, quantity, color, onPriceChange]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Plag\u00e1ty',
      productSlug: 'plagaty',
      options: {
        paper,
        format,
        color: colorOptions.find((c) => c.value === color)?.label ?? color,
        quantity: { amount: quantity },
        ...(note ? { note } : {}),
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
      price: price.priceExVat,
      image: '/images/plagat.svg'
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
        productName="Plag\u00e1ty"
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigur\u00e1tor plag\u00e1tov</h2>

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
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Tla\u010d / farebnos\u0165 */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Tla\u010d</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={color}
            onChange={(e) => setColor(e.target.value as ColorKey)}
          >
            {colorOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Form\u00e1t */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Form\u00e1t</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={format.label}
            onChange={(e) => {
              const next = formatOptions.find((o) => o.label === e.target.value);
              if (next) setFormat(next);
            }}
          >
            {formatOptions.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Mno\u017estvo */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Mno\u017estvo</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111518] mb-2">Po\u010det kusov</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Math.max(1, Math.floor(Number(e.target.value))))}
                  onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setQuantity(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {quantityOptions.map((q) => (
                <button
                  key={q.amount}
                  onClick={() => setQuantity(q.amount)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    quantity === q.amount
                      ? 'border-[#0087E3] bg-[#0087E3]/5'
                      : 'border-gray-200 hover:border-[#0087E3]/50'
                  }`}
                >
                  <div className="font-bold text-lg text-[#111518]">{q.amount} ks</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pozn\u00e1mka / extern\u00fd link */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Pozn\u00e1mka</h3>
          <p className="text-sm text-[#4d5d6d] mb-3">
            \u0160peci\u00e1lne po\u017eiadavky alebo link na s\u00fabory (WeTransfer, \u00daschovna\u2026).
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Va\u0161a pozn\u00e1mka alebo link na podklady..."
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

      {/* Cena a tla\u010didlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celkov\u00e1 cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">
              {loading ? '\u2026' : formatCurrency(price.priceExVat ?? 0)}
            </div>
            <div className="text-sm text-[#4d5d6d] mt-1">bez DPH</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#0087E3] text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Prida\u0165 do ko\u0161\u00edka
          </button>
        </div>
      </div>
    </div>
  );
}

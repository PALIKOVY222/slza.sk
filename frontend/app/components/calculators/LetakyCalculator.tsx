'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

export type LetakyPriceResult = {
  priceExVat: number;
  priceIncVat?: number;
};

const paperOptions = [
  { label: '115g matná', grammage: 115, description: 'Ekonomický leták' },
  { label: '115g lesklá', grammage: 115, description: 'Ekonomický leták' },
  { label: '150g matná', grammage: 150, description: 'Univerzálny kompromis' },
  { label: '150g lesklá', grammage: 150, description: 'Univerzálny kompromis' },
  { label: '200g matná', grammage: 200, description: 'Pevnejší papier' },
  { label: '200g lesklá', grammage: 200, description: 'Pevnejší papier' },
  { label: '250g matná', grammage: 250, description: 'Prémiovejší feel' },
  { label: '250g lesklá', grammage: 250, description: 'Prémiovejší feel' },
  { label: '300g matná', grammage: 300, description: 'Najpevnejší z ponuky' },
  { label: '300g lesklá', grammage: 300, description: 'Najpevnejší z ponuky' }
] as const;

type PaperOption = (typeof paperOptions)[number];

type FormatOption = {
  label: string;
  width: number; // mm
  height: number; // mm
  key: FormatKey;
};

type FormatKey = 'A6' | 'A5' | 'A4' | 'DL' | 'A3';

const formatOptions: FormatOption[] = [
  { label: 'A6 (105 × 148 mm)', width: 105, height: 148, key: 'A6' },
  { label: 'DL (99 × 210 mm)', width: 99, height: 210, key: 'DL' },
  { label: 'A5 (148 × 210 mm)', width: 148, height: 210, key: 'A5' },
  { label: 'A4 (210 × 297 mm)', width: 210, height: 297, key: 'A4' },
  { label: 'A3 (297 × 420 mm)', width: 297, height: 420, key: 'A3' }
];

type QuantityOption = {
  amount: number;
};

const quantityOptions: QuantityOption[] = [
  { amount: 25 },
  { amount: 50 },
  { amount: 100 },
  { amount: 250 },
  { amount: 500 },
  { amount: 1000 }
];

const colorOptions = [
  { label: 'Obojstranná farebná (4/4)', value: '4/4' as const },
  { label: 'Obojstranná čiernobiela (1/1)', value: '1/1' as const },
  { label: 'Jednostranná farebná (4/0)', value: '4/0' as const },
  { label: 'Jednostranná čiernobiela (1/0)', value: '1/0' as const }
];

type ColorKey = '1/0' | '1/1' | '4/0' | '4/4';

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}
export default function LetakyCalculator({
  onPriceChange,
  artwork
}: {
  onPriceChange?: (price: LetakyPriceResult) => void;
  artwork?: ArtworkInfo;
}) {
  const router = useRouter();
  const [paper, setPaper] = useState<PaperOption>(paperOptions[0]);
  const [format, setFormat] = useState<FormatOption>(formatOptions[3]);
  const [quantity, setQuantity] = useState<number>(100);
  const [color, setColor] = useState<ColorKey>('4/0');
  const [price, setPrice] = useState<LetakyPriceResult>({ priceExVat: 0, priceIncVat: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkBase64, setArtworkBase64] = useState<string | null>(null);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/flyer-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: format.key,
            grammage: paper.grammage,
            colorKey: color,
            quantity
          })
        });

        if (!res.ok) {
          throw new Error('Chyba pri načítaní ceny');
        }

        const data = (await res.json()) as LetakyPriceResult;
        if (!cancelled) {
          setPrice(data);
          if (onPriceChange) onPriceChange(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Nepodarilo sa načítať cenu. Skúste to prosím znova.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    return () => {
      cancelled = true;
    };
  }, [paper, format, quantity, color, onPriceChange]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Letáky',
      productSlug: 'letaky',
      options: {
        paper,
        format,
        quantity: { amount: quantity },
        ...(artworkFile
          ? {
              artwork: {
                name: artworkFile.name,
                size: artworkFile.size,
                base64: artworkBase64
              }
            }
          : {})
      },
      artworkFileName: artworkFile?.name || null,
      quantity: 1,
      price: price.priceExVat,
      image: '/images/letaky.svg'
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
        productName="Letáky"
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor letákov</h2>

      <div className="space-y-8">
        {/* Papier (dropdown) */}
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

        {/* Tlač / farebnosť (dropdown) */}
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

        {/* Formát (dropdown) */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111518] mb-2">Počet kusov</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
      </div>

      <ArtworkUpload
        info={artwork}
        onFileChange={(file) => {
          setArtworkFile(file);
          setArtworkBase64(null);
          if (!file) return;
          const maxBytes = 6 * 1024 * 1024;
          if (file.size > maxBytes) return;

          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : null;
            setArtworkBase64(result);
          };
          reader.readAsDataURL(file);
        }}
      />

      {/* Cena a tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">
              {loading ? '…' : formatCurrency(price.priceExVat ?? 0)}
            </div>
            <div className="text-sm text-[#4d5d6d] mt-1">bez DPH</div>
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

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

type PaperOption = {
  label: string;
  value:
    | '350-leskly'
    | '350-matny'
    | '300-leskly'
    | '300-matny'
    | '250-leskly'
    | '250-matny'
    | '200-leskly'
    | '200-matny';
};

type FormatOption = {
  label: string;
  value: number; // [Formát.value] (koľko ks vyjde z "hárku")
};

type ColorOption = {
  label: string;
  value: '1/0' | '1/1' | '4/0' | '4/4';
};

export type VizitkyCalculatorConfig = {
  paperOptions: PaperOption[];
  formatOptions: FormatOption[];
  colorOptions: ColorOption[];
  defaultQuantity?: number;
  vatRate?: number; // napr. 0.23
};

export type VizitkyPriceResult = {
  priceExVat: number;
  priceIncVat?: number;
};

// Cenová tabuľka z podkladov (EUR, bez DPH)
// Kľúč: papier -> farebnosť -> množstvo -> cena
// Lesklý a matný majú rovnaké ceny, ale sú samostatné vo výbere.
const baseTables = {
  '350': {
    '1/0': { 50: 10.29, 100: 14.02, 250: 18.14, 500: 22.89 },
    '1/1': { 50: 10.54, 100: 14.43, 250: 19.03, 500: 24.6 },
    '4/0': { 50: 14.76, 100: 19.76, 250: 23.87, 500: 29.03 },
    '4/4': { 50: 15.25, 100: 20.57, 250: 25.66, 500: 32.45 }
  },
  '300': {
    '1/0': { 50: 10.39, 100: 14.31, 250: 17.78, 500: 22.21 },
    '1/1': { 50: 10.63, 100: 14.72, 250: 18.67, 500: 23.92 },
    '4/0': { 50: 14.86, 100: 19.59, 250: 23.51, 500: 28.35 },
    '4/4': { 50: 15.35, 100: 20.41, 250: 25.3, 500: 31.76 }
  },
  '200': {
    '1/0': { 50: 10.12, 100: 14.47, 250: 17.15, 500: 21.02 },
    '1/1': { 50: 10.37, 100: 14.88, 250: 18.05, 500: 22.72 },
    '4/0': { 50: 14.59, 100: 19.31, 250: 22.89, 500: 27.15 },
    '4/4': { 50: 15.08, 100: 20.12, 250: 24.67, 500: 30.57 }
  }
};

function interpolateTables(
  lower: Record<string, Record<number, number>>,
  upper: Record<string, Record<number, number>>,
  weight: number
) {
  const result: Record<string, Record<number, number>> = {};

  Object.keys(lower).forEach((color) => {
    const lowerTable = lower[color];
    const upperTable = upper[color];
    const qtyMap: Record<number, number> = {};

    Object.keys(lowerTable).forEach((qtyKey) => {
      const qty = Number(qtyKey);
      const low = lowerTable[qty];
      const up = upperTable?.[qty];
      if (typeof low === 'number' && typeof up === 'number') {
        const interpolated = low + (up - low) * weight;
        qtyMap[qty] = Math.round(interpolated * 100) / 100;
      }
    });

    result[color] = qtyMap;
  });

  return result;
}

const baseTables250 = interpolateTables(baseTables['200'], baseTables['300'], 0.5);

function extendTable(base: Record<string, Record<number, number>>) {
  const extended: Record<string, Record<number, number>> = {};

  Object.entries(base).forEach(([color, table]) => {
    const entries = Object.entries(table)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    if (entries.length >= 2) {
      const [prevQty, prevPrice] = entries[entries.length - 2];
      const [lastQty, lastPrice] = entries[entries.length - 1];
      const slope = (lastPrice - prevPrice) / (lastQty - prevQty);

      const priceAt = (qty: number) => Math.round((lastPrice + (qty - lastQty) * slope) * 100) / 100;

      table[1000] = priceAt(1000);
      table[2500] = priceAt(2500);
    }

    extended[color] = table;
  });

  return extended;
}

const priceTable: Record<PaperOption['value'], Record<string, Record<number, number>>> = {
  '350-leskly': extendTable({ ...baseTables['350'] }),
  '350-matny': extendTable({ ...baseTables['350'] }),
  '300-leskly': extendTable({ ...baseTables['300'] }),
  '300-matny': extendTable({ ...baseTables['300'] }),
  '250-leskly': extendTable({ ...baseTables250 }),
  '250-matny': extendTable({ ...baseTables250 }),
  '200-leskly': extendTable({ ...baseTables['200'] }),
  '200-matny': extendTable({ ...baseTables['200'] })
};

function interpolatePrice(paper: PaperOption['value'], color: ColorOption['value'], qty: number) {
  const table = priceTable[paper]?.[color];
  if (!table) return null;

  const breakpoints = Object.keys(table)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (breakpoints.length === 0) return null;

  // Pod najnižším množstvom lineárne extrapolujeme prvé dva body
  if (qty <= breakpoints[0]) {
    if (breakpoints.length === 1) return table[breakpoints[0]];
    const low = breakpoints[0];
    const high = breakpoints[1];
    const slope = (table[high] - table[low]) / (high - low);
    const projected = table[low] + (qty - low) * slope;
    return Math.round(projected * 100) / 100;
  }

  // Nad najvyšším množstvom lineárne extrapolujeme posledné dva body
  if (qty >= breakpoints[breakpoints.length - 1]) {
    if (breakpoints.length === 1) return table[breakpoints[0]];
    const high = breakpoints[breakpoints.length - 1];
    const prev = breakpoints[breakpoints.length - 2];
    const slope = (table[high] - table[prev]) / (high - prev);
    const projected = table[high] + (qty - high) * slope;
    return Math.round(projected * 100) / 100;
  }

  for (let i = 0; i < breakpoints.length - 1; i += 1) {
    const low = breakpoints[i];
    const high = breakpoints[i + 1];
    if (qty >= low && qty <= high) {
      const lowPrice = table[low];
      const highPrice = table[high];
      const ratio = (qty - low) / (high - low);
      return Math.round((lowPrice + (highPrice - lowPrice) * ratio) * 100) / 100;
    }
  }

  return null;
}

export function calculateVizitkyPrice(params: {
  paperValue: PaperOption['value'];
  quantity: number;
  colorValue: ColorOption['value'];
  vatRate?: number;
}): VizitkyPriceResult {
  const { paperValue, quantity, colorValue, vatRate } = params;

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const priceFromTable = interpolatePrice(paperValue, colorValue, qty);
  const priceExVat = priceFromTable ?? 0;

  const result: VizitkyPriceResult = { priceExVat };

  if (typeof vatRate === 'number' && Number.isFinite(vatRate) && vatRate > 0) {
    result.priceIncVat = Math.round(priceExVat * (1 + vatRate) * 100) / 100;
  }

  return result;
}

const defaultConfig: VizitkyCalculatorConfig = {
  paperOptions: [
    { label: 'Natieraný lesklý 350g', value: '350-leskly' },
    { label: 'Natieraný matný 350g', value: '350-matny' },
    { label: 'Natieraný lesklý 300g', value: '300-leskly' },
    { label: 'Natieraný matný 300g', value: '300-matny' },
    { label: 'Natieraný lesklý 250g', value: '250-leskly' },
    { label: 'Natieraný matný 250g', value: '250-matny' },
    { label: 'Natieraný lesklý 200g', value: '200-leskly' },
    { label: 'Natieraný matný 200g', value: '200-matny' }
  ],
  formatOptions: [
    { label: '90 × 50 mm', value: 10 },
    { label: '85 × 55 mm', value: 9 }
  ],
  colorOptions: [
    { label: '1/0 (čiernobielo jednostranne)', value: '1/0' },
    { label: '1/1 (čiernobielo obojstranne)', value: '1/1' },
    { label: '4/0 (plnofarebne jednostranne)', value: '4/0' },
    { label: '4/4 (plnofarebne obojstranne)', value: '4/4' }
  ],
  defaultQuantity: 100,
  vatRate: undefined
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function VizitkyCalculator({
  config = defaultConfig,
  onPriceChange,
  artwork
}: {
  config?: VizitkyCalculatorConfig;
  onPriceChange?: (price: VizitkyPriceResult) => void;
  artwork?: ArtworkInfo;
}) {
  const router = useRouter();
  const initialPaper: PaperOption =
    config.paperOptions.find((o) => o.value === '300-leskly') ??
    config.paperOptions[0] ??
    defaultConfig.paperOptions[0];

  const [paper, setPaper] = useState<PaperOption>(initialPaper);
  const [format, setFormat] = useState<FormatOption>(config.formatOptions[0] ?? defaultConfig.formatOptions[0]);
  const [color, setColor] = useState<ColorOption>(config.colorOptions[0] ?? defaultConfig.colorOptions[0]);
  const [quantity, setQuantity] = useState<number>(config.defaultQuantity ?? defaultConfig.defaultQuantity ?? 100);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [artworkSaving, setArtworkSaving] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [note, setNote] = useState('');

  const price = useMemo(() => {
    return calculateVizitkyPrice({
      paperValue: paper.value,
      quantity,
      colorValue: color.value,
      vatRate: config.vatRate
    });
  }, [paper.value, quantity, color.value, config.vatRate]);

  React.useEffect(() => {
    if (onPriceChange) onPriceChange(price);
  }, [price, onPriceChange]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Vizitky',
      productSlug: 'vizitky',
      options: {
        paper: { name: paper.label, value: paper.value },
        format: { name: format.label, value: format.value },
        color: { name: color.label, value: color.value },
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
      quantity: 1,
      price: price.priceExVat,
      image: '/images/vizitky.svg'
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
        productName="Vizitky"
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor vizitiek</h2>

      <div className="space-y-8">
        {/* Papier (dropdown) */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Papier</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={paper.label}
            onChange={(e) => {
              const next = config.paperOptions.find((o) => o.label === e.target.value);
              if (next) setPaper(next);
            }}
          >
            {config.paperOptions.map((o) => (
              <option key={o.label} value={o.label}>
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
              const next = config.formatOptions.find((o) => o.label === e.target.value);
              if (next) setFormat(next);
            }}
          >
            {config.formatOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Počet kusov */}
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
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Math.max(1, Math.floor(Number(e.target.value))))}
                  onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) setQuantity(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[50, 100, 250, 500, 1000, 2500].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    quantity === q ? 'border-[#0087E3] bg-[#0087E3]/5' : 'border-gray-200 hover:border-[#0087E3]/50'
                  }`}
                >
                  <div className="font-bold text-lg text-[#111518]">{q} ks</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Farebnosť (dropdown) */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Farebnosť</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={color.label}
            onChange={(e) => {
              const next = config.colorOptions.find((o) => o.label === e.target.value);
              if (next) setColor(next);
            }}
          >
            {config.colorOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* PDF */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-2">Podklady (PDF)</h3>
          {artwork?.description && (
            <p className="text-sm text-[#4d5d6d] mb-3">{artwork.description}</p>
          )}
          <div className="text-sm text-[#4d5d6d] mb-3">
            Podporovaný formát: <span className="font-semibold">PDF</span>
          </div>
          <div className="text-xs text-[#4d5d6d] mb-3">
            Súbor sa odošle na cloud po odoslaní objednávky.
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                setArtworkError(null);
                setArtworkFile(file);
                setArtworkStored(null);

                if (!file) return;
                if (file.type && file.type !== 'application/pdf') {
                  setArtworkError('Prosím nahrajte iba PDF súbor.');
                  return;
                }

                try {
                  setArtworkSaving(true);
                  const { saveArtworkFile } = await import('../../../lib/artwork-store');
                  const saved = await saveArtworkFile(file);
                  setArtworkStored(saved);
                } catch (err) {
                  setArtworkError((err as Error).message || 'Nepodarilo sa uložiť PDF.');
                } finally {
                  setArtworkSaving(false);
                }
              }}
              className="block w-full text-sm text-[#4d5d6d] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#0087E3] file:text-white file:font-semibold hover:file:bg-[#006bb3]"
            />

            {artworkFile && (
              <div className="mt-3 text-sm text-[#111518]">
                Vybraný súbor: <span className="font-semibold">{artworkFile.name}</span>{' '}
                <span className="text-[#4d5d6d]">({formatBytes(artworkFile.size)})</span>
              </div>
            )}
            {artworkSaving && (
              <div className="mt-2 text-sm text-[#4d5d6d]">Ukladám súbor…</div>
            )}
            {artworkStored && !artworkSaving && !artworkError && (
              <div className="mt-2 text-sm text-green-600">Súbor pripravený na odoslanie.</div>
            )}
            {artworkError && <div className="mt-2 text-sm text-red-600">{artworkError}</div>}
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

      {/* Cena a tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{price.priceExVat.toFixed(2)} €</div>
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

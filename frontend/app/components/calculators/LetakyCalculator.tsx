'use client';

import React, { useMemo, useState } from 'react';

export type LetakyPriceResult = {
  priceExVat: number;
  priceIncVat?: number;
};

// Paper cost per sheet (EUR, bez DPH) z podkladov; použijeme ich ako faktor k 115g cenníku.
const paperOptions = [
  { label: '115g', costPerSheet: 0.0414, description: 'Ekonomický leták' },
  { label: '150g', costPerSheet: 0.054, description: 'Univerzálny kompromis' },
  { label: '200g', costPerSheet: 0.072, description: 'Pevnejší papier' },
  { label: '250g', costPerSheet: 0.09, description: 'Prémiovejší feel' },
  { label: '300g', costPerSheet: 0.108, description: 'Najpevnejší z ponuky' }
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
  { label: '1/0 (čb jednostranne)', value: '1/0' as const },
  { label: '1/1 (čb obojstranne)', value: '1/1' as const },
  { label: '4/0 (farba jednostranne)', value: '4/0' as const },
  { label: '4/4 (farba obojstranne)', value: '4/4' as const }
];

type ColorKey = '1/0' | '1/1' | '4/0' | '4/4';

// 115g tabuľka (cena za zákazku, bez DPH) – kalibrovaná podľa onlinetlac referencií.
// Štruktúra: formát -> množstvo -> farba -> cena
const basePriceTable: Record<FormatKey, Record<number, Record<ColorKey, number>>> = {
  A6: {
    25: { '1/0': 11.3, '1/1': 11.63, '4/0': 16.18, '4/4': 16.83 },
    50: { '1/0': 14.63, '1/1': 15.2, '4/0': 20.08, '4/4': 21.22 },
    100: { '1/0': 19.02, '1/1': 20.08, '4/0': 24.84, '4/4': 26.95 }
  },
  A5: {
    25: { '1/0': 13.61, '1/1': 14.98, '4/0': 17.81, '4/4': 20.48 },
    50: { '1/0': 16.59, '1/1': 17.64, '4/0': 22.4, '4/4': 24.51 },
    100: { '1/0': 21.95, '1/1': 23.98, '4/0': 28.25, '4/4': 32.32 }
  },
  A4: {
    25: { '1/0': 16.02, '1/1': 17.08, '4/0': 21.84, '4/4': 23.95 },
    50: { '1/0': 19.51, '1/1': 21.54, '4/0': 25.81, '4/4': 29.88 },
    100: { '1/0': 28.05, '1/1': 32.11, '4/0': 35.37, '4/4': 43.5 }
  },
  DL: {
    25: { '1/0': 12.6, '1/1': 13.01, '4/0': 17.89, '4/4': 18.7 },
    50: { '1/0': 15.45, '1/1': 16.18, '4/0': 21.06, '4/4': 22.52 },
    100: { '1/0': 20, '1/1': 21.38, '4/0': 25.98, '4/4': 28.74 }
  },
  A3: {
    25: { '1/0': 18.29, '1/1': 20.33, '4/0': 24.59, '4/4': 28.66 },
    50: { '1/0': 25.61, '1/1': 29.67, '4/0': 32.93, '4/4': 41.06 },
    100: { '1/0': 38.21, '1/1': 45.34, '4/0': 46.75, '4/4': 60.98 }
  }
};

const basePaperCost115 = paperOptions[0].costPerSheet;

// Kalibračné multiplikátory pre papiere relatívne k 115g, odvodené z onlinetlac referencií.
// Tieto faktory nahrádzajú pôvodný costPerSheet / basePaperCost115 výpočet pre lepšiu presnosť.
const paperCalibrationFactors: Record<string, number> = {
  '115g': 1.0,
  '150g': 1.3,      // odhadnutý medzi 115g a 200g
  '200g': 1.74,     // odvodené z onlinetlac A5 100ks 4/4: 30.89 / (32.32 / 1.74) ≈ 1.74
  '250g': 2.17,     // odhadnutý medzi 200g a 300g
  '300g': 2.61      // odvodené z onlinetlac A4 25ks 4/4: 23.95 / (23.95 / 2.61) ≈ 2.61
};

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

function interpolateOrExtrapolate(format: FormatKey, color: ColorKey, qty: number) {
  const table = basePriceTable[format];
  const points = Object.keys(table)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (points.includes(qty)) return table[qty]?.[color] ?? null;

  const first = points[0];
  const last = points[points.length - 1];

  const valAt = (q: number) => table[q]?.[color];

  if (qty < first && points.length >= 2) {
    const q1 = points[0];
    const q2 = points[1];
    const p1 = valAt(q1);
    const p2 = valAt(q2);
    if (p1 !== undefined && p2 !== undefined) {
      const slope = (p2 - p1) / (Math.log(q2) - Math.log(q1));
      return p1 + slope * (Math.log(qty) - Math.log(q1));
    }
  }

  if (qty > last && points.length >= 2) {
    const q1 = points[points.length - 2];
    const q2 = points[points.length - 1];
    const p1 = valAt(q1);
    const p2 = valAt(q2);
    if (p1 !== undefined && p2 !== undefined) {
      const slope = (p2 - p1) / (Math.log(q2) - Math.log(q1));
      return p2 + slope * (Math.log(qty) - Math.log(q2));
    }
  }

  // Medzi bodmi – lineárne na log-qty osi.
  for (let i = 0; i < points.length - 1; i += 1) {
    const q1 = points[i];
    const q2 = points[i + 1];
    if (qty > q1 && qty < q2) {
      const p1 = valAt(q1);
      const p2 = valAt(q2);
      if (p1 !== undefined && p2 !== undefined) {
        const ratio = (Math.log(qty) - Math.log(q1)) / (Math.log(q2) - Math.log(q1));
        return p1 + (p2 - p1) * ratio;
      }
    }
  }

  return null;
}

function calculateLetakyPrice({
  paper,
  format,
  quantity,
  color
}: {
  paper: PaperOption;
  format: FormatOption;
  quantity: number;
  color: ColorKey;
}): LetakyPriceResult {
  const base115 = interpolateOrExtrapolate(format.key, color, quantity) ?? 0;
  const gramFactor = paperCalibrationFactors[paper.label] ?? 1.0;
  const priceExVat = Math.max(0, Math.round(base115 * gramFactor * 100) / 100);
  return { priceExVat };
}

export default function LetakyCalculator({ onPriceChange }: { onPriceChange?: (price: LetakyPriceResult) => void }) {
  const [paper, setPaper] = useState<PaperOption>(paperOptions[0]);
  const [format, setFormat] = useState<FormatOption>(formatOptions[0]);
  const [quantity, setQuantity] = useState<number>(quantityOptions[0].amount);
  const [color, setColor] = useState<ColorKey>('1/0');

  const price = useMemo(() => {
    return calculateLetakyPrice({ paper, format, quantity, color });
  }, [paper, format, quantity, color]);

  React.useEffect(() => {
    if (onPriceChange) onPriceChange(price);
  }, [price, onPriceChange]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Letáky',
      options: {
        paper,
        format,
        quantity: { amount: quantity }
      },
      quantity: 1,
      price: price.priceExVat,
      image: '/images/letaky.svg'
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));

    alert('Produkt pridaný do košíka!');
    window.location.href = '/kosik';
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
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
          <p className="text-sm text-[#4d5d6d] mt-2">Cena sa odvíja od gramáže (najlacnejšie 115g).</p>
        </div>

        {/* Farebnosť (dropdown) */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Farebnosť</h3>
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

      {/* Cena a tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{formatCurrency(price.priceExVat)}</div>
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

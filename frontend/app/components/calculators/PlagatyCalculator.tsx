'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

// ─── Price table ─────────────────────────────────────────────────────────────
// Base prices WITH VAT (23%) for: format × quantity
// A3, Natieraný matný 115 g/m², Jednostranná (4+0), OPTIMAL
// Confirmed anchor: 100 ks A3 = 49,97 € (Anwell)
const A3_BASE: Record<number, number> = {
  10: 19.00,
  25: 30.65,
  50: 37.96,
  100: 49.97,
  250: 91.06,
  500: 154.07,
  1000: 251.38,
};

// A4 ≈ 77 % of A3 (derived from Anwell letáky table ratio)
const A4_FACTOR = 0.77;

// Multipliers
const FORMAT_FACTOR: Record<string, number> = { A3: 1.0, A4: A4_FACTOR };
const PAPER_FACTOR: Record<string, number> = {
  'Natieraný matný 115 g/m²': 1.00,
  'Natieraný lesklý 115 g/m²': 1.00,
  'Natieraný matný 170 g/m²': 1.25,
};
const SIDES_FACTOR: Record<string, number> = { '4+0': 1.00, '4+4': 1.20 };
const SPEED_FACTOR: Record<string, number> = {
  OPTIMAL: 1.00,
  EXPRESS: 1.30,
  'SUPER EXPRESS': 1.60,
};

const VAT_RATE = 0.23;

// Log-scale interpolation between known quantity points
function interpolatePrice(basePoints: Record<number, number>, qty: number): number {
  const pts = Object.entries(basePoints)
    .map(([k, v]) => ({ qty: Number(k), price: v }))
    .sort((a, b) => a.qty - b.qty);

  if (qty <= pts[0].qty) return pts[0].price;
  if (qty >= pts[pts.length - 1].qty) {
    const p1 = pts[pts.length - 2];
    const p2 = pts[pts.length - 1];
    const slope = (p2.price - p1.price) / (Math.log(p2.qty) - Math.log(p1.qty));
    return Math.max(0, p2.price + slope * (Math.log(qty) - Math.log(p2.qty)));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    if (qty >= pts[i].qty && qty <= pts[i + 1].qty) {
      const ratio =
        (Math.log(qty) - Math.log(pts[i].qty)) /
        (Math.log(pts[i + 1].qty) - Math.log(pts[i].qty));
      return pts[i].price + (pts[i + 1].price - pts[i].price) * ratio;
    }
  }
  return pts[pts.length - 1].price;
}

function calcPrice(
  format: string,
  paper: string,
  sides: string,
  speed: string,
  qty: number,
) {
  if (qty < 1) return { priceIncVat: 0, priceExVat: 0, unitPriceExVat: 0 };
  const base = interpolatePrice(A3_BASE, qty);
  const multiplied =
    base *
    (FORMAT_FACTOR[format] ?? 1) *
    (PAPER_FACTOR[paper] ?? 1) *
    (SIDES_FACTOR[sides] ?? 1) *
    (SPEED_FACTOR[speed] ?? 1);
  const priceIncVat = Math.round(multiplied * 100) / 100;
  const priceExVat = Math.round((priceIncVat / (1 + VAT_RATE)) * 100) / 100;
  const unitPriceExVat = Math.round((priceExVat / qty) * 100) / 100;
  return { priceIncVat, priceExVat, unitPriceExVat };
}

function fmt(n: number) {
  return n.toFixed(2) + ' €';
}

// ─── Options ─────────────────────────────────────────────────────────────────
const formatOptions = ['A4', 'A3'] as const;
const paperOptions = [
  'Natieraný matný 115 g/m²',
  'Natieraný lesklý 115 g/m²',
  'Natieraný matný 170 g/m²',
] as const;
const sidesOptions = [
  { label: 'Jednostranná (4+0)', value: '4+0' },
  { label: 'Obojstranná (4+4)', value: '4+4' },
];
const speedOptions = [
  { label: 'OPTIMAL', sub: '3 pracovné dni', value: 'OPTIMAL' },
  { label: 'EXPRESS', sub: '2 pracovné dni', value: 'EXPRESS' },
  { label: 'SUPER EXPRESS', sub: '1 pracovný deň', value: 'SUPER EXPRESS' },
];
const qtyPresets = [10, 25, 50, 100, 250, 500, 1000];

// ─── Component ───────────────────────────────────────────────────────────────
export default function PlagatyCalculator({ artwork }: { artwork?: ArtworkInfo }) {
  const router = useRouter();
  const [format, setFormat] = useState<string>('A3');
  const [paper, setPaper] = useState<string>('Natieraný matný 115 g/m²');
  const [sides, setSides] = useState<string>('4+0');
  const [speed, setSpeed] = useState<string>('OPTIMAL');
  const [quantity, setQuantity] = useState<number>(100);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [showAdded, setShowAdded] = useState(false);

  const price = useMemo(
    () => calcPrice(format, paper, sides, speed, quantity),
    [format, paper, sides, speed, quantity],
  );

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Plagáty',
      productSlug: 'plagaty',
      options: {
        format,
        paper,
        sides: sidesOptions.find((s) => s.value === sides)?.label ?? sides,
        speed,
        quantity,
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
      price: price.priceExVat,
      image: '/images/plagat.svg',
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
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

        {/* Formát */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Formát</h3>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  format === f
                    ? 'border-[#0087E3] bg-[#0087E3]/5 text-[#0087E3]'
                    : 'border-gray-200 hover:border-[#0087E3]/50 text-[#111518]'
                }`}
              >
                <div className="font-bold text-lg">{f}</div>
                <div className="text-sm text-[#4d5d6d] mt-0.5">
                  {f === 'A4' ? '210 × 297 mm' : '297 × 420 mm'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Papier */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Papier</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#0087E3]"
            value={paper}
            onChange={(e) => setPaper(e.target.value)}
          >
            {paperOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Tlač */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Tlač</h3>
          <div className="grid grid-cols-2 gap-3">
            {sidesOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setSides(s.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  sides === s.value
                    ? 'border-[#0087E3] bg-[#0087E3]/5 text-[#0087E3]'
                    : 'border-gray-200 hover:border-[#0087E3]/50 text-[#111518]'
                }`}
              >
                <div className="font-semibold">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rýchlosť výroby */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Rýchlosť výroby</h3>
          <div className="grid grid-cols-3 gap-3">
            {speedOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  speed === s.value
                    ? 'border-[#0087E3] bg-[#0087E3]/5'
                    : 'border-gray-200 hover:border-[#0087E3]/50'
                }`}
              >
                <div className={`font-bold text-sm ${speed === s.value ? 'text-[#0087E3]' : 'text-[#111518]'}`}>
                  {s.label}
                </div>
                <div className="text-xs text-[#4d5d6d] mt-1">{s.sub}</div>
              </button>
            ))}
          </div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-[#111518]"
              />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {qtyPresets.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                    quantity === q
                      ? 'border-[#0087E3] bg-[#0087E3]/5 text-[#0087E3]'
                      : 'border-gray-200 hover:border-[#0087E3]/50 text-[#111518]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artwork upload */}
      <ArtworkUpload
        info={artwork}
        productSlug="plagaty"
        onFileChange={(file, upload) => {
          setArtworkFile(file);
          setArtworkStored(upload || null);
        }}
      />

      {/* Cena + tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{fmt(price.priceExVat)}</div>
            <div className="text-sm text-[#4d5d6d] mt-1">
              bez DPH · {fmt(price.unitPriceExVat)}/ks
            </div>
            <div className="text-sm text-[#4d5d6d] mt-0.5">
              S DPH (23 %): <span className="font-semibold">{fmt(price.priceIncVat)}</span>
            </div>
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

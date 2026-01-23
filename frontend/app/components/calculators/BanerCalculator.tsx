'use client';

import React, { useMemo, useState } from 'react';

type PriceTier = {
  upTo: number; // m2 threshold (inclusive)
  pricePerM2: number;
};

type EyeletOption = {
  label: string;
  price: number; // flat surcharge per piece
};

const priceTiers: PriceTier[] = [
  { upTo: 2, pricePerM2: 20 },
  { upTo: 5, pricePerM2: 17 },
  { upTo: 10, pricePerM2: 15 },
  { upTo: Infinity, pricePerM2: 13 }
];

const eyeletOptions: EyeletOption[] = [
  { label: 'Bez očiek', price: 0 },
  { label: 'S očkovaním', price: 8 }
];

function getPricePerM2(areaM2: number) {
  for (const tier of priceTiers) {
    if (areaM2 <= tier.upTo) return tier.pricePerM2;
  }
  return priceTiers[priceTiers.length - 1].pricePerM2;
}

export default function BanerCalculator() {
  const [widthMm, setWidthMm] = useState<number>(1000);
  const [heightMm, setHeightMm] = useState<number>(1000);
  const [quantity, setQuantity] = useState<number>(1);
  const [eyelet, setEyelet] = useState<EyeletOption>(eyeletOptions[0]);

  const price = useMemo(() => {
    const w = Math.max(1, Number(widthMm) || 1);
    const h = Math.max(1, Number(heightMm) || 1);
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));

    const areaM2Single = (w / 1000) * (h / 1000);
    const pricePerM2 = getPricePerM2(areaM2Single);
    const base = areaM2Single * pricePerM2;
    const subtotal = (base + eyelet.price) * qty;

    return {
      areaM2Single,
      pricePerM2,
      subtotal: Math.round(subtotal * 100) / 100
    };
  }, [widthMm, heightMm, quantity, eyelet]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: 'Baner',
      options: {
        widthMm,
        heightMm,
        quantity,
        eyelet: eyelet.label
      },
      quantity: 1,
      price: price.subtotal,
      image: '/images/banner.svg'
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));

    alert('Produkt pridaný do košíka!');
    window.location.href = '/kosik';
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
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
                onChange={(e) => setWidthMm(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Výška</label>
              <input
                type="number"
                min={100}
                value={heightMm}
                onChange={(e) => setHeightMm(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Množstvo</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
          </div>
        </div>

        {/* Očkovanie */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Očkovanie</h3>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-4 text-base"
            value={eyelet.label}
            onChange={(e) => {
              const next = eyeletOptions.find((o) => o.label === e.target.value);
              if (next) setEyelet(next);
            }}
          >
            {eyeletOptions.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label} {o.price > 0 ? `(+${o.price.toFixed(2)} €)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cena */}
      <div className="mt-10 pt-8 border-top-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{price.subtotal.toFixed(2)} €</div>
            <div className="text-sm text-[#4d5d6d] mt-1">bez DPH</div>
            <div className="text-xs text-[#4d5d6d] mt-2">
              {price.areaM2Single.toFixed(2)} m² / ks · {price.pricePerM2.toFixed(2)} € za m²
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

'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from '../ArtworkUpload';
import AddedToCartModal from '../AddedToCartModal';

type ModelOption = {
  code: string;
  label: string;
  size: string;
  price: number; // cena celej pečiatky (bez DPH)
};

type VariantOption = {
  label: string;
  kind: 'cele' | 'poduska' | 'stocek';
};

const modelOptions: ModelOption[] = [
  { code: '4910', label: 'Printy 4910', size: '26 × 9 mm', price: 18.1 },
  { code: '4911', label: 'Printy 4911', size: '38 × 14 mm', price: 21.9 },
  { code: '4912', label: 'Printy 4912', size: '47 × 18 mm', price: 26.3 },
  { code: '4913', label: 'Printy 4913', size: '58 × 22 mm', price: 31.5 }
];

// Varianty: celá pečiatka, len poduška, len štočok
const variantOptions: VariantOption[] = [
  { label: 'Celá pečiatka', kind: 'cele' },
  { label: 'Poduška', kind: 'poduska' },
  { label: 'Štočok', kind: 'stocek' }
];

const padPriceByModel: Record<string, number> = {
  '4910': 4.2,
  '4911': 4.2,
  '4912': 4.8,
  '4913': 5.5
};

const platePriceByModel: Record<string, number> = {
  '4910': 8.4,
  '4911': 10.6,
  '4912': 12.6,
  '4913': 15.1
};

export default function PeciatkyCalculator({ artwork }: { artwork?: ArtworkInfo }) {
  const router = useRouter();
  const [model, setModel] = useState<ModelOption>(modelOptions[0]);
  const [variant, setVariant] = useState<VariantOption>(variantOptions[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkBase64, setArtworkBase64] = useState<string | null>(null);
  const [showAdded, setShowAdded] = useState(false);

  const price = useMemo(() => {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const base = model.price;

    let unitPrice = base;
    if (variant.kind === 'poduska') {
      unitPrice = padPriceByModel[model.code] ?? base;
    } else if (variant.kind === 'stocek') {
      unitPrice = platePriceByModel[model.code] ?? base;
    }

    const subtotal = unitPrice * qty;
    return {
      unitPrice: Math.round(unitPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      qty
    };
  }, [model, variant, quantity]);

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: `Pečiatka ${model.code}`,
      productSlug: 'peciatky',
      options: {
        model: `${model.label} (${model.size})`,
        variant: variant.label,
        quantity: price.qty,
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
      price: price.subtotal,
      image: '/images/trodat_peciatka.svg'
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
        productName={`Pečiatka ${model.code}`}
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor pečiatok</h2>

      <div className="space-y-8">
        {/* Model */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Model</h3>
          <div className="border-2 border-gray-200 rounded-lg hover:border-[#0087E3]/50 focus-within:border-[#0087E3] transition-all bg-white">
            <select
              className="w-full rounded-lg px-6 py-6 text-base focus:outline-none"
              value={model.code}
              onChange={(e) => {
                const next = modelOptions.find((o) => o.code === e.target.value);
                if (next) setModel(next);
              }}
            >
              {modelOptions.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label} — {o.size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Variant */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Varianta</h3>
          <div className="border-2 border-gray-200 rounded-lg hover:border-[#0087E3]/50 focus-within:border-[#0087E3] transition-all bg-white">
            <select
              className="w-full rounded-lg px-6 py-6 text-base focus:outline-none"
              value={variant.label}
              onChange={(e) => {
                const next = variantOptions.find((o) => o.label === e.target.value);
                if (next) setVariant(next);
              }}
            >
              {variantOptions.map((o) => (
                <option key={o.label} value={o.label}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Množstvo */}
        <div>
          <h3 className="text-xl font-bold text-[#111518] mb-4">Množstvo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#111518] mb-2">Počet kusov</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 5, 10].map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  quantity === q ? 'border-[#0087E3] bg-[#0087E3]/5' : 'border-gray-200 hover:border-[#0087E3]/50'
                }`}
              >
                <div className="font-bold text-lg text-[#111518]">{q} ks</div>
              </button>
            ))}
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

      {/* Cena */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{price.subtotal.toFixed(2)} €</div>
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

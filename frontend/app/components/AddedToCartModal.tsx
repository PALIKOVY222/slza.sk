'use client';

import React from 'react';

interface AddedToCartModalProps {
  open: boolean;
  productName?: string;
  onClose: () => void;
  onGoToCart: () => void;
}

export default function AddedToCartModal({
  open,
  productName,
  onClose,
  onGoToCart
}: AddedToCartModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111518]">Produkt bol pridaný</h3>
            <p className="text-sm text-[#4d5d6d]">
              {productName ? `${productName} je v košíku.` : 'Produkt je v košíku.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onGoToCart}
            className="flex-1 rounded-lg bg-[#0087E3] px-4 py-3 text-white font-semibold hover:bg-[#006bb3] transition"
          >
            Prejsť do košíka
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 text-[#111518] font-semibold hover:border-[#0087E3] hover:text-[#0087E3] transition"
          >
            Pokračovať v nákupe
          </button>
        </div>
      </div>
    </div>
  );
}

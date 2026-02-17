'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const paid = searchParams?.get('paid');
  const method = searchParams?.get('method');
  const [loading, setLoading] = useState(true);

  const isValid = sessionId || paid || method;

  useEffect(() => {
    if (isValid) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
      setLoading(false);
    }
  }, [isValid]);

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Neplatná stránka</h1>
          <Link 
            href="/"
            className="inline-block bg-[#0087E3] text-white py-3 px-6 rounded-md hover:bg-[#006BB3]"
          >
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    );
  }

  const isBankTransfer = method === 'bank_transfer';
  const isCashOnDelivery = method === 'cash_on_delivery';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg 
            className="mx-auto h-20 w-20 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {isBankTransfer ? 'Objednávka prijatá!' : isCashOnDelivery ? 'Objednávka prijatá!' : 'Platba úspešná!'}
        </h1>
        <p className="text-gray-600 mb-2">
          Ďakujeme za vašu objednávku.
        </p>
        <p className="text-gray-600 mb-6">
          {isBankTransfer
            ? 'Platobné údaje sme vám odoslali na email. Po prijatí platby spracujeme vašu objednávku.'
            : isCashOnDelivery
            ? 'Objednávku uhradíte pri prevzatí. Potvrdenie sme vám odoslali na email.'
            : 'Potvrdenie sme vám odoslali na email.'}
        </p>
        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-[#0087E3] text-white py-3 px-6 rounded-md hover:bg-[#006BB3] transition-colors"
          >
            Späť na hlavnú stránku
          </Link>
          <Link 
            href="/produkty"
            className="block w-full bg-white text-[#0087E3] border-2 border-[#0087E3] py-3 px-6 rounded-md hover:bg-[#0087E3] hover:text-white transition-colors"
          >
            Pokračovať v nákupe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0087E3] mx-auto"></div>
            <p className="mt-4 text-gray-600">Načítavam...</p>
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}

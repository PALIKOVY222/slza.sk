'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCalculator from '../../components/ProductCalculator';
import VizitkyCalculator from '../../components/calculators/VizitkyCalculator';
import BanerCalculator from '../../components/calculators/BanerCalculator';
import PeciatkyCalculator from '../../components/calculators/PeciatkyCalculator';
import LetakyCalculator from '../../components/calculators/LetakyCalculator';
import { productsData } from '../../data/productsData';

const ProductPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fallback = productsData[slug as keyof typeof productsData] || null;

    try {
      const stored = localStorage.getItem('productConfigs');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, any>;
        if (parsed[slug]) {
          setProduct({ ...(fallback || {}), ...parsed[slug] });
        } else {
          setProduct(fallback);
        }
        return;
      }
    } catch (err) {
      console.error('Product config load error', err);
    }

    setProduct(fallback);
  }, [slug]);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Produkt nenájdený</h1>
            <a href="/produkty" className="text-[#0087E3] hover:underline">Späť na produkty</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = Array.isArray(product.specs) ? product.specs : [];
  const useGenericCalculator = product?.calculatorType === 'generic';

  const renderCalculator = () => {
    if (useGenericCalculator) return <ProductCalculator product={product} slug={slug} />;
    if (slug === 'vizitky') return <VizitkyCalculator onPriceChange={() => {}} artwork={product?.artwork} />;
    if (slug === 'letaky') return <LetakyCalculator onPriceChange={() => {}} artwork={product?.artwork} />;
    if (slug === 'baner') return <BanerCalculator artwork={product?.artwork} />;
    if (slug === 'peciatky') return <PeciatkyCalculator artwork={product?.artwork} />;
    return <ProductCalculator product={product} slug={slug} />;
  };

  return (
    <div>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0087E3] pt-48 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">{product.title}</h1>
          {product.description && (
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
      </section>

      {/* ── Product + Calculator ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left – product image + specs */}
            <div className="space-y-8">
              {/* Product image */}
              <div className="bg-gray-50 rounded-2xl p-12 flex items-center justify-center min-h-[360px]">
                <img
                  src={product.image}
                  alt={product.title}
                  className="max-w-full max-h-[280px] object-contain"
                />
              </div>

              {/* Specs list */}
              {specs.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#111518] mb-4">Vlastnosti produktu</h3>
                  <ul className="space-y-3">
                    {specs.map((spec: string) => (
                      <li key={spec} className="flex items-start gap-3 text-[#4d5d6d]">
                        <svg
                          className="w-5 h-5 text-[#0087E3] mt-0.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right – calculator (sticky) */}
            <div className="lg:sticky lg:top-8">
              {renderCalculator()}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech specs ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Technické požiadavky */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#111518] mb-6">Technické požiadavky</h2>
              <ul className="space-y-4 text-[#4d5d6d]">
                {[
                  ['Formát súboru', 'PDF s orezom 3 mm na každej strane'],
                  ['Rozlíšenie', 'min. 300 DPI'],
                  ['Farebný priestor', 'CMYK (RGB bude konvertované)'],
                  ['Maximálna veľkosť súboru', '100 MB (alebo zadajte link v poznámke)'],
                  ['Fontky', 'Vložené alebo prevedené na krivky'],
                ].map(([label, value]) => (
                  <li key={label} className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-[#0087E3] mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="font-semibold text-[#111518]">{label}:</span>{' '}
                      {value}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pomoc s podkladmi */}
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111518] mb-6">
                  Potrebujete pomoc s podkladmi?
                </h2>
                <p className="text-[#4d5d6d] mb-4 leading-relaxed">
                  Ak neviete pripraviť podklady sami, radi vám pomôžeme.
                  Stačí nám zaslať vaše materiály (logá, texty, fotky) a naši grafici
                  pripravia podklady presne podľa vašich predstáv.
                </p>
                <p className="text-[#4d5d6d] mb-6 leading-relaxed">
                  <strong>Kontaktujte nás</strong> a dohodneme cenu za prípravu grafiky individuálne.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-[#0087E3]">
                <p className="text-sm font-semibold text-[#111518] mb-1">Kontakt</p>
                <p className="text-sm text-[#4d5d6d]">
                  E-mail:{' '}
                  <a href="mailto:info@slza.sk" className="text-[#0087E3] hover:underline font-medium">
                    info@slza.sk
                  </a>
                </p>
                <p className="text-sm text-[#4d5d6d] mt-1">Pondelok – piatok, 9:00 – 17:00</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;

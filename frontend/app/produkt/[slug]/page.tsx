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
  const [vizitkyPrice, setVizitkyPrice] = useState<number | null>(null);
  const [letakyPrice, setLetakyPrice] = useState<number | null>(null);

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

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-48 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <nav className="text-white/80 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Domov</a>
            <span className="mx-2">/</span>
            <a href="/produkty" className="hover:text-white transition-colors">Produkty</a>
            <span className="mx-2">/</span>
            <span className="text-white">{product.title}</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">{product.title}</h1>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="bg-[#f9f9f9] rounded-2xl p-12 flex items-center justify-center min-h-[500px]">
              <img src={product.image} alt={product.title} className="max-w-full max-h-[400px] object-contain" />
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-[#0087E3] font-semibold mb-2 uppercase">{product.category || 'Produkt'}</p>
              <h2 className="text-4xl font-bold text-[#111518] mb-4">{product.title}</h2>
              <p className="text-lg text-[#4d5d6d] mb-8 leading-relaxed">{product.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-[#111518] mb-4">Vlastnosti produktu:</h3>
                <ul className="space-y-2">
                  {specs.map((spec, index) => (
                    <li key={index} className="flex items-start gap-3 text-[#4d5d6d]">
                      <svg className="w-5 h-5 text-[#0087E3] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#0087E3]">
                  {product.priceLabel || 'Kalkulácia podľa parametrov'}
                </div>
                <span className="text-sm text-[#4d5d6d]">+ DPH</span>
              </div>
            </div>
          </div>

          {/* Calculator Section */}
          {useGenericCalculator ? (
            <ProductCalculator product={product} slug={slug} />
          ) : slug === 'vizitky' ? (
            <VizitkyCalculator
              onPriceChange={(p) => setVizitkyPrice(p.priceExVat)}
              artwork={product?.artwork}
            />
          ) : slug === 'letaky' ? (
            <LetakyCalculator
              onPriceChange={(p) => setLetakyPrice(p.priceExVat)}
              artwork={product?.artwork}
            />
          ) : slug === 'baner' ? (
            <BanerCalculator artwork={product?.artwork} />
          ) : slug === 'peciatky' ? (
            <PeciatkyCalculator artwork={product?.artwork} />
          ) : (
            <ProductCalculator product={product} slug={slug} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;

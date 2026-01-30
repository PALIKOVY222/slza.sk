'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProduktyPage = () => {
  const searchParams = useSearchParams();
  const queryRaw = (searchParams?.get('search') || '').trim();
  const normalize = (v: string) => v.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const query = normalize(queryRaw);
  const defaultProducts = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg',
      scale: 'scale-125',
      slug: 'baner'
    },
    {
      title: 'Nálepky',
      price: 'od 15,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/sticker.svg',
      scale: 'scale-115',
      slug: 'nalepky'
    },
    {
      title: 'Pečiatky',
      price: '13,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/trodat_peciatka.svg',
      scale: 'scale-115',
      slug: 'peciatky'
    },
    {
      title: 'Vizitky',
      price: '20,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/vizitky.svg',
      scale: 'scale-115',
      slug: 'vizitky'
    },
    {
      title: 'Letáky',
      price: 'od 0,35 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/letaky.svg',
      scale: 'scale-115',
      slug: 'letaky'
    },
    {
      title: 'Plagáty',
      price: '25,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/plagat.svg',
      scale: 'scale-115',
      slug: 'plagaty'
    }
  ];

  const [products, setProducts] = useState(defaultProducts);

  useEffect(() => {
    const stored = localStorage.getItem('products');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Array<any>;
      const merged = new Map(defaultProducts.map((p) => [p.slug, p]));
      parsed.forEach((p) => {
        merged.set(p.slug, {
          title: p.title,
          price: p.price ? `${Number(p.price).toFixed(2)} €` : '',
          category: p.category,
          image: p.image,
          scale: 'scale-115',
          slug: p.slug
        });
      });
      setProducts(Array.from(merged.values()));
    } catch (err) {
      console.error('Products list load error', err);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!query) return products;
    return products.filter((p) => normalize(p.title).includes(query));
  }, [products, query]);

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-60 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <nav className="text-white/80 text-sm mb-6">
            <a href="/" className="hover:text-white transition-colors">DOMOV</a>
            <span className="mx-2">/</span>
            <span className="text-white">ESHOP</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">Produkty</h1>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <p className="text-sm text-[#4d5d6d]">
              {query
                ? `Výsledky pre "${queryRaw}" (${filtered.length})`
                : `SHOWING ALL ${products.length} RESULTS`}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[50px] justify-items-center">
            {filtered.map((product, index) => {
              return (
                <div className="transition-all duration-300 max-w-[350px]" key={`${product.slug}-${index}`}>
                  <a href={`/produkt/${product.slug}`} className="block">
                    <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
                      <img src={product.image} alt={product.title} className={`w-full h-full object-contain ${product.scale} transition-transform duration-300 hover:scale-110`} />
                    </div>
                  </a>
                  <div className="text-left">
                    <h3 className="text-xl mb-[10px] text-[#111518] font-bold">{product.title}</h3>
                    <a href={`/produkt/${product.slug}`} className="inline-block bg-[#F3F5F7] text-[#111518] py-4 px-6 rounded-[5px] no-underline text-sm font-medium transition-all duration-300 border-none cursor-pointer hover:bg-[#0087E3] hover:text-white">Konfigurovať</a>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-[#4d5d6d] mt-8">Nenašli sa žiadne produkty.</div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProduktyPage;

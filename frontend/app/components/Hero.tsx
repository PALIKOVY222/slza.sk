'use client';

import React from 'react';

const Hero = () => {
  return (
    <>
      {/* Hero 1 - Farebný portrét */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white px-5"
        style={{
          backgroundImage: 'url(/images/hero-portrait.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a1a2e'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto py-20">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Tlačiareň SLZA
          </h1>
          <p className="text-2xl md:text-3xl font-bold mb-6 uppercase tracking-wide">
            OD VIZITKY PO KNIHU
          </p>
          <p className="text-xl md:text-2xl font-bold mb-4">
            DODÁME ZÁKAZKU AJ DO<br/>
            <span className="text-3xl md:text-4xl text-[#ff3366]">24 HODÍN</span>
          </p>
          <p className="text-lg md:text-xl font-semibold mb-8 text-white/90">
            DOKÁŽEME VIAC AKO LEN<br/>
            VYTLAČIŤ...
          </p>
          <a 
            href="/produkty" 
            className="inline-block bg-white text-black px-12 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
          >
            Eshop
          </a>
          <p className="mt-8 text-sm text-white/70">slza.sk</p>
        </div>
      </section>

      {/* Hero 2 - Nemo rybka */}
      <section className="bg-[#0087E3] text-white pt-32 pb-16 relative">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h5 className="text-sm md:text-base font-semibold uppercase mb-4 text-white/90">
                DIGITÁLNA A OFSETOVÁ TLAČ
              </h5>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
                Imagine.design.print
              </h2>
              <div className="flex gap-6 justify-center lg:justify-start items-center flex-wrap">
                <a 
                  href="/produkty" 
                  className="bg-white text-[#111518] px-10 py-4 text-lg font-bold rounded-lg hover:bg-gray-100 transition-all inline-block"
                >
                  Eshop
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank"
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
            <div className="flex-shrink-0 lg:flex-[0_0_500px]">
              <img 
                src="/images/nemo.png" 
                alt="Nemo mascot" 
                className="w-full max-w-[400px] lg:max-w-[500px] mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards - Zadarmo doprava atď */}
      <section className="bg-gradient-to-br from-[#0087E3] to-[#0066b3] py-16">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[rgba(45,95,93,0.9)] to-[rgba(45,95,93,0.7)] backdrop-blur-sm rounded-3xl p-8 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5" fill="white"/>
                  <circle cx="18.5" cy="18.5" r="2.5" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Zadarmo doprava</h3>
              <p className="text-sm text-white/90">Pri objednávke nad 50€ a zároveň do 50kg</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-[rgba(45,95,93,0.9)] to-[rgba(45,95,93,0.7)] backdrop-blur-sm rounded-3xl p-8 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 9h6M9 13h6M9 17h4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Grafické práce ZADARMO</h3>
              <p className="text-sm text-white/90">30 minút grafických prác. Možnosť dokúpenia, 29€/hodina.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-[rgba(45,95,93,0.9)] to-[rgba(45,95,93,0.7)] backdrop-blur-sm rounded-3xl p-8 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Podpora 24/7</h3>
              <p className="text-sm text-white/90">Kontaktujte nás kedykoľvek</p>
            </div>

            {/* Card 4 */}
            <div className="bg-gradient-to-br from-[rgba(45,95,93,0.9)] to-[rgba(45,95,93,0.7)] backdrop-blur-sm rounded-3xl p-8 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <circle cx="12" cy="9" r="1.5" fill="white"/>
                  <path d="M12 11v4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">100% Garancia reklamácie</h3>
              <p className="text-sm text-white/90">V prípade nespokojnosti s kvalitou tlače do 150€</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;

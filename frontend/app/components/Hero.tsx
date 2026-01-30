'use client';

import React from 'react';

const Hero = () => {
  return (
    <section className="bg-[#0087E3] text-white pt-40 pb-2 mb-0 relative overflow-visible" id="home">
      <div className="max-w-[1320px] mx-auto px-5 flex flex-col lg:flex-row items-center justify-between min-h-[600px] relative">
        <div className="flex-1 text-left z-[2]">
          <h5 className="text-sm md:text-base font-semibold uppercase mb-[15px] opacity-100 text-white/70">DIGITÁLNA A OFSETOVÁ TLAČ</h5>
          <h1 className="text-3xl md:text-4xl lg:text-[56px] font-black mb-10 leading-tight text-white">Imagine.design.print</h1>
          <div className="flex gap-[30px] justify-start mt-0 items-center">
            <a href="/produkty" className="bg-white text-[#111518] border-none py-[18px] px-10 text-base font-semibold rounded-[5px] cursor-pointer no-underline inline-block transition-all duration-300 hover:bg-[#f0f0f0]">Eshop</a>
            <button className="bg-transparent text-white border-none py-[18px] px-0 text-base font-medium cursor-pointer flex items-center transition-all duration-300 hover:opacity-80">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </button>
          </div>
        </div>
        <div className="flex-[0_0_auto] lg:flex-[0_0_600px] flex items-end justify-end relative z-[1] -mb-[50px] mt-8 lg:mt-0">
          <img src="/images/nemo.png" alt="Nemo mascot" className="w-full max-w-[400px] lg:max-w-[650px] h-auto block" />
        </div>
      </div>
      <div className="bg-[rgba(45,95,93,0.85)] backdrop-blur-[10px] flex flex-col lg:flex-row justify-between items-stretch gap-[20px] lg:gap-[30px] max-w-[1200px] mx-5 lg:mx-auto rounded-[25px] relative z-[3] mt-8 lg:-mt-[60px] mb-10 py-6 lg:py-[35px] px-5 lg:px-10">
        <div className="flex items-start gap-3 lg:gap-5 text-white flex-1 w-full lg:w-auto">
          <div className="flex-shrink-0 w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] flex items-center justify-center">
            <svg width="30" height="30" className="lg:w-[35px] lg:h-[35px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5" fill="white"/>
              <circle cx="18.5" cy="18.5" r="2.5" fill="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xs lg:text-sm font-bold mb-[5px] leading-[1.3] text-white text-left">Zadarmo doprava</h4>
            <p className="text-[10px] lg:text-[11px] leading-[1.5] text-white/80 m-0 text-left">Pri objednávke nad 50€ a zároveň do 50kg</p>
          </div>
        </div>
        <div className="flex items-start gap-3 lg:gap-5 text-white flex-1 w-full lg:w-auto">
          <div className="flex-shrink-0 w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] flex items-center justify-center">
            <svg width="30" height="30" className="lg:w-[35px] lg:h-[35px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 13h6M9 17h4"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xs lg:text-sm font-bold mb-[5px] leading-[1.3] text-white text-left">Grafické práce ZADARMO</h4>
            <p className="text-[10px] lg:text-[11px] leading-[1.5] text-white/80 m-0 text-left">30 minút grafických prác. Možnosť dokúpenia, 29€/hodina.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 lg:gap-5 text-white flex-1 w-full lg:w-auto">
          <div className="flex-shrink-0 w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] flex items-center justify-center">
            <svg width="30" height="30" className="lg:w-[35px] lg:h-[35px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xs lg:text-sm font-bold mb-[5px] leading-[1.3] text-white text-left">Podpora 24/7</h4>
            <p className="text-[10px] lg:text-[11px] leading-[1.5] text-white/80 m-0 text-left">Kontaktujte nás kedykoľvek</p>
          </div>
        </div>
        <div className="flex items-start gap-3 lg:gap-5 text-white flex-1 w-full lg:w-auto">
          <div className="flex-shrink-0 w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] flex items-center justify-center">
            <svg width="30" height="30" className="lg:w-[35px] lg:h-[35px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xs lg:text-sm font-bold mb-[5px] leading-[1.3] text-white text-left">100% Garancie<br/>reklamácie</h4>
            <p className="text-[10px] lg:text-[11px] leading-[1.5] text-white/80 m-0 text-left">V prípade nespokojnosti s<br/>kvalitou tlače do 150€</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

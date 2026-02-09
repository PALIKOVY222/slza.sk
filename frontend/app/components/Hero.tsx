'use client';

import React from 'react';
import LiquidEther from './LiquidEther';

const Hero = () => {
  return (
    <section className="bg-[#0087E3] text-white pt-32 md:pt-40 pb-2 mb-0 relative overflow-visible" id="home">
      {/* LiquidEther animácia na pozadí */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-30">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-[1320px] mx-auto px-5">
        <div className="flex items-center justify-between min-h-[600px] relative">
          <div className="flex-1 text-left z-[2]">
            <h5 className="text-base font-semibold uppercase mb-[15px] text-white/70">DIGITÁLNA A OFSETOVÁ TLAČ</h5>
            <h1 className="text-[56px] font-black mb-10 leading-tight text-white">Imagine.design.print</h1>
            <div className="flex gap-[30px] justify-start items-center">
              <a href="/produkty" className="bg-white text-[#111518] py-[18px] px-10 text-base font-semibold rounded-[5px] inline-block transition-all duration-300 hover:bg-[#f0f0f0]">Eshop</a>
              <a href="/kontakt" className="bg-transparent text-white border-2 border-white py-[16px] px-8 text-base font-semibold rounded-[5px] inline-block transition-all duration-300 hover:bg-white hover:text-[#0087E3]">Kontakt</a>
            </div>
          </div>
          <div className="flex-[0_0_600px] flex items-end justify-end relative z-[1] -mb-[50px]">
            <img src="/images/nemo.png" alt="Nemo mascot" className="w-full max-w-[650px] h-auto block" />
          </div>
        </div>
      </div>

      {/* Mobile Layout - presne ako screenshot */}
      <div className="lg:hidden px-5 text-center relative min-h-[500px] flex flex-col justify-center">
        {/* Maskot vpravo nahoře */}
        <div className="absolute top-0 right-0 w-[200px] z-[1]">
          <img src="/images/nemo.png" alt="Nemo mascot" className="w-full h-auto" />
        </div>
        
        {/* Text content - centrovaný */}
        <div className="relative z-[2] pt-8">
          <h5 className="text-xs font-semibold uppercase mb-4 text-white/90 tracking-wide">DIGITÁLNA A OFSETOVÁ TLAČ</h5>
          <h1 className="text-3xl font-black mb-8 leading-tight text-white">Imagine.design.print</h1>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <a href="/produkty" className="bg-white text-[#111518] py-4 px-12 text-base font-semibold rounded-lg w-full sm:w-auto max-w-[250px] inline-block">Eshop</a>
            <a href="https://instagram.com/slza.print" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/90">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-medium">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Features - 4 karty */}
      <div className="hidden lg:block bg-[rgba(45,95,93,0.85)] backdrop-blur-[10px] max-w-[1200px] mx-auto rounded-[25px] relative z-[3] -mt-[60px] mb-10 py-[35px] px-10">
        <div className="flex justify-between items-stretch gap-[30px]">
          <div className="flex items-start gap-5 text-white flex-1">
            <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5" fill="white"/>
                <circle cx="18.5" cy="18.5" r="2.5" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-[5px] text-white">Zadarmo doprava</h4>
              <p className="text-[11px] text-white/80">Pri objednávke nad 50€ a zároveň do 50kg</p>
            </div>
          </div>
          <div className="flex items-start gap-5 text-white flex-1">
            <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 13h6M9 17h4"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-[5px] text-white">Grafické práce ZADARMO</h4>
              <p className="text-[11px] text-white/80">30 minút grafických prác. Možnosť dokúpenia, 29€/hodina.</p>
            </div>
          </div>
          <div className="flex items-start gap-5 text-white flex-1">
            <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-[5px] text-white">Podpora 24/7</h4>
              <p className="text-[11px] text-white/80">Kontaktujte nás kedykoľvek</p>
            </div>
          </div>
          <div className="flex items-start gap-5 text-white flex-1">
            <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold mb-[5px] text-white">100% Garancie reklamácie</h4>
              <p className="text-[11px] text-white/80">V prípade nespokojnosti s kvalitou tlače do 150€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Features - 1 karta presne ako screenshot */}
      <div className="lg:hidden mx-5 mt-8 mb-6">
        <div className="bg-gradient-to-b from-[#2D5F5D] to-[#1A3938] backdrop-blur-[10px] rounded-[20px] p-6 shadow-lg">
          <div className="flex items-start gap-4 text-white">
            <div className="flex-shrink-0 w-[50px] h-[50px] flex items-center justify-center">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5" fill="white"/>
                <circle cx="18.5" cy="18.5" r="2.5" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold mb-2 text-white">Zadarmo doprava</h4>
              <p className="text-sm text-white/80 leading-relaxed">Pri objednávke nad 50€ a zároveň do 50kg</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

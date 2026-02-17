'use client';

import React from 'react';
import SplitText from './SplitText';

const Hero = () => {
  return (
    <section className="bg-[#0087E3] text-white pt-32 md:pt-40 pb-2 lg:pb-24 mb-0 relative overflow-visible" id="home">
      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-[1320px] mx-auto px-5">
        <div className="flex items-center justify-between min-h-[600px] relative">
          <div className="flex-1 text-left z-[2]">
            <SplitText
              text="DIGITÁLNA A OFSETOVÁ TLAČ"
              className="text-base font-semibold uppercase mb-[15px] text-white/70"
              delay={30}
              duration={1}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="left"
              tag="h5"
            />
            <SplitText
              text="Imagine.design.print"
              className="text-[56px] font-black mb-10 leading-tight text-white"
              delay={50}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="left"
              tag="h1"
            />
            <div className="flex gap-[30px] justify-start items-center">
              <a href="/produkty" className="bg-white text-[#111518] py-[18px] px-10 text-base font-semibold rounded-[5px] inline-block transition-all duration-300 hover:bg-[#f0f0f0]">Eshop</a>
            </div>
          </div>
          <div className="flex-[0_0_600px] flex items-end justify-end relative z-[1] -mb-[50px]">
            <div className="relative fish-delayed">
              <img src="/images/nemo.png" alt="Nemo mascot" className="w-full max-w-[650px] h-auto block" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - presne ako screenshot */}
      <div className="lg:hidden px-5 text-center relative min-h-[500px] flex flex-col justify-center">
        {/* Maskot vpravo nahoře */}
        <div className="absolute top-0 right-0 w-[200px] z-[1] fish-delayed">
          <img src="/images/nemo.png" alt="Nemo mascot" className="w-full h-auto" />
        </div>
        
        {/* Text content - centrovaný */}
        <div className="relative z-[2] pt-24">
          <SplitText
            text="DIGITÁLNA A OFSETOVÁ TLAČ"
            className="text-xs font-semibold uppercase mb-4 text-white/90 tracking-wide"
            delay={30}
            duration={1}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            tag="h5"
          />
          <SplitText
            text="Imagine.design.print"
            className="text-3xl font-black mb-8 leading-tight text-white"
            delay={50}
            duration={1.25}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            tag="h1"
          />
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <a href="/produkty" className="bg-white text-[#111518] py-4 px-12 text-base font-semibold rounded-lg w-full sm:w-auto max-w-[250px] inline-block">Eshop</a>
          </div>
        </div>
      </div>

      {/* Desktop Features - single unified box */}
      <div className="hidden lg:block max-w-[1320px] mx-auto px-5 -mb-16 relative z-10 mt-8">
        <div className="bg-gradient-to-b from-[#2D5F5D] to-[#1A3938] backdrop-blur-[10px] rounded-[20px] p-8 shadow-lg">
          <div className="grid grid-cols-4 gap-8">
            {[
              { icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="white"/><circle cx="18.5" cy="18.5" r="2.5" fill="white"/></svg>), title: 'Zadarmo doprava', desc: 'Pri objednávke nad 50€ a zároveň do 50kg' },
              { icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>), title: 'Grafické práce ZADARMO', desc: '30 minút grafických prác. Možnosť dokúpenia, 29€/hodina.' },
              { icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>), title: 'Podpora 24/7', desc: 'Kontaktujte nás kedykoľvek' },
              { icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>), title: '100% Garancia reklamácie', desc: 'V prípade nespokojnosti s kvalitou tlače do 150€' },
            ].map((item, i) => (
              <div key={i} className="text-center text-white">
                <div className="w-[50px] h-[50px] flex items-center justify-center mx-auto mb-3">{item.icon}</div>
                <h4 className="text-base font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Features - single unified box */}
      <div className="lg:hidden mx-5 mt-8 mb-6">
        <div className="bg-gradient-to-b from-[#2D5F5D] to-[#1A3938] backdrop-blur-[10px] rounded-[20px] p-6 shadow-lg space-y-5">
          {[
            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="white"/><circle cx="18.5" cy="18.5" r="2.5" fill="white"/></svg>), title: 'Zadarmo doprava', desc: 'Pri objednávke nad 50€ a zároveň do 50kg' },
            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>), title: 'Grafické práce ZADARMO', desc: '30 minút grafických prác. Možnosť dokúpenia, 29€/hodina.' },
            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>), title: 'Podpora 24/7', desc: 'Kontaktujte nás kedykoľvek' },
            { icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>), title: '100% Garancia reklamácie', desc: 'V prípade nespokojnosti s kvalitou tlače do 150€' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center text-white">
              <div className="w-[44px] h-[44px] flex items-center justify-center mb-2">{item.icon}</div>
              <div>
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

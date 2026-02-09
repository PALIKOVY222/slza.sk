import React from 'react';

const Kalkulacie = () => {
  return (
    <section className="py-[120px] bg-[#f8f9fa]">
      <div className="max-w-[1320px] mx-auto px-5">
        {/* Desktop verzia */}
        <div className="hidden lg:flex bg-gradient-to-r from-[#5B38ED] via-[#1a1a2e] via-50% to-[#0a0a0f] text-white rounded-[25px] overflow-hidden py-20 px-16 items-center justify-between gap-20">
          <div className="max-w-[600px] text-left z-10">
            <h2 className="text-[58px] font-bold mb-[25px] text-white leading-tight">Kalkulácie</h2>
            <p className="text-base leading-[1.65] mb-[35px] text-white">Veľmi radi Vám pripravíme nezáväznú cenovú ponuku. Kontaktujte nás prostredníctvom formuláru, emailu alebo telefonicky.</p>
            <a href="/kontakt" className="inline-flex items-center gap-[10px] bg-white text-[#111518] px-8 py-4 rounded-lg no-underline text-base font-semibold transition-all duration-300 hover:bg-white/90">
              Formulár
            </a>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <img src="/images/kalkulacie.svg" alt="Kalkulačka" className="max-w-full h-auto max-h-[350px] object-contain" />
          </div>
        </div>

        {/* Mobile verzia - presne ako screenshot */}
        <div className="lg:hidden bg-gradient-to-b from-[#2D2D3F] via-[#1F1F2E] to-[#4B3C8F] text-white rounded-[30px] overflow-hidden p-0 relative">
          {/* Text obsah */}
          <div className="relative z-10 px-8 pt-12 pb-8 text-center">
            <h2 className="text-[40px] font-bold mb-6 text-white leading-tight">Kalkulácie</h2>
            <p className="text-[17px] leading-[1.6] mb-8 text-white/90">
              Veľmi radi Vám pripravíme nezáväznú cenovú ponuku. Kontaktujte nás prostredníctvom formuláru, emailu alebo telefonicky.
            </p>
            <a 
              href="/kontakt" 
              className="inline-block bg-white text-[#1a1a1a] px-12 py-4 rounded-[12px] no-underline text-[17px] font-semibold transition-all duration-300 hover:bg-white/95 mb-8"
            >
              Formulár
            </a>
          </div>

          {/* Ilustrácia kalkulačky na spodku */}
          <div className="relative w-full h-[320px] overflow-hidden">
            <img 
              src="/images/kalkulacie.svg" 
              alt="Kalkulačka" 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kalkulacie;

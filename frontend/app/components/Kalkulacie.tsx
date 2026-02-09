import React from 'react';

const Kalkulacie = () => {
  return (
    <section className="py-[120px] bg-[#f8f9fa]">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="bg-gradient-to-r from-[#5B38ED] via-[#1a1a2e] via-50% to-[#0a0a0f] text-white rounded-[25px] overflow-hidden py-20 px-16 flex items-center justify-between gap-20">
          <div className="max-w-[600px] text-left z-10">
            <h2 className="text-[58px] font-bold mb-[25px] text-white leading-tight">Kalkulácie</h2>
            <p className="text-base leading-[1.65] mb-[35px] text-white">Veľmi radi Vám pripravíme nezáväznú cenovú ponuku. Kontaktujte nás prostredníctvom formuláru, emailu alebo telefonicky.</p>
            <a href="#" className="inline-flex items-center gap-[10px] bg-white text-[#111518] px-8 py-4 rounded-lg no-underline text-base font-semibold transition-all duration-300 hover:bg-white/90">
              Formulár
            </a>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <img src="/images/kalkulacie.svg" alt="Kalkulačka" className="max-w-full h-auto max-h-[350px] object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kalkulacie;

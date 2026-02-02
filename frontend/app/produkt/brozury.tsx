import React from 'react';
import BrozuraCalculator from '../components/BrozuraCalculator';

const BrozuryPage = () => (
  <section className="py-20 bg-white">
    <div className="max-w-[900px] mx-auto px-5">
      <h1 className="text-[35px] font-bold text-[#111518] mb-4">Brožúry</h1>
      <p className="mb-8 text-[#4d5d6d]">Konfigurujte si brožúru podľa svojich predstáv a získajte okamžitú cenu.</p>
      <BrozuraCalculator />
    </div>
  </section>
);

export default BrozuryPage;

'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PlagatyCalculator from '../../components/calculators/PlagatyCalculator';

export default function PlagatyPage() {
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
            <span className="text-white">Plagáty</span>
          </nav>
          <h1 className="text-5xl font-bold text-white mb-4">Plagáty</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Kvalitná tlač plagátov vo viacerých formátoch a materiáloch
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-5">
          <PlagatyCalculator />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#111518] mb-6">Charakteristika</h2>
              <div className="space-y-4 text-[#4d5d6d]">
                <p>
                  Plagáty sú ideálne na propagáciu podujatí, akcií alebo na dekoratívne účely.
                  Vyberte si z viacerých formátov a materiálov podľa vašich potrieb.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Formáty A3, A2, A1</li>
                  <li>Rôzne typy papiera (hladký, lesklý, matný)</li>
                  <li>Gramáž od 120g do 150g</li>
                  <li>Farebná digitálna tlač</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#111518] mb-6">Technické požiadavky</h2>
              <div className="space-y-4 text-[#4d5d6d]">
                <ul className="list-disc list-inside space-y-2">
                  <li>Formát súboru: PDF (s orezom 3mm)</li>
                  <li>Rozlíšenie: minimálne 300 DPI</li>
                  <li>Farebný priestor: CMYK</li>
                  <li>Max. veľkosť súboru: 6 MB</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-[#0087E3] p-4 mt-6">
                  <p className="text-sm font-semibold text-[#111518]">
                    Potrebujete pomoc s prípravou podkladov?
                  </p>
                  <p className="text-sm text-[#4d5d6d] mt-1">
                    Kontaktujte nás na <a href="mailto:info@slza.sk" className="text-[#0087E3] hover:underline">info@slza.sk</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

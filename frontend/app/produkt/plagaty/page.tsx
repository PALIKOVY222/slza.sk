'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PlagatyCalculator from '../../components/calculators/PlagatyCalculator';

export default function PlagatyPage() {
  return (
    <div>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0087E3] pt-48 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">Plagáty</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Tlač plagátov vo formátoch A4 a A3 na kvalitnom papieri.
          </p>
        </div>
      </section>

      {/* ── Product + Calculator ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left – product image + info */}
            <div className="space-y-8">
              {/* Product image */}
              <div className="bg-gray-50 rounded-2xl p-12 flex items-center justify-center min-h-[360px]">
                <img
                  src="/images/plagat.svg"
                  alt="Plagáty – tlač"
                  className="max-w-full max-h-[280px] object-contain"
                />
              </div>

              {/* Short description */}
              <div>
                <p className="text-[#4d5d6d] text-lg leading-relaxed">
                  Plagáty na kvalitnom natieranom papieri – matnom alebo lesklom.
                  Vyberte si gramáž, farebnosť a množstvo v konfigurátore.
                </p>
              </div>

              {/* Feature list */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#111518] mb-4">Parametre</h3>
                <ul className="space-y-3">
                  {[
                    'Formáty A4 a A3',
                    'Natieraný matný aj lesklý papier 115–300 g/m²',
                    'Jednostranná aj obojstranná tlač (farebná / ČB)',
                    'Množstevné zľavy od 10 ks',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#4d5d6d]">
                      <svg
                        className="w-5 h-5 text-[#0087E3] mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right – calculator */}
            <div className="lg:sticky lg:top-8">
              <PlagatyCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech specs ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Technické požiadavky */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#111518] mb-6">
                Technické požiadavky
              </h2>
              <ul className="space-y-4 text-[#4d5d6d]">
                {[
                  ['Formát súboru', 'PDF s orezom 3 mm na každej strane'],
                  ['Rozlíšenie', 'min. 300 DPI (pre ostrý výtlačok)'],
                  ['Farebný priestor', 'CMYK (RGB bude konvertované)'],
                  ['Maximálna veľkosť súboru', '100 MB (alebo zadajte link v poznámke)'],
                  ['Fontky', 'Vložené alebo prevedené na krivky'],
                ].map(([label, value]) => (
                  <li key={label} className="flex gap-3">
                    <svg
                      className="w-5 h-5 text-[#0087E3] mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <span className="font-semibold text-[#111518]">{label}:</span>{' '}
                      {value}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potrebujete pomoc */}
            <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111518] mb-6">
                  Potrebujete pomoc s podkladmi?
                </h2>
                <p className="text-[#4d5d6d] mb-4 leading-relaxed">
                  Ak neviete pripraviť podklady sami, radi vám pomôžeme. Stačí nám zaslať
                  vaše materiály (logá, texty, fotky) a naši grafici pripravia plagát
                  presne podľa vašich predstáv.
                </p>
                <p className="text-[#4d5d6d] mb-6 leading-relaxed">
                  <strong>Kontaktujte nás</strong> a dohodneme cenu za prípravu grafiky individuálne.
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-[#0087E3]">
                <p className="text-sm font-semibold text-[#111518] mb-1">Kontakt</p>
                <p className="text-sm text-[#4d5d6d]">
                  E-mail:{' '}
                  <a href="mailto:info@slza.sk" className="text-[#0087E3] hover:underline font-medium">
                    info@slza.sk
                  </a>
                </p>
                <p className="text-sm text-[#4d5d6d] mt-1">
                  Pondelok – piatok, 9:00 – 17:00
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


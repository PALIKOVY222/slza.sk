'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCalculator from '../../components/ProductCalculator';
import VizitkyCalculator from '../../components/calculators/VizitkyCalculator';
import BanerCalculator from '../../components/calculators/BanerCalculator';
import PeciatkyCalculator from '../../components/calculators/PeciatkyCalculator';
import LetakyCalculator from '../../components/calculators/LetakyCalculator';

// Produktové dáta
const productsData = {
  'baner': {
    title: 'Baner',
    category: 'VEĽKOFORMÁTOVÁ TLAČ',
    description: 'Kvalitné banery pre interiér aj exteriér. Ideálne na prezentácie, akcie a reklamu.',
    image: '/images/banner.svg',
    basePrice: 40,
    options: {
      material: [
        { name: 'Frontlit 440g', price: 0, description: 'Štandardný materiál pre exteriér' },
        { name: 'Backlit 510g', price: 5, description: 'Pre svetelné boxy' },
        { name: 'Banner mesh', price: 3, description: 'Priehľadný, odolný vetru' }
      ],
      size: [
        { name: '100 x 200 cm', price: 0, multiplier: 1 },
        { name: '150 x 300 cm', price: 0, multiplier: 2.25 },
        { name: '200 x 400 cm', price: 0, multiplier: 4 },
        { name: 'Vlastné rozmery', price: 0, multiplier: 1, custom: true }
      ],
      finishing: [
        { name: 'Bez dokončenia', price: 0 },
        { name: 'Kladívka (každých 50cm)', price: 10 },
        { name: 'Zváraný okraj', price: 15 },
        { name: 'Montážne lišty', price: 25 }
      ],
      quantity: [
        { amount: 1, discount: 0 },
        { amount: 3, discount: 5 },
        { amount: 5, discount: 10 },
        { amount: 10, discount: 15 }
      ]
    },
    specs: [
      'Odolný proti UV žiareniu',
      'Vhodný pre interiér aj exteriér',
      'Vysoké rozlíšenie tlače',
      'Expresná výroba možná'
    ]
  },
  'nalepky': {
    title: 'Nálepky',
    category: 'MALOFORMÁTOVÁ TLAČ',
    description: 'Samolepky a nálepky na rôzne povrchy. Ideálne pre branding, produkty, okná a vozidlá.',
    image: '/images/sticker.svg',
    sizeUnit: 'mm',
    sizeMin: 5,
    sizeMax: 1000,
    quantityInput: true,
    defaultQuantity: 1,
    // Plotbase-like empirické ceny (bez DPH) pre "bez výrezu" a bez laminácie.
    // Hodnoty sú celková cena objednávky (nie €/ks).
    useTotalPriceTable: true,
    totalPriceByQuantityAndArea: {
      // area cm²: 50×50mm=25, 70×70mm=49, 100×100mm=100, A6(105×148mm)=155.4
      1: { 25: 0.4, 49: 0.57, 100: 0.81, 155.4: 1.2 },
      5: { 25: 2.02, 49: 2.83, 100: 4.04, 155.4: 5.98 },
      10: { 25: 4.04, 49: 5.66, 100: 8.09, 155.4: 8.09 },
      25: { 25: 8.09, 49: 8.09, 100: 8.09, 155.4: 8.1 },
      50: { 25: 8.09, 49: 8.1, 100: 8.11, 155.4: 8.13 },
      100: { 25: 8.11, 49: 8.12, 100: 8.14, 155.4: 8.17 },
      250: { 25: 8.16, 49: 8.19, 100: 8.24, 155.4: 8.32 },
      500: { 25: 8.24, 49: 8.31, 100: 8.4, 155.4: 8.56 }
    },
    usePriceLookup: false,
    options: {
      material: [
        { name: 'Lesklý vinyl', multiplier: 1.0, description: 'Lesklý povrch, štandardný' },
        { name: 'Matný vinyl', multiplier: 1.15, description: 'Matný povrch, elegantný' }
      ],
      lamination: [
        { name: 'Bez laminácie', multiplier: 1.0, description: 'Štandardné prevedenie' },
        { name: 'S lamináciou', multiplier: 1.35, description: 'Extra ochrana proti poškriabaniu' }
      ],
      size: [
        { name: '50 x 50 mm', width: 50, height: 50 },
        { name: '70 x 70 mm', width: 70, height: 70 },
        { name: '100 x 100 mm', width: 100, height: 100 },
        { name: '150 x 150 mm', width: 150, height: 150 },
        { name: '200 x 200 mm', width: 200, height: 200 },
        { name: 'A6 (105 x 148 mm)', width: 105, height: 148 },
        { name: 'A5 (148 x 210 mm)', width: 148, height: 210 },
        { name: 'A4 (210 x 297 mm)', width: 210, height: 297 },
        { name: 'Vlastné rozmery', custom: true }
      ],
      cutting: [
        { name: 'Bez výrezu', multiplier: 1.0, description: 'Bez výrezu / bez dodatočného rezania' },
        { name: 'Na hárku', multiplier: 1.2, description: 'Nálepky na spoločnom hárku' },
        { name: 'Narezané po kusoch', multiplier: 4.0, description: 'Každá nálepka samostatne narezaná (výrazne drahšie)' }
      ],
      quantity: [
        { amount: 1 },
        { amount: 5 },
        { amount: 10 },
        { amount: 25 },
        { amount: 50 },
        { amount: 100 },
        { amount: 250 },
        { amount: 500 }
      ]
    },
    specs: [
      'Odolné voči vode a UV žiareniu',
      'Vysoká kvalita tlače',
      'Expresná výroba do 24h',
      'Vhodné pre interiér aj exteriér'
    ]
  },
  'peciatky': {
    title: 'Pečiatky',
    category: 'KANCELÁRSKE POTREBY',
    description: 'Profesionálne pečiatky pre firmy aj súkromné osoby.',
    image: '/images/trodat_peciatka.svg',
    basePrice: 13,
    options: {
      type: [
        { name: 'Klasická pečiatka', price: 0, description: 'S poduškou' },
        { name: 'Samofarbacia pečiatka', price: 8, description: 'Trodat Printy' },
        { name: 'Razítko', price: 5, description: 'Drevená rúčka' }
      ],
      size: [
        { name: '20 x 20 mm', price: 0, multiplier: 0.8 },
        { name: '30 x 30 mm', price: 0, multiplier: 1 },
        { name: '40 x 40 mm', price: 0, multiplier: 1.3 },
        { name: '50 x 50 mm', price: 0, multiplier: 1.6 }
      ],
      ink: [
        { name: 'Čierna', price: 0 },
        { name: 'Modrá', price: 0 },
        { name: 'Červená', price: 0 },
        { name: 'Zelená', price: 0 }
      ],
      quantity: [
        { amount: 1, discount: 0 },
        { amount: 3, discount: 5 },
        { amount: 5, discount: 10 },
        { amount: 10, discount: 15 }
      ]
    },
    specs: [
      'Rýchla výroba',
      'Kvalitný otlačok',
      'Rôzne veľkosti',
      'Možnosť náhradných podušiek'
    ]
  },
  'letaky': {
    title: 'Letáky',
    category: 'MÁLOFORMÁTOVÁ TLAČ',
    description: 'Letáky pre kampane, eventy a promo. Viac gramáží a formátov od A6 po A3.',
    image: '/images/letaky.svg',
    basePricePerCm2: 0.0035, // základ pre 115g
    sizeUnit: 'mm',
    options: {
      paper: [
        { name: '115g', multiplier: 1.0, description: 'Ekonomický leták' },
        { name: '150g', multiplier: 1.12, description: 'Univerzálny kompromis' },
        { name: '200g', multiplier: 1.25, description: 'Pevnejší papier' },
        { name: '250g', multiplier: 1.38, description: 'Prémiovejší feel' },
        { name: '300g', multiplier: 1.55, description: 'Najpevnejší z ponuky' }
      ],
      size: [
        { name: 'A6 (105 × 148 mm)', width: 105, height: 148 },
        { name: 'DL (99 × 210 mm)', width: 99, height: 210 },
        { name: 'A5 (148 × 210 mm)', width: 148, height: 210 },
        { name: 'A4 (210 × 297 mm)', width: 210, height: 297 },
        { name: 'A3 (297 × 420 mm)', width: 297, height: 420 }
      ],
      quantity: [
        { amount: 50, discount: 0 },
        { amount: 100, discount: 5 },
        { amount: 250, discount: 10 },
        { amount: 500, discount: 15 },
        { amount: 1000, discount: 22 },
        { amount: 2500, discount: 30 }
      ]
    },
    specs: [
      'Digitálna aj ofsetová tlač podľa nákladu',
      'Výber gramáže 115–300g',
      'Formáty A6 až A3 + DL',
      'Možnosť expresného dodania'
    ]
  },
  'vizitky': {
    title: 'Vizitky',
    category: 'MÁLOFORMÁTOVÁ TLAČ',
    description: 'Reprezentatívne vizitky pre vašu firmu alebo osobné použitie.',
    image: '/images/vizitky.svg',
    basePrice: 20,
    options: {
      paper: [
        { name: 'Matný 300g', price: 0, description: 'Štandardný papier' },
        { name: 'Lesklý 350g', price: 2, description: 'Lesklý povrch' },
        { name: 'Recyklovaný 300g', price: 3, description: 'Ekologický' },
        { name: 'Premium 400g', price: 5, description: 'Extra hrubý' }
      ],
      finishing: [
        { name: 'Bez laminovania', price: 0 },
        { name: 'Matné laminovanie', price: 5 },
        { name: 'Lesklé laminovanie', price: 5 },
        { name: 'Soft touch', price: 8 }
      ],
      corners: [
        { name: 'Ostré rohy', price: 0 },
        { name: 'Zaoblené rohy', price: 2 }
      ],
      quantity: [
        { amount: 100, discount: 0 },
        { amount: 250, discount: 8 },
        { amount: 500, discount: 12 },
        { amount: 1000, discount: 18 }
      ]
    },
    specs: [
      'Obojstranná tlač',
      'Rôzne druhy papierov',
      'Expresná výroba',
      'Profesionálne dokončenie'
    ]
  },
  'plagaty': {
    title: 'Plagáty',
    category: 'VEĽKOFORMÁTOVÁ TLAČ',
    description: 'Veľkoformátové plagáty pre reklamu, akcie a prezentácie.',
    image: '/images/plagat.svg',
    basePrice: 25,
    options: {
      paper: [
        { name: 'Biely 135g matný', price: 0, description: 'Štandardný papier' },
        { name: 'Biely 200g lesklý', price: 3, description: 'Lesklý povrch' },
        { name: 'Blue back 150g', price: 4, description: 'Nápisový papier' },
        { name: 'PP fólia', price: 8, description: 'Odolný plastový materiál' }
      ],
      size: [
        { name: 'A3 (297 x 420 mm)', price: 0, multiplier: 0.7 },
        { name: 'A2 (420 x 594 mm)', price: 0, multiplier: 1 },
        { name: 'A1 (594 x 841 mm)', price: 0, multiplier: 1.5 },
        { name: 'A0 (841 x 1189 mm)', price: 0, multiplier: 2.5 },
        { name: 'Vlastné rozmery', price: 0, multiplier: 1, custom: true }
      ],
      lamination: [
        { name: 'Bez laminovania', price: 0 },
        { name: 'Matné laminovanie', price: 8 },
        { name: 'Lesklé laminovanie', price: 8 }
      ],
      quantity: [
        { amount: 1, discount: 0 },
        { amount: 5, discount: 5 },
        { amount: 10, discount: 10 },
        { amount: 25, discount: 15 },
        { amount: 50, discount: 20 }
      ]
    },
    specs: [
      'Vysoká kvalita tlače',
      'Rôzne veľkosti',
      'Možnosť laminácie',
      'Rýchle termíny'
    ]
  }
};

const ProductPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const product = productsData[slug as keyof typeof productsData];
  const [vizitkyPrice, setVizitkyPrice] = useState<number | null>(null);
  const [letakyPrice, setLetakyPrice] = useState<number | null>(null);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Produkt nenájdený</h1>
            <a href="/produkty" className="text-[#0087E3] hover:underline">Späť na produkty</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <span className="text-white">{product.title}</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">{product.title}</h1>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="bg-[#f9f9f9] rounded-2xl p-12 flex items-center justify-center min-h-[500px]">
              <img src={product.image} alt={product.title} className="max-w-full max-h-[400px] object-contain" />
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-[#0087E3] font-semibold mb-2 uppercase">{product.category}</p>
              <h2 className="text-4xl font-bold text-[#111518] mb-4">{product.title}</h2>
              <p className="text-lg text-[#4d5d6d] mb-8 leading-relaxed">{product.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-[#111518] mb-4">Vlastnosti produktu:</h3>
                <ul className="space-y-2">
                  {product.specs.map((spec, index) => (
                    <li key={index} className="flex items-start gap-3 text-[#4d5d6d]">
                      <svg className="w-5 h-5 text-[#0087E3] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#0087E3]">
                  {slug === 'vizitky'
                    ? vizitkyPrice !== null
                      ? `${vizitkyPrice.toFixed(2)} €`
                      : 'Kalkulácia podľa parametrov'
                    : slug === 'letaky'
                      ? letakyPrice !== null
                        ? `${letakyPrice.toFixed(2)} €`
                        : 'Kalkulácia podľa parametrov'
                    : 'basePrice' in product && typeof (product as any).basePrice === 'number'
                      ? `od ${(product as any).basePrice},00 €`
                      : 'Kalkulácia podľa parametrov'}
                </div>
                <span className="text-sm text-[#4d5d6d]">+ DPH</span>
              </div>
            </div>
          </div>

          {/* Calculator Section */}
          {slug === 'vizitky' ? (
            <VizitkyCalculator onPriceChange={(p) => setVizitkyPrice(p.priceExVat)} />
          ) : slug === 'letaky' ? (
            <LetakyCalculator onPriceChange={(p) => setLetakyPrice(p.priceExVat)} />
          ) : slug === 'baner' ? (
            <BanerCalculator />
          ) : slug === 'peciatky' ? (
            <PeciatkyCalculator />
          ) : (
            <ProductCalculator product={product} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductPage;

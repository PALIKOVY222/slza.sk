export const productsData = {
  baner: {
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
  nalepky: {
    title: 'Nálepky',
    category: 'MALOFORMÁTOVÁ TLAČ',
    description: 'Samolepky a nálepky na rôzne povrchy. Ideálne pre branding, produkty, okná a vozidlá.',
    image: '/images/sticker.svg',
    sizeUnit: 'mm',
    sizeMin: 5,
    sizeMax: 1000,
    quantityInput: true,
    defaultQuantity: 1,
    options: {
      material: [
        { name: 'Lesklý vinyl', multiplier: 1.0, description: 'Lesklý povrch, štandardný' },
        { name: 'Matný vinyl', multiplier: 1.15, description: 'Matný povrch, elegantný' }
      ],
      lamination: [
        { name: 'Bez laminácie', multiplier: 1.0, description: 'Štandardné prevedenie' },
        { name: 'Lesklá laminácia', multiplier: 1.0, description: 'Lesklá ochrana tlače' },
        { name: 'Matná laminácia', multiplier: 1.0, description: 'Matná ochrana tlače' }
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
        { name: 'S vyrezaním - dodanie na hárkoch', multiplier: 1.0, description: 'Dodanie na hárkoch (predrez na hárku)' },
        { name: 'S vyrezaním - dodanie po kusoch', multiplier: 1.0, description: 'Dodanie po kusoch (orez + predrez)' }
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
  peciatky: {
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
  letaky: {
    title: 'Letáky',
    category: 'MÁLOFORMÁTOVÁ TLAČ',
    description: 'Letáky pre kampane, eventy a promo. Viac gramáží a formátov od A6 po A3.',
    image: '/images/letaky.svg',
    basePricePerCm2: 0.0035,
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
  vizitky: {
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
  plagaty: {
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

export type ProductsData = typeof productsData;

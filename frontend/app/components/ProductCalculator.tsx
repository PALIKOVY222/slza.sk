'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkUpload, { ArtworkInfo } from './ArtworkUpload';
import AddedToCartModal from './AddedToCartModal';

interface ProductCalculatorProps {
  product: any;
  slug?: string;
}

const ProductCalculator: React.FC<ProductCalculatorProps> = ({ product, slug }) => {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [customSize, setCustomSize] = useState({ width: '', height: '' });
  const [totalPrice, setTotalPrice] = useState(product.basePrice || product.basePricePerCm2 || 0);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkStored, setArtworkStored] = useState<{ id: string; name: string; size: number; type?: string } | null>(null);
  const [showAdded, setShowAdded] = useState(false);
  const [note, setNote] = useState('');

  // Inicializácia prvých možností
  useEffect(() => {
    const initialOptions: any = {};
    Object.keys(product.options).forEach(category => {
      if (category === 'quantity') {
        const defaultQuantity = product.defaultQuantity || product.options[category][0]?.amount || 1;
        initialOptions[category] = { amount: defaultQuantity };
      } else {
        initialOptions[category] = product.options[category][0];
      }
    });
    setSelectedOptions(initialOptions);
  }, [product]);

  const calculatePrice = useCallback(() => {
    if (slug === 'nalepky') {
      return;
    }
    let price = 0;
    let area = 0; // cm²
    const sizeUnit = product.sizeUnit || 'cm';
    const toCm = (value: number) => (sizeUnit === 'mm' ? value / 10 : value);
    const getPricePerCm2 = (amount: number) => {
      const table = product.pricePerCm2ByQuantity || {};
      const entries = Object.entries(table)
        .map(([qty, val]) => ({ qty: Number(qty), val: Number(val) }))
        .filter(entry => Number.isFinite(entry.qty) && Number.isFinite(entry.val))
        .sort((a, b) => a.qty - b.qty);

      if (!entries.length) {
        return 0;
      }

      const exact = entries.find(entry => entry.qty === amount);
      if (exact) {
        return exact.val;
      }

      let lower = [...entries].reverse().find(entry => entry.qty < amount) || entries[0];
      let upper = entries.find(entry => entry.qty > amount) || entries[entries.length - 1];

      if (amount < entries[0].qty && entries.length > 1) {
        lower = entries[0];
        upper = entries[1];
      }

      if (amount > entries[entries.length - 1].qty && entries.length > 1) {
        lower = entries[entries.length - 2];
        upper = entries[entries.length - 1];
      }

      if (lower.qty === upper.qty) {
        return lower.val;
      }

      const logLowerQty = Math.log(lower.qty);
      const logUpperQty = Math.log(upper.qty);
      const logAmount = Math.log(amount);
      const ratio = (logAmount - logLowerQty) / (logUpperQty - logLowerQty);

      const logLowerVal = Math.log(lower.val);
      const logUpperVal = Math.log(upper.val);
      const logInterpolated = logLowerVal + ratio * (logUpperVal - logLowerVal);

      return Math.exp(logInterpolated);
    };
    
    // Získame rozmery
    const sizeOption = selectedOptions['size'];
    if (sizeOption) {
      if (sizeOption.custom && customSize.width && customSize.height) {
        const width = parseFloat(customSize.width);
        const height = parseFloat(customSize.height);
        if (!isNaN(width) && !isNaN(height)) {
          area = toCm(width) * toCm(height);
        }
      } else if (sizeOption.width && sizeOption.height) {
        area = toCm(sizeOption.width) * toCm(sizeOption.height);
      }
    }

    // Použijeme nový cenový systém pre nálepky (s pricePerCm2ByQuantity lookup tabuľkou)
    if (product.useTotalPriceTable && product.totalPriceByQuantityAndArea && area > 0) {
      const quantityOption = selectedOptions['quantity'];
      const amount = Math.max(1, Number(quantityOption?.amount || 1));

      const table: Record<string, Record<string, number>> = product.totalPriceByQuantityAndArea;
      const qtyKeys = Object.keys(table)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);

      const interpolateByArea = (qty: number) => {
        const areaTable = table[String(qty)] || {};
        const points = Object.entries(areaTable)
          .map(([a, v]) => ({ area: Number(a), value: Number(v) }))
          .filter((p) => Number.isFinite(p.area) && Number.isFinite(p.value))
          .sort((a, b) => a.area - b.area);

        if (!points.length) return 0;
        const exact = points.find((p) => p.area === area);
        if (exact) return exact.value;

        const lower = [...points].reverse().find((p) => p.area < area) || points[0];
        const upper = points.find((p) => p.area > area) || points[points.length - 1];
        if (lower.area === upper.area) return lower.value;

        const ratio = (area - lower.area) / (upper.area - lower.area);
        return lower.value + ratio * (upper.value - lower.value);
      };

      const interpolateByQty = () => {
        if (!qtyKeys.length) return 0;
        const exact = qtyKeys.find((q) => q === amount);
        if (exact) return interpolateByArea(exact);

        const lower = [...qtyKeys].reverse().find((q) => q < amount) || qtyKeys[0];
        const upper = qtyKeys.find((q) => q > amount) || qtyKeys[qtyKeys.length - 1];
        if (lower === upper) return interpolateByArea(lower);

        // Interpolate on log-qty axis (prices tend to follow a curve).
        const logLower = Math.log(lower);
        const logUpper = Math.log(upper);
        const logAmount = Math.log(amount);
        const ratio = (logAmount - logLower) / (logUpper - logLower);

        const vLower = interpolateByArea(lower);
        const vUpper = interpolateByArea(upper);
        return vLower + ratio * (vUpper - vLower);
      };

      price = interpolateByQty();

      const materialOption = selectedOptions['material'];
      if (materialOption && materialOption.multiplier) {
        price = price * materialOption.multiplier;
      }

      const laminationOption = selectedOptions['lamination'];
      if (laminationOption && laminationOption.multiplier) {
        price = price * laminationOption.multiplier;
      }

      const cuttingOption = selectedOptions['cutting'];
      if (cuttingOption && cuttingOption.multiplier) {
        price = price * cuttingOption.multiplier;
      }
    }
    if (product.usePriceLookup && product.pricePerCm2ByQuantity && area > 0) {
      const quantityOption = selectedOptions['quantity'];
      const amount = Math.max(1, Number(quantityOption?.amount || 1));

      // Získame cenu za cm² pre dané množstvo (interpolácia medzi bodmi)
      const pricePerCm2 = getPricePerCm2(amount);
      
      // Základná cena = plocha × cena za cm² (pre dané množstvo)
      price = area * pricePerCm2;
      
      // Multiplikátor materiálu
      const materialOption = selectedOptions['material'];
      if (materialOption && materialOption.multiplier) {
        price = price * materialOption.multiplier;
      }
      
      // Multiplikátor laminácie
      const laminationOption = selectedOptions['lamination'];
      if (laminationOption && laminationOption.multiplier) {
        price = price * laminationOption.multiplier;
      }
      
      // Multiplikátor narezania
      const cuttingOption = selectedOptions['cutting'];
      if (cuttingOption && cuttingOption.multiplier) {
        price = price * cuttingOption.multiplier;
      }
      
      // Vynásobíme počtom kusov (lookup tabuľka už obsahuje cenu za kus)
      price = price * amount;
    }
    // Použijeme nový cenový systém pre nálepky (s basePricePerCm2)
    else if (product.basePricePerCm2 && area > 0) {
      // Základná cena = plocha × cena za cm²
      price = area * product.basePricePerCm2;
      
      // Multiplikátor materiálu
      const materialOption = selectedOptions['material'];
      if (materialOption && materialOption.multiplier) {
        price = price * materialOption.multiplier;
      }
      
      // Multiplikátor laminácie
      const laminationOption = selectedOptions['lamination'];
      if (laminationOption && laminationOption.multiplier) {
        price = price * laminationOption.multiplier;
      }
      
      // Multiplikátor narezania
      const cuttingOption = selectedOptions['cutting'];
      if (cuttingOption && cuttingOption.multiplier) {
        price = price * cuttingOption.multiplier;
      }
      
      // Množstevné zľavy a počet kusov
      const quantityOption = selectedOptions['quantity'];
      if (quantityOption) {
        // Aplikujeme zľavu
        const discount = quantityOption.discount || 0;
        price = price * (1 - discount / 100);
        // Vynásobíme počtom kusov
        price = price * quantityOption.amount;
      }
    }
    // Pre ostatné produkty použijeme pôvodný systém (basePrice)
    else if (product.basePrice) {
      price = product.basePrice;
      let multiplier = 1;

      Object.keys(selectedOptions).forEach(category => {
        const option = selectedOptions[category];
        
        if (category === 'quantity') {
          const discount = option.discount || 0;
          price = price * (1 - discount / 100);
          price = price * option.amount;
        } else if (category === 'size' && option.multiplier) {
          multiplier *= option.multiplier;
          
          if (option.custom && customSize.width && customSize.height) {
            const width = parseFloat(customSize.width);
            const height = parseFloat(customSize.height);
            if (!isNaN(width) && !isNaN(height)) {
              const baseArea = 2;
              const customArea = (width / 100) * (height / 100);
              multiplier *= customArea / baseArea;
            }
          }
        } else if (option.price) {
          price += option.price;
        }
      });

      price *= multiplier;
    }

    setTotalPrice(Math.round(price * 100) / 100);
  }, [customSize.height, customSize.width, product, selectedOptions, slug]);

  // Prepočet ceny pri zmene možností
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  // Backend výpočet ceny pre nálepky
  useEffect(() => {
    if (slug !== 'nalepky') return;

    const sizeOption = selectedOptions['size'];
    const quantityOption = selectedOptions['quantity'];

    let widthMm = 0;
    let heightMm = 0;

    const toMm = (value: number) => (product.sizeUnit === 'mm' ? value : value * 10);

    if (sizeOption) {
      if (sizeOption.custom && customSize.width && customSize.height) {
        const w = parseFloat(customSize.width);
        const h = parseFloat(customSize.height);
        if (!Number.isNaN(w) && !Number.isNaN(h)) {
          widthMm = toMm(w);
          heightMm = toMm(h);
        }
      } else if (sizeOption.width && sizeOption.height) {
        widthMm = toMm(sizeOption.width);
        heightMm = toMm(sizeOption.height);
      }
    }

    const amount = Math.max(1, Number(quantityOption?.amount || product.defaultQuantity || 1));

    const materialName = selectedOptions['material']?.name || 'Lesklý vinyl';
    const laminationName = selectedOptions['lamination']?.name || 'Bez laminácie';
    const cuttingName = selectedOptions['cutting']?.name || 'Bez výrezu';

    if (!widthMm || !heightMm || !amount) return;

    const controller = new AbortController();

    async function fetchStickerPrice() {
      try {
        const res = await fetch('/api/sticker-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widthMm,
            heightMm,
            quantity: amount,
            materialName,
            laminationName,
            cuttingName,
          }),
          signal: controller.signal,
        });

        if (!res.ok) return;
        const data = (await res.json()) as { priceExVat: number };
        setTotalPrice(Math.round((data.priceExVat || 0) * 100) / 100);
      } catch (err) {
        if ((err as any).name === 'AbortError') return;
        console.error('Sticker price fetch error', err);
      }
    }

    fetchStickerPrice();

    return () => {
      controller.abort();
    };
  }, [slug, selectedOptions, customSize, product.sizeUnit, product.defaultQuantity]);

  const handleOptionChange = (category: string, option: any) => {
    setSelectedOptions({
      ...selectedOptions,
      [category]: option
    });
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now().toString(),
      productName: product.title,
      productSlug: slug || product.slug,
      options: {
        ...selectedOptions,
        ...(note ? { note } : {}),
        ...(artworkFile
          ? {
              artwork: {
                name: artworkStored?.name || artworkFile.name,
                size: artworkStored?.size || artworkFile.size,
                type: artworkStored?.type,
                fileId: artworkStored?.id
              }
            }
          : {})
      },
      artworkFileName: artworkFile?.name || null,
      quantity: 1,
      price: totalPrice,
      image: product.image
    };

    // Načítanie existujúceho košíka
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));

    setShowAdded(true);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <AddedToCartModal
        open={showAdded}
        productName={product.title}
        onClose={() => setShowAdded(false)}
        onGoToCart={() => router.push('/kosik')}
      />
      <h2 className="text-3xl font-bold text-[#111518] mb-8">Konfigurátor produktu</h2>
      
      <div className="space-y-8">
        {/* Všetky kategórie možností */}
        {Object.keys(product.options).map(category => {
          const options = product.options[category];
          const categoryNames: any = {
            material: 'Materiál',
            paper: 'Papier',
            size: 'Veľkosť',
            type: 'Typ',
            shape: 'Tvar',
            finishing: 'Dokončenie',
            lamination: 'Laminácia',
            cutting: 'Narezanie',
            corners: 'Rohy',
            ink: 'Farba atramentu',
            quantity: 'Množstvo'
          };

          const sizeUnit = product.sizeUnit || 'cm';
          const sizeLabel = sizeUnit === 'mm' ? 'mm' : 'cm';
          const sizeMin = product.sizeMin || (sizeUnit === 'mm' ? 5 : 1);
          const sizeMax = product.sizeMax || (sizeUnit === 'mm' ? 1000 : 500);

          const isSticker = slug === 'nalepky';
          const isStickerDropdowns = isSticker && category !== 'quantity';

          const handleSelectChange = (value: string) => {
            if (category === 'quantity') {
              const amount = Number(value);
              const found = options.find((opt: any) => Number(opt.amount) === amount);
              handleOptionChange(category, found || { amount });
              return;
            }

            const found = options.find((opt: any) => opt.name === value);
            if (found) handleOptionChange(category, found);
          };

          return (
            <div key={category}>
              <h3 className="text-xl font-bold text-[#111518] mb-4">{categoryNames[category]}</h3>

              {category === 'quantity' ? (
                isStickerDropdowns ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#111518] mb-2">Počet kusov</label>
                        <select
                          value={String(selectedOptions[category]?.amount ?? options[0]?.amount ?? 1)}
                          onChange={(e) => handleSelectChange(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                        >
                          {options.map((option: any, index: number) => (
                            <option key={index} value={String(option.amount)}>
                              {option.amount} ks
                            </option>
                          ))}
                        </select>
                      </div>
                      {product.quantityInput && (
                        <div>
                          <label className="block text-sm font-medium text-[#111518] mb-2">Vlastné množstvo</label>
                          <input
                            type="number"
                            min={1}
                            value={selectedOptions[category]?.amount ?? ''}
                            onChange={(e) =>
                              handleOptionChange(category, { amount: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)) })
                            }
                            onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) handleOptionChange(category, { amount: 1 }); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                            placeholder="napr. 100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Pre množstvo - špeciálne zobrazenie s množstevnými zľavami
                  <div className="space-y-4">
                    {product.quantityInput && (
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-[#111518] mb-2">Počet kusov</label>
                        <input
                            type="number"
                            min={1}
                            value={selectedOptions[category]?.amount ?? ''}
                            onChange={(e) =>
                              handleOptionChange(category, { amount: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)) })
                            }
                            onBlur={(e) => { if (!e.target.value || Number(e.target.value) < 1) handleOptionChange(category, { amount: 1 }); }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                            placeholder="napr. 100"
                          />
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-3">
                      {options.map((option: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleOptionChange(category, option)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedOptions[category]?.amount === option.amount
                              ? 'border-[#0087E3] bg-[#0087E3]/5'
                              : 'border-gray-200 hover:border-[#0087E3]/50'
                          }`}
                        >
                          <div className="font-bold text-lg text-[#111518]">{option.amount} ks</div>
                          {option.discount > 0 && (
                            <div className="text-sm text-[#0087E3] font-semibold">-{option.discount}%</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                isStickerDropdowns ? (
                  <div>
                    <select
                      value={selectedOptions[category]?.name ?? options[0]?.name ?? ''}
                      onChange={(e) => handleSelectChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                    >
                      {options.map((option: any, index: number) => (
                        <option key={index} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>

                    {selectedOptions[category]?.description && (
                      <div className="text-sm text-[#4d5d6d] mt-2">
                        {selectedOptions[category]?.description}
                      </div>
                    )}

                    {/* Vlastné rozmery */}
                    {selectedOptions[category]?.custom && category === 'size' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#111518] mb-2">
                              Šírka ({sizeLabel})
                            </label>
                            <input
                              type="number"
                              min={sizeMin}
                              max={sizeMax}
                              value={customSize.width}
                              onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                              placeholder={sizeLabel === 'mm' ? 'napr. 1000' : 'napr. 150'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#111518] mb-2">
                              Výška ({sizeLabel})
                            </label>
                            <input
                              type="number"
                              min={sizeMin}
                              max={sizeMax}
                              value={customSize.height}
                              onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                              placeholder={sizeLabel === 'mm' ? 'napr. 1000' : 'napr. 300'}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Pre ostatné možnosti
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option: any, index: number) => (
                      <div key={index}>
                        <button
                          onClick={() => handleOptionChange(category, option)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedOptions[category]?.name === option.name
                              ? 'border-[#0087E3] bg-[#0087E3]/5'
                              : 'border-gray-200 hover:border-[#0087E3]/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-[#111518]">{option.name}</div>
                              {option.description && (
                                <div className="text-sm text-[#4d5d6d] mt-1">{option.description}</div>
                              )}
                            </div>
                            {option.price > 0 && (
                              <div className="text-[#0087E3] font-semibold ml-2">+{option.price}€</div>
                            )}
                          </div>
                        </button>
                        
                        {/* Vlastné rozmery */}
                        {option.custom && selectedOptions[category]?.custom && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#111518] mb-2">
                                  Šírka ({sizeLabel})
                                </label>
                                <input
                                  type="number"
                                  min={sizeMin}
                                  max={sizeMax}
                                  value={customSize.width}
                                  onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                                  placeholder={sizeLabel === 'mm' ? 'napr. 1000' : 'napr. 150'}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#111518] mb-2">
                                  Výška ({sizeLabel})
                                </label>
                                <input
                                  type="number"
                                  min={sizeMin}
                                  max={sizeMax}
                                  value={customSize.height}
                                  onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                                  placeholder={sizeLabel === 'mm' ? 'napr. 1000' : 'napr. 300'}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Poznámka */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#111518] mb-2">Poznámka</h3>
        <p className="text-sm text-[#4d5d6d] mb-3">
          Špeciálne požiadavky alebo link na súbory (WeTransfer, Úschovna…).
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Vaša poznámka alebo link na podklady..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-[#0087E3] resize-y"
        />
      </div>

      <ArtworkUpload
        info={product.artwork as ArtworkInfo}
        productSlug={slug || product.slug}
        onFileChange={(file, upload) => {
          setArtworkFile(file);
          setArtworkStored(upload || null);
        }}
      />

      {/* Celková cena a tlačidlo */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-sm text-[#4d5d6d] mb-1">Celková cena</div>
            <div className="text-4xl font-bold text-[#0087E3]">{(totalPrice || 0).toFixed(2)} €</div>
            <div className="text-sm text-[#4d5d6d] mt-1">bez DPH</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#0087E3] text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Pridať do košíka
          </button>
        </div>
      </div>

      {/* Informačný box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-[#0087E3] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-[#4d5d6d]">
            <p className="font-semibold text-[#111518] mb-2">Potrebujete pomoc s objednávkou?</p>
            <p>Kontaktujte nás na <a href="tel:0911536671" className="text-[#0087E3] hover:underline">0911 536 671</a> alebo <a href="mailto:slza@slza.sk" className="text-[#0087E3] hover:underline">slza@slza.sk</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCalculator;

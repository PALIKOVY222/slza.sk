'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NewProduct = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'VEĽKOFORMÁTOVÁ TLAČ',
    image: '/images/banner.svg',
    slug: '',
    description: ''
  });
  const [configJson, setConfigJson] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setConfigError(null);
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const newProduct = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price)
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    const storedConfigs = localStorage.getItem('productConfigs');
    const configs = storedConfigs ? JSON.parse(storedConfigs) : {};

    if (configJson.trim()) {
      try {
        const parsed = JSON.parse(configJson);
        configs[formData.slug] = parsed;
      } catch (err) {
        setConfigError('Konfigurácia kalkulačky musí byť platný JSON.');
        return;
      }
    } else {
      configs[formData.slug] = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        image: formData.image,
        basePrice: parseFloat(formData.price) || 0,
        options: {
          quantity: [{ amount: 1 }]
        },
        specs: []
      };
    }

    localStorage.setItem('productConfigs', JSON.stringify(configs));
    
    alert('Produkt bol úspešne pridaný!');
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1400px] mx-auto px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="/admin/dashboard" className="text-[#0087E3] hover:underline">
                ← Späť na dashboard
              </a>
              <span className="text-xl font-bold text-[#111518]">Nový produkt</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-5 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-[#111518] mb-8">Pridať nový produkt</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Názov produktu *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                placeholder="napr. Baner"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Slug (URL adresa) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                placeholder="napr. baner"
              />
              <p className="text-sm text-[#4d5d6d] mt-1">URL: /produkt/{formData.slug || 'slug'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#111518] mb-2">
                  Cena (€) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                  placeholder="40.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111518] mb-2">
                  Kategória *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                >
                  <option>VEĽKOFORMÁTOVÁ TLAČ</option>
                  <option>MÁLOFORMÁTOVÁ TLAČ</option>
                  <option>KANCELÁRSKE POTREBY</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Obrázok (cesta) *
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                placeholder="/images/produkt.svg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Popis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                placeholder="Krátky popis produktu..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Konfigurácia kalkulačky (JSON)
              </label>
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-[#0087E3]"
                placeholder='{"title":"...","options":{...},"specs":[],"artwork":{"description":"...","supportedFormats":["PDF","AI"],"maxFileSizeMb":100}}'
              ></textarea>
              {configError && <div className="text-sm text-red-600 mt-2">{configError}</div>}
              <p className="text-xs text-[#4d5d6d] mt-2">
                Ak necháte prázdne, použijú sa základné nastavenia. Pre univerzálnu kalkulačku
                nastavte "calculatorType": "generic".
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#0087E3] text-white py-4 rounded-lg font-semibold hover:bg-[#006bb3] transition-colors"
              >
                Pridať produkt
              </button>
              <a
                href="/admin/dashboard"
                className="flex-1 bg-gray-200 text-[#111518] py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Zrušiť
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;

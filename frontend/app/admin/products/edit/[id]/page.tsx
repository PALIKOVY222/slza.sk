'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsData } from '../../../../data/productsData';

const EditProduct = () => {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const productId = idParam ? Number(idParam) : null;

  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    price: '',
    category: 'VEĽKOFORMÁTOVÁ TLAČ',
    image: '/images/banner.svg',
    slug: '',
    description: ''
  });
  const [configJson, setConfigJson] = useState('');
  const [configError, setConfigError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find((p: any) => p.id === productId);

    if (!product) {
      setNotFound(true);
      return;
    }

    setFormData({
      id: product.id,
      title: product.title || '',
      price: String(product.price ?? ''),
      category: product.category || 'VEĽKOFORMÁTOVÁ TLAČ',
      image: product.image || '/images/banner.svg',
      slug: product.slug || '',
      description: product.description || ''
    });

    const storedConfigs = localStorage.getItem('productConfigs');
    const configs = storedConfigs ? JSON.parse(storedConfigs) : {};
    const fallback = product.slug && (productsData as any)[product.slug] ? (productsData as any)[product.slug] : null;
    const activeConfig = configs[product.slug] || fallback || null;
    if (activeConfig) {
      setConfigJson(JSON.stringify(activeConfig, null, 2));
    }
  }, [productId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const existing = products.find((p: any) => p.id === formData.id);
    if (!existing) {
      setNotFound(true);
      return;
    }

    const updated = products.map((p: any) => {
      if (p.id !== formData.id) return p;
      return {
        ...p,
        title: formData.title,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
        slug: formData.slug,
        description: formData.description
      };
    });

    localStorage.setItem('products', JSON.stringify(updated));

    if (configJson.trim()) {
      try {
        const parsed = JSON.parse(configJson);
        const storedConfigs = localStorage.getItem('productConfigs');
        const configs = storedConfigs ? JSON.parse(storedConfigs) : {};

        if (existing.slug && existing.slug !== formData.slug) {
          delete configs[existing.slug];
        }
        configs[formData.slug] = parsed;
        localStorage.setItem('productConfigs', JSON.stringify(configs));
      } catch (err) {
        setConfigError('Konfigurácia kalkulačky musí byť platný JSON.');
        return;
      }
    }

    alert('Produkt bol úspešne upravený!');
    router.push('/admin/dashboard');
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <h1 className="text-2xl font-bold text-[#111518] mb-3">Produkt nenájdený</h1>
          <a href="/admin/dashboard" className="text-[#0087E3] hover:underline">
            Späť na dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1400px] mx-auto px-5 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <a href="/admin/dashboard" className="text-[#0087E3] hover:underline">
                ← Späť na dashboard
              </a>
              <span className="text-xl font-bold text-[#111518]">Upraviť produkt</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-5 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-[#111518] mb-8">Upraviť produkt</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">Názov produktu *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">Slug (URL adresa) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
              />
              <p className="text-sm text-[#4d5d6d] mt-1">URL: /produkt/{formData.slug || 'slug'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#111518] mb-2">Cena (€) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111518] mb-2">Kategória *</label>
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
              <label className="block text-sm font-semibold text-[#111518] mb-2">Obrázok (cesta) *</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">Popis</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0087E3]"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111518] mb-2">
                Konfigurácia kalkulačky (JSON)
              </label>
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-[#0087E3]"
              ></textarea>
              {configError && <div className="text-sm text-red-600 mt-2">{configError}</div>}
              <p className="text-xs text-[#4d5d6d] mt-2">
                Upravte kalkulačku, fotky, texty alebo instrukcie pre podklady (pole artwork). Pre
                univerzálnu kalkulačku nastavte "calculatorType": "generic".
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#0087E3] text-white py-4 rounded-lg font-semibold hover:bg-[#006bb3] transition-colors"
              >
                Uložiť zmeny
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

export default EditProduct;

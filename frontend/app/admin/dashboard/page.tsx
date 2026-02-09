'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsData } from '../../data/productsData';

const AdminDashboard = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Kontrola prihlásenia
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Načítanie produktov z localStorage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Inicializácia základných produktov
      const initialProducts = [
        { id: 1, title: 'Baner', price: 40, category: 'VEĽKOFORMÁTOVÁ TLAČ', image: '/images/banner.svg', slug: 'baner' },
        { id: 2, title: 'Nálepky', price: 15, category: 'MÁLOFORMÁTOVÁ TLAČ', image: '/images/sticker.svg', slug: 'nalepky' },
        { id: 3, title: 'Pečiatky', price: 13, category: 'KANCELÁRSKE POTREBY', image: '/images/trodat_peciatka.svg', slug: 'peciatky' },
        { id: 4, title: 'Vizitky', price: 20, category: 'MÁLOFORMÁTOVÁ TLAČ', image: '/images/vizitky.svg', slug: 'vizitky' },
        { id: 5, title: 'Letáky', price: 12, category: 'MÁLOFORMÁTOVÁ TLAČ', image: '/images/letaky.svg', slug: 'letaky' },
        { id: 6, title: 'Plagáty', price: 25, category: 'VEĽKOFORMÁTOVÁ TLAČ', image: '/images/plagat.svg', slug: 'plagaty' }
      ];
      localStorage.setItem('products', JSON.stringify(initialProducts));
      setProducts(initialProducts);
    }

    const storedConfigs = localStorage.getItem('productConfigs');
    if (!storedConfigs) {
      localStorage.setItem('productConfigs', JSON.stringify(productsData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleDelete = (id: number) => {
    if (confirm('Naozaj chcete odstrániť tento produkt?')) {
      const removed = products.find((p) => p.id === id);
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('products', JSON.stringify(updated));

      if (removed?.slug) {
        const storedConfigs = localStorage.getItem('productConfigs');
        if (storedConfigs) {
          const parsed = JSON.parse(storedConfigs) as Record<string, any>;
          delete parsed[removed.slug];
          localStorage.setItem('productConfigs', JSON.stringify(parsed));
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/images/slza_logo.svg" alt="SLZA" className="h-8 sm:h-12" />
              <span className="text-base sm:text-xl font-bold text-[#111518]">Admin</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="/" className="hidden sm:inline text-[#4d5d6d] hover:text-[#0087E3] transition-colors text-sm">
                Zobraziť stránku
              </a>
              <a href="/admin" className="hidden sm:inline text-[#4d5d6d] hover:text-[#0087E3] transition-colors text-sm">
                Objednávky
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Odhlásiť
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4d5d6d] text-xs sm:text-sm mb-1">Celkový počet produktov</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#111518]">{products.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0087E3]/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0087E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4d5d6d] text-xs sm:text-sm mb-1">Objednávky dnes</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#111518]">0</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#4d5d6d] text-xs sm:text-sm mb-1">Tržby tento mesiac</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#111518]">0 €</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111518]">Produkty</h2>
            <a
              href="/admin/products/new"
              className="w-full sm:w-auto text-center bg-[#0087E3] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#006bb3] transition-colors font-semibold text-sm sm:text-base"
            >
              + Pridať produkt
            </a>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y">
            {products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex gap-3">
                  <img src={product.image} alt={product.title} className="w-16 h-16 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#111518] mb-1">{product.title}</h3>
                    <p className="text-xs text-[#4d5d6d] mb-2">{product.category}</p>
                    <p className="font-semibold text-[#0087E3] mb-3">{product.price},00 €</p>
                    <div className="flex gap-2">
                      <a
                        href={`/admin/products/edit/${product.id}`}
                        className="flex-1 text-center text-[#0087E3] border border-[#0087E3] px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Upraviť
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 text-center text-white bg-red-600 px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Odstrániť
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111518]">Obrázok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111518]">Názov</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111518]">Kategória</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111518]">Cena</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111518]">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img src={product.image} alt={product.title} className="w-16 h-16 object-contain" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#111518]">{product.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#4d5d6d]">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#0087E3]">{product.price},00 €</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/products/edit/${product.id}`}
                          className="text-[#0087E3] hover:underline text-sm font-medium"
                        >
                          Upraviť
                        </a>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Odstrániť
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

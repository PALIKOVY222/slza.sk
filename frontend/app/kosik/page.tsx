'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CartItem {
  id: string;
  productName: string;
  options: any;
  quantity: number;
  price: number;
  image: string;
}

const KosikPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    updateCart(updated);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updated);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const order = {
      items: cartItems,
      customer: customerInfo,
      total: calculateTotal(),
      date: new Date().toISOString()
    };

    console.log('Objednávka:', order);
    alert('Objednávka bola úspešne odoslaná! V krátkom čase vás budeme kontaktovať.');
    
    // Vyčistenie košíka
    updateCart([]);
    setCustomerInfo({ name: '', email: '', phone: '', address: '', note: '' });
  };

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-48 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <nav className="text-white/80 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Domov</a>
            <span className="mx-2">/</span>
            <span className="text-white">KOŠÍK</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">Nákupný košík</h1>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-2xl font-bold text-[#111518] mb-2">Váš košík je prázdny</h2>
              <p className="text-[#4d5d6d] mb-8">Pridajte produkty do košíka a pokračujte v nákupe.</p>
              <a href="/produkty" className="inline-block bg-[#0087E3] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#006bb3] transition-colors">
                Prejsť na produkty
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#111518] mb-6">Položky v košíku</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <div className="flex gap-6">
                        <img src={item.image} alt={item.productName} className="w-24 h-24 object-contain bg-gray-50 rounded-lg" />
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#111518] mb-2">{item.productName}</h3>
                          
                          <div className="space-y-1 mb-4">
                            {Object.entries(item.options).map(([key, value]: any) => {
                              if (key === 'quantity') return null;
                              return (
                                <p key={key} className="text-sm text-[#4d5d6d]">
                                  <span className="font-medium">{key}:</span> {value?.name || value}
                                </p>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] transition-colors"
                              >
                                −
                              </button>
                              <span className="font-semibold text-[#111518] w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#0087E3]">
                                {(item.price * item.quantity).toFixed(2)} €
                              </p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-sm text-red-600 hover:underline mt-1"
                              >
                                Odstrániť
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Form */}
              <div>
                <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
                  <h2 className="text-2xl font-bold text-[#111518] mb-6">Súhrn objednávky</h2>
                  
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-[#4d5d6d]">
                      <span>Medzisúčet:</span>
                      <span className="font-semibold">{calculateTotal().toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d]">
                      <span>DPH (20%):</span>
                      <span className="font-semibold">{(calculateTotal() * 0.2).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-[#111518] pt-3">
                      <span>Celkom:</span>
                      <span className="text-[#0087E3]">{(calculateTotal() * 1.2).toFixed(2)} €</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Meno a priezvisko *"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email *"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Telefón *"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Adresa *"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      ></textarea>
                    </div>
                    <div>
                      <textarea
                        placeholder="Poznámka k objednávke"
                        value={customerInfo.note}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-colors"
                    >
                      Dokončiť objednávku
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KosikPage;

'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CartItem {
  id: string;
  productName: string;
  productSlug?: string;
  options: any;
  quantity: number;
  price: number;
  image: string;
}

const KosikPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatOptionValue = (value: any) => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value.label) return value.label;
      if (typeof value.amount !== 'undefined') return `${value.amount} ks`;
      const parts: string[] = [];
      if (value.width && value.height) parts.push(`${value.width} × ${value.height}`);
      if (value.grammage) parts.push(`${value.grammage}g`);
      if (parts.length) return parts.join(', ');
    }
    try {
      return JSON.stringify(value);
    } catch (err) {
      return '';
    }
  };
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // card, bank_transfer, cash_on_delivery
  const [shippingMethod, setShippingMethod] = useState('packeta'); // packeta, courier, personal_pickup
  const [packetaPoint, setPacketaPoint] = useState<{ id: string; name: string } | null>(null);

  const shippingCosts = {
    packeta: 3.50,
    courier: 5.00,
    personal_pickup: 0
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Auto-fill customer info if user is logged in
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        setCustomerInfo({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || '',
          address: user.company?.address || user.address || '',
          note: ''
        });
      } catch (err) {
        console.error('Failed to parse authUser:', err);
      }
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
    const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = shippingCosts[shippingMethod as keyof typeof shippingCosts];
    return itemsTotal + shipping;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Validate Packeta point selection
      if (shippingMethod === 'packeta' && !packetaPoint) {
        throw new Error('Vyberte výdajné miesto Packeta');
      }

      const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = shippingCosts[shippingMethod as keyof typeof shippingCosts];
      const subtotal = itemsTotal + shippingCost;
      const vatTotal = subtotal * 0.2;
      const total = subtotal + vatTotal;

      // Generate order number first
      const orderNumberRes = await fetch('/api/orders/generate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!orderNumberRes.ok) {
        throw new Error('Nepodarilo sa vygenerovať číslo objednávky.');
      }

      const { orderNumber } = await orderNumberRes.json();

      const uploads: Array<{ fileName: string; mimeType?: string; fileSize?: number; url: string }> = [];

      for (const item of cartItems) {
        const artwork = item.options?.artwork;
        if (artwork?.name && !artwork?.base64) {
          throw new Error('Súbor je príliš veľký na automatické odoslanie. Zmenši ho alebo použi menší súbor.');
        }
        if (artwork?.base64 && artwork?.name) {
          const base64 = String(artwork.base64);
          const stripped = base64.includes(',') ? base64.split(',')[1] : base64;

          const res = await fetch('/api/uploads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: artwork.name,
              base64: stripped,
              mimeType: 'application/pdf',
              productSlug: item.productSlug || item.productName.toLowerCase().replace(/\s+/g, '-'),
              orderNumber
            })
          });

          if (!res.ok) {
            const errPayload = await res.json().catch(() => ({ error: 'Upload failed.' }));
            throw new Error(errPayload.error || 'Nepodarilo sa nahrať súbor do cloudu.');
          }

          const data = (await res.json()) as { url: string; path: string };
          uploads.push({
            fileName: `${orderNumber}_${artwork.name}`,
            mimeType: 'application/pdf',
            fileSize: artwork.size,
            url: data.url
          });
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customer: {
            email: customerInfo.email,
            name: customerInfo.name,
            phone: customerInfo.phone
          },
          billingAddress: {
            name: customerInfo.name,
            street: customerInfo.address
          },
          items: cartItems.map((item) => ({
            productSlug: item.productSlug || item.productName.toLowerCase().replace(/\s+/g, '-'),
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            options: item.options
          })),
          uploads,
          payment: {
            method: paymentMethod,
            status: paymentMethod === 'bank_transfer' ? 'pending' : 'pending'
          },
          shipping: {
            method: shippingMethod,
            cost: shippingCost,
            packetaPointId: packetaPoint?.id,
            packetaPointName: packetaPoint?.name
          },
          totals: {
            subtotal,
            vatTotal,
            total,
            vatRate: 0.2,
            currency: 'EUR'
          },
          note: customerInfo.note
        })
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({ error: 'Order failed.' }));
        throw new Error(errPayload.error || 'Nepodarilo sa odoslať objednávku.');
      }

      alert('Objednávka bola úspešne odoslaná! V krátkom čase vás budeme kontaktovať.');
      updateCart([]);
      setCustomerInfo({ name: '', email: '', phone: '', address: '', note: '' });
    } catch (err) {
      console.error(err);
      setSubmitError((err as Error).message || 'Objednávku sa nepodarilo odoslať. Skúste to prosím znova.');
    } finally {
      setSubmitting(false);
    }
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
                                  <span className="font-medium">{key}:</span> {formatOptionValue(value)}
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
                      <span>Produkty:</span>
                      <span className="font-semibold">{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d]">
                      <span>Doprava:</span>
                      <span className="font-semibold">{shippingCosts[shippingMethod as keyof typeof shippingCosts].toFixed(2)} €</span>
                    </div>
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
                    {/* Doprava */}
                    <div>
                      <label className="block text-sm font-semibold text-[#111518] mb-2">Spôsob dopravy</label>
                      <select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      >
                        <option value="packeta">Packeta - 3,50 €</option>
                        <option value="courier">Kuriér - 5,00 €</option>
                        <option value="personal_pickup">Osobný odber - ZDARMA</option>
                      </select>
                    </div>

                    {shippingMethod === 'packeta' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            // @ts-ignore
                            if (window.Packeta) {
                              // @ts-ignore
                              window.Packeta.Widget.pick('a88a0c1ffc3ba5fe', (point: any) => {
                                if (point) {
                                  setPacketaPoint({ id: point.id, name: point.name });
                                }
                              });
                            } else {
                              alert('Packeta widget nie je načítaný');
                            }
                          }}
                          className="w-full px-4 py-3 border-2 border-[#0087E3] text-[#0087E3] rounded-lg hover:bg-[#0087E3] hover:text-white transition-colors"
                        >
                          {packetaPoint ? `Výdajné miesto: ${packetaPoint.name}` : 'Vybrať výdajné miesto Packeta'}
                        </button>
                      </div>
                    )}

                    {/* Platba */}
                    <div>
                      <label className="block text-sm font-semibold text-[#111518] mb-2">Spôsob platby</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3]"
                      >
                        <option value="card">Platobná karta</option>
                        <option value="bank_transfer">Bankový prevod</option>
                        <option value="cash_on_delivery">Dobierka</option>
                      </select>
                    </div>

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
                      disabled={submitting}
                      className="w-full bg-[#0087E3] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#006bb3] transition-colors"
                    >
                      {submitting ? 'Odosielam…' : 'Dokončiť objednávku'}
                    </button>
                    {submitError && (
                      <div className="text-sm text-red-600 mt-3">{submitError}</div>
                    )}
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

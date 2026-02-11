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
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    vatId: '',
    taxId: '',
    registration: '',
    email: '',
    phone: ''
  });
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

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
    console.log('Auth user from localStorage:', authUser);
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        console.log('Parsed user:', user);
        if (user?.id) {
          setAuthUserId(user.id);
          console.log('Set authUserId to:', user.id);
        }
        setCustomerInfo({
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || '',
          address: user.company?.address || user.address || '',
          note: ''
        });
        if (user.company) {
          setCompanyInfo({
            name: user.company.name || '',
            vatId: user.company.vatId || '',
            taxId: user.company.taxId || '',
            registration: user.company.registration || '',
            email: user.company.email || '',
            phone: user.company.phone || ''
          });
        }
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

      const { getArtworkFile, removeArtworkFile } = await import('../../lib/artwork-store');

      for (const item of cartItems) {
        const artwork = item.options?.artwork;
        if (artwork?.fileId && artwork?.name) {
          const storedFile = await getArtworkFile(artwork.fileId);
          if (!storedFile) {
            throw new Error('Podklady sa nenašli. Skúste to prosím znovu.');
          }

          const form = new FormData();
          form.append('file', storedFile);
          form.append('fileName', artwork.name);
          form.append('productSlug', item.productSlug || item.productName.toLowerCase().replace(/\s+/g, '-'));
          form.append('orderNumber', orderNumber);

          const res = await fetch('/api/uploads', {
            method: 'POST',
            body: form
          });

          if (!res.ok) {
            const errPayload = await res.json().catch(() => ({ error: 'Upload failed.' }));
            throw new Error(errPayload.error || 'Nepodarilo sa nahrať súbor do cloudu.');
          }

          const data = (await res.json()) as { url: string; path: string };
          uploads.push({
            fileName: artwork.name,
            mimeType: artwork.type,
            fileSize: artwork.size,
            url: data.url
          });

          await removeArtworkFile(artwork.fileId);
        } else if (artwork?.name) {
          throw new Error('Podklady sa nepodarilo nahrať. Skúste to prosím znovu.');
        }
      }

      console.log('Creating order with authUserId:', authUserId);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customer: {
            email: customerInfo.email,
            name: customerInfo.name,
            phone: customerInfo.phone,
            userId: authUserId || undefined
          },
          company: companyInfo.name ? {
            name: companyInfo.name,
            vatId: companyInfo.vatId,
            taxId: companyInfo.taxId,
            registration: companyInfo.registration,
            email: companyInfo.email,
            phone: companyInfo.phone
          } : undefined,
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
      if (paymentMethod === 'card') {
        const checkoutRes = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              name: item.productName,
              description: Object.entries(item.options)
                .filter(([key]) => key !== 'quantity')
                .map(([key, value]) => `${key}: ${formatOptionValue(value)}`)
                .join(', '),
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            shippingMethod,
            shippingCost: shippingCosts[shippingMethod as keyof typeof shippingCosts],
            packetaPointId: packetaPoint?.id,
            packetaPointName: packetaPoint?.name
          })
        });

        const checkoutData = await checkoutRes.json();
        if (!checkoutRes.ok) {
          throw new Error(checkoutData.details || checkoutData.error || 'Platba zlyhala');
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }

        throw new Error('Checkout URL nebola vrátená');
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
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0087E3] to-[#006bb3] pt-32 sm:pt-40 lg:pt-48 pb-12 sm:pb-16 lg:pb-24 text-center relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">Nákupný košík</h1>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg">Skontrolujte svoju objednávku a dokončite nákup</p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111518] mb-2">Váš košík je prázdny</h2>
              <p className="text-[#4d5d6d] mb-6 sm:mb-8 text-sm sm:text-base">Pridajte produkty do košíka a pokračujte v nákupe.</p>
              <a href="/produkty" className="inline-block bg-[#0087E3] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#006bb3] transition-colors text-sm sm:text-base">
                Prejsť na produkty
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#111518] mb-4 sm:mb-6">Položky v košíku</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                        <img src={item.image} alt={item.productName} className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-gray-50 rounded-lg flex-shrink-0 mx-auto sm:mx-0" />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#111518] mb-2 text-center sm:text-left">{item.productName}</h3>
                          
                          <div className="space-y-1 mb-3 sm:mb-4">
                            {Object.entries(item.options).map(([key, value]: any) => {
                              if (key === 'quantity') return null;
                              return (
                                <p key={key} className="text-xs sm:text-sm text-[#4d5d6d] break-words">
                                  <span className="font-medium">{key}:</span> {formatOptionValue(value)}
                                </p>
                              );
                            })}
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] transition-colors text-base sm:text-lg font-bold"
                              >
                                −
                              </button>
                              <span className="font-semibold text-[#111518] min-w-[40px] text-center text-base sm:text-lg">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#0087E3] transition-colors text-base sm:text-lg font-bold"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-xs sm:text-sm text-red-600 hover:underline font-medium"
                              >
                                Odstrániť
                              </button>
                              <p className="text-xl sm:text-2xl font-bold text-[#0087E3]">
                                {(item.price * item.quantity).toFixed(2)} €
                              </p>
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
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:sticky lg:top-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111518] mb-4 sm:mb-6">Súhrn objednávky</h2>
                  
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>Produkty:</span>
                      <span className="font-semibold">{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>Doprava:</span>
                      <span className="font-semibold">{shippingCosts[shippingMethod as keyof typeof shippingCosts].toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>Medzisúčet:</span>
                      <span className="font-semibold">{calculateTotal().toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-[#4d5d6d] text-sm sm:text-base">
                      <span>DPH (20%):</span>
                      <span className="font-semibold">{(calculateTotal() * 0.2).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-[#111518] pt-2 sm:pt-3">
                      <span>Celkom:</span>
                      <span className="text-[#0087E3]">{(calculateTotal() * 1.2).toFixed(2)} €</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3 sm:space-y-4">
                    {/* Doprava */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#111518] mb-2">Spôsob dopravy</label>
                      <select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
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
                              window.Packeta.Widget.pick('65d49ba1845d78fb', (point: any) => {
                                if (point) {
                                  setPacketaPoint({ id: point.id, name: point.name });
                                }
                              });
                            } else {
                              alert('Packeta widget nie je načítaný');
                            }
                          }}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#0087E3] text-[#0087E3] rounded-lg hover:bg-[#0087E3] hover:text-white transition-colors text-xs sm:text-sm"
                        >
                          {packetaPoint ? `Výdajné miesto: ${packetaPoint.name}` : 'Vybrať výdajné miesto Packeta'}
                        </button>
                      </div>
                    )}

                    {/* Platba */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-[#111518] mb-2">Spôsob platby</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email *"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        required
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder={authUserId ? "Telefón" : "Telefón *"}
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        required={!authUserId}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder={authUserId ? "Adresa" : "Adresa *"}
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        required={!authUserId}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      ></textarea>
                    </div>

                    {/* Company Info Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg hover:border-[#0087E3] transition-colors text-sm sm:text-base text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">Fakturačné údaje firmy (dobrovoľné)</span>
                        </span>
                        <svg className={`w-5 h-5 transition-transform ${showCompanyInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Company Info Fields */}
                    {showCompanyInfo && (
                      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <input
                            type="text"
                            placeholder="Názov firmy"
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="IČ DPH"
                            value={companyInfo.vatId}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, vatId: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                          <input
                            type="text"
                            placeholder="DIČ"
                            value={companyInfo.taxId}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="IČO"
                            value={companyInfo.registration}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, registration: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Email firmy"
                            value={companyInfo.email}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                          <input
                            type="tel"
                            placeholder="Telefón firmy"
                            value={companyInfo.phone}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <textarea
                        placeholder="Poznámka k objednávke"
                        value={customerInfo.note}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0087E3] text-sm sm:text-base"
                      ></textarea>
                    </div>

                    {/* Platobné tlačidlá */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0087E3] to-[#006bb3] text-white py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Odosielam objednávku...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {paymentMethod === 'card' ? 'Zaplatiť kartou' : 'Dokončiť objednávku'}
                        </>
                      )}
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

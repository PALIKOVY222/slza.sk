'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const KontaktPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '' // honeypot
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [token, setToken] = useState('');
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  type TurnstileWindow = Window & { turnstile?: any; onTurnstileSuccess?: (token: string) => void };

  useEffect(() => {
    if (!siteKey) return;
    const w = window as TurnstileWindow;
    w.onTurnstileSuccess = (t: string) => setToken(t);

    const render = () => {
      if (!w.turnstile) return;
      const container = document.getElementById('turnstile-container');
      if (!container) return;
      if (container.childNodes.length === 0) {
        w.turnstile.render('#turnstile-container', {
          sitekey: siteKey,
          callback: (t: string) => w.onTurnstileSuccess?.(t),
        });
      }
    };

    if (w.turnstile) {
      render();
      return;
    }

    const scriptId = 'cf-turnstile-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [siteKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (siteKey && !token) {
      setStatus('error');
      setStatusMessage('Prosím potvrďte, že nie ste robot.');
      return;
    }

    setStatus('sending');
    setStatusMessage('Odosielam…');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Chyba pri odoslaní.');
      }

      setStatus('success');
      setStatusMessage('Správa bola odoslaná. Ďakujeme!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', website: '' });
      setToken('');
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Chyba pri odoslaní.');
    }
  };

  const products = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg',
      scale: 'scale-125',
      slug: 'baner'
    },
    {
      title: 'Nálepky',
      price: 'od 15,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/sticker.svg',
      scale: 'scale-115',
      slug: 'nalepky'
    },
    {
      title: 'Pečiatky',
      price: '13,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/trodat_peciatka.svg',
      scale: 'scale-115',
      slug: 'peciatky'
    },
    {
      title: 'Vizitky',
      price: '20,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/vizitky.svg',
      scale: 'scale-115',
      slug: 'vizitky'
    },
    {
      title: 'Letáky',
      price: 'od 0,35 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/letaky.svg',
      scale: 'scale-115',
      slug: 'letaky'
    },
    {
      title: 'Plagáty',
      price: '25,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/plagat.svg',
      scale: 'scale-115',
      slug: 'plagaty'
    }
  ];

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-48 pb-42 text-center relative">
        <div className="max-w-[1320px] mx-auto px-5">
          <h1 className="text-5xl font-bold text-white">Kontakt</h1>
        </div>
        
        {/* Contact Info Box - overlapping */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5 absolute left-0 right-0 bottom-0 transform translate-y-1/2">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 lg:p-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {/* Phone */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0087E3] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-[#111518]">Telefónne číslo</h3>
                  <a href="tel:+421911536671" className="text-sm sm:text-base text-[#4d5d6d] hover:text-[#0087E3] transition-colors">0911 536 671</a>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0087E3] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-[#111518]">Email</h3>
                  <a href="mailto:slza@slza.sk" className="text-sm sm:text-base text-[#4d5d6d] hover:text-[#0087E3] transition-colors break-all">slza@slza.sk</a>
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0087E3] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-[#111518]">Adresa</h3>
                  <p className="text-sm sm:text-base text-[#4d5d6d]">Hodžova 1160, 031 01</p>
                  <p className="text-sm sm:text-base text-[#4d5d6d]">Liptovský Mikuláš</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="pt-48 sm:pt-56 md:pt-64 lg:pt-72 pb-12 sm:pb-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-5">
          {/* Map and Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="bg-gray-200 rounded-lg overflow-hidden h-[608px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.5!2d19.6!3d49.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDA0JzQ4LjAiTiAxOcKwMzYnMDAuMCJF!5e0!3m2!1sen!2ssk!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-[#111518]">Potrebujete radu ?</h2>
              <p className="text-[#4d5d6d] mb-8">Neváhajte nás kontaktovať, ak máte otázky o produktoch, cenách, alebo chcete poradiť čo ponúkať na vašu udalosť. Volanie za Vás robí zadarmo!</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Meno *"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                  />
                  <input
                    type="text"
                    placeholder="Priezvisko *"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                  />
                  <input
                    type="tel"
                    placeholder="Telefón *"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Predmet *"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3]"
                />

                <textarea
                  placeholder="Správa *"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#0087E3] resize-none"
                ></textarea>

                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  {siteKey && (
                    <div id="turnstile-container" className="min-h-[70px]" />
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-[#0087E3] text-white py-3 px-8 rounded-md font-semibold hover:bg-[#006bb3] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Odosielam…' : 'Odoslať správu'}
                </button>

                {status !== 'idle' && (
                  <div className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {statusMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white" id="products">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="flex justify-between items-start mb-[60px]">
            <div>
              <h2 className="text-[35px] font-bold text-[#111518] mb-[10px]">Produkty</h2>
              <p className="text-base text-[#4d5d6d] leading-[1.65]">vyberte si z našich produktov</p>
            </div>
            <a href="/produkty" className="text-[#0087E3] no-underline text-base font-semibold transition-opacity duration-300 hover:opacity-80">View All</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[50px] justify-items-center">
            {products.map((product) => {
              return (
                <div className="transition-all duration-300 max-w-[350px]" key={product.slug}>
                  <a href={`/produkt/${product.slug}`} className="block">
                    <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
                      <img src={product.image} alt={product.title} className={`w-full h-full object-contain ${product.scale} transition-transform duration-300 hover:scale-110`} />
                    </div>
                  </a>
                  <div className="text-left">
                    <h3 className="text-xl mb-[10px] text-[#111518] font-bold">{product.title}</h3>
                    <a href={`/produkt/${product.slug}`} className="inline-block bg-[#F3F5F7] text-[#111518] py-4 px-6 rounded-[5px] no-underline text-sm font-medium transition-all duration-300 border-none cursor-pointer hover:bg-[#0087E3] hover:text-white">Konfigurovať</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KontaktPage;

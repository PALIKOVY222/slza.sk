'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const KontaktPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Správa odoslaná!');
    setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
  };

  const products = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg',
      scale: 'scale-125'
    },
    {
      title: 'Foldre / zakladače',
      price: '198,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/offset.png',
      scale: 'scale-115'
    },
    {
      title: 'Pečiatky',
      price: '13,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/trodat_peciatka.svg',
      scale: 'scale-115'
    },
    {
      title: 'Vizitky',
      price: '20,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/vizitky.svg',
      scale: 'scale-115'
    }
  ];

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-60 pb-80 text-center relative">
        <div className="max-w-[1320px] mx-auto px-5">
          <nav className="text-white/80 text-sm mb-6">
            <a href="/" className="hover:text-white transition-colors">Domov</a>
            <span className="mx-2">/</span>
            <span className="text-white">KONTAKT</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">Kontakt</h1>
        </div>
        
        {/* Contact Info Box - overlapping */}
        <div className="max-w-[1320px] mx-auto px-5 absolute left-0 right-0 bottom-0 transform translate-y-1/2">
          <div className="bg-white rounded-3xl shadow-2xl p-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Telefónne číslo</h3>
                  <p className="text-[#4d5d6d]">0911 536 671</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Email</h3>
                  <p className="text-[#4d5d6d]">slza@slza.sk</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Adresa</h3>
                  <p className="text-[#4d5d6d]">Hodžova 1160, 031 01</p>
                  <p className="text-[#4d5d6d]">Liptovský Mikuláš</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="pt-64 pb-16 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Telefónne číslo</h3>
                  <p className="text-[#4d5d6d]">0911 536 671</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Email</h3>
                  <p className="text-[#4d5d6d]">slza@slza.sk</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">Adresa</h3>
                  <p className="text-[#4d5d6d]">Hodžova 1160, 031 01</p>
                  <p className="text-[#4d5d6d]">Liptovský Mikuláš</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="bg-gray-200 rounded-lg overflow-hidden h-[500px]">
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
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3]"
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3]"
                  />
                  <input
                    type="tel"
                    placeholder="Your Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3]"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Subject *"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3]"
                />

                <textarea
                  placeholder="Message *"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#009fe3] resize-none"
                ></textarea>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="robot" required className="w-4 h-4" />
                  <label htmlFor="robot" className="text-sm text-[#4d5d6d]">I'm not a robot</label>
                </div>

                <button 
                  type="submit"
                  className="bg-[#009fe3] text-white py-3 px-8 rounded-md font-semibold hover:bg-[#007db5] transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#111518] mb-2">Produkty</h2>
              <p className="text-[#4d5d6d]">Vyberte si z našich produktov!</p>
            </div>
            <a href="/produkty" className="text-[#009fe3] font-semibold hover:opacity-80 transition-opacity">View All</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="bg-[#f9f9f9] h-64 flex items-center justify-center p-4">
                  <img src={product.image} alt={product.title} className={`max-w-full max-h-full object-contain ${product.scale}`} />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 text-[#111518]">{product.title}</h3>
                  <p className="text-xl font-bold text-[#4d5d6d] mb-2">{product.price}</p>
                  <p className="text-xs text-[#999] mb-4 uppercase">{product.category}</p>
                  <a href="/produkty" className="inline-block bg-[#F3F5F7] text-[#111518] py-2 px-4 rounded text-sm font-medium hover:bg-[#009fe3] hover:text-white transition-all">
                    Select options
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KontaktPage;

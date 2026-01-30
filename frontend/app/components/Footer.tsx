'use client';

import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Úspešne ste sa prihlásili!');
        setEmail('');
      } else {
        setMessage(data.error || 'Nepodarilo sa prihlásiť');
      }
    } catch (error) {
      setMessage('Chyba pripojenia. Skúste to znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0f1113] text-white">
      {/* Newsletter Section */}
      <div className="py-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <h2 className="text-3xl font-bold mb-10 text-white">Novinky a špeciálne ponuky!</h2>
          <form onSubmit={handleSubmit} className="flex justify-center gap-3 max-w-[600px] mx-auto">
            <input
              type="email"
              placeholder="Your Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="flex-1 py-4 px-6 border border-white/20 text-base bg-transparent text-white rounded-md placeholder:text-white/50 focus:outline-none focus:border-white/40 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="py-4 px-8 border-none bg-[#0087E3] text-white text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] rounded-md hover:bg-[#006bb3] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PRIHLASOVANIE...' : 'SUBSCRIBE'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('Úspešne') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Links Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-32 max-w-[1100px] mx-auto text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <img src="/images/slza_logo_biele.svg" alt="SLZA Logo" className="h-12 md:h-16" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-[1px]">USEFUL LINKS</h4>
              <ul className="list-none p-0 m-0 space-y-2">
                <li><a href="/" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Domov</a></li>
                <li><a href="/produkty" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Eshop</a></li>
                <li><a href="#blog" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Blog</a></li>
                <li><a href="/kontakt" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-6 text-white uppercase tracking-[1px]">CUSTOM AREA</h4>
              <ul className="list-none p-0 m-0 space-y-2">
                <li><a href="/ucet" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Môj účet</a></li>
                <li><a href="#tracking" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Tracking List</a></li>
                <li><a href="#privacy" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Privacy Policy</a></li>
                <li><a href="/admin" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Admin</a></li>
                <li><a href="/kosik" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Košík</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-[#0087E3] py-6">
        <div className="max-w-[1320px] mx-auto px-5">
          <p className="text-white text-center text-sm m-0">Copyright © 2026 - Tlačiareň SLZA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

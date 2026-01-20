'use client';

import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Prihlásený email: ${email}`);
    setEmail('');
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
              className="flex-1 py-4 px-6 border border-white/20 text-base bg-transparent text-white rounded-md placeholder:text-white/50 focus:outline-none focus:border-white/40"
            />
            <button type="submit" className="py-4 px-8 border-none bg-[#009fe3] text-white text-base font-semibold cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] rounded-md hover:bg-[#007db5]">SUBSCRIBE</button>
          </form>
        </div>
      </div>

      {/* Links Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32 max-w-[1100px] mx-auto">
            <div>
              <img src="/images/slza_logo_biele.svg" alt="SLZA Logo" className="h-50" />
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
                <li><a href="#account" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">My Account</a></li>
                <li><a href="#tracking" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Tracking List</a></li>
                <li><a href="#privacy" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Privacy Policy</a></li>
                <li><a href="#orders" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">Orders</a></li>
                <li><a href="#cart" className="text-white/60 no-underline transition-colors duration-300 text-sm hover:text-white">My Cart</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-[#009fe3] py-6">
        <div className="max-w-[1320px] mx-auto px-5">
          <p className="text-white text-center text-sm m-0">Copyright © 2026 - Tlačiareň SLZA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

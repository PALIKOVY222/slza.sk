'use client';

import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Prihlásený email: ${email}`);
    setEmail('');
  };

  return (
    <section className="py-20 bg-[#E7EBEE] text-center">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-[35px] font-bold mb-10 text-[#111518]">Novinky a špeciálne ponuky!</h2>
          <form onSubmit={handleSubmit} className="flex justify-center gap-0 rounded-[5px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 py-5 px-[25px] border-none text-base bg-white text-[#111518] font-['Poppins',sans-serif] placeholder:text-[#4d5d6d] focus:outline-none"
            />
            <button type="submit" className="py-5 px-[35px] border-none bg-[#0087E3] text-white text-base font-semibold font-['Poppins',sans-serif] cursor-pointer transition-all duration-300 uppercase tracking-[0.5px] hover:bg-[#006bb3]">SUBSCRIBE</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

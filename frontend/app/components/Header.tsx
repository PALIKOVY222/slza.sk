import React from 'react';

const Header = () => {
  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-[1000] py-5">
      <div className="max-w-[1320px] mx-auto px-5 flex justify-between items-center">
        <div className="logo flex-1">
          <img src="/images/slza_logo.svg" alt="SLZA Print" className="h-50 w-auto block" />
        </div>
        <nav className="flex gap-[35px] items-center flex-1 justify-center">
          <a href="/" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Domov</a>
          <a href="/produkty" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Eshop</a>
          <a href="/kontakt" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Kontakt</a>
        </nav>
        <div className="flex gap-5 items-center flex-1 justify-end">
          <button className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white" aria-label="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white" aria-label="User account">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white" aria-label="Shopping cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

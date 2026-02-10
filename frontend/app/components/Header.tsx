'use client';

import React, { useState, useEffect } from 'react';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        setUser(userData);
        // Check if admin - kovac.jr@slza.sk
        setIsAdmin(userData.email === 'kovac.jr@slza.sk');
      } catch (e) {
        console.error('Failed to parse authUser', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    window.location.href = `/produkty?search=${encodeURIComponent(q)}`;
  };

  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-[1000] py-5">
      <div className="max-w-[1320px] mx-auto px-5 flex justify-between items-center">
        <div className="logo flex-1">
          <a href="/" aria-label="Domov" className="inline-flex items-center">
            <img src="/images/slza_logo.svg" alt="SLZA Print" className="h-50 w-auto hidden lg:block" />
            <img src="/images/slza_logo_biele.svg" alt="SLZA Print" className="h-12 w-auto block lg:hidden" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-[35px] items-center flex-1 justify-center">
          <a href="/" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Domov</a>
          <a href="/produkty" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Eshop</a>
          <a href="/kontakt" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Kontakt</a>
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden bg-transparent border-none cursor-pointer p-2 text-white/90 transition-all duration-300 hover:text-white"
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>
        
        <div className="hidden lg:flex gap-5 items-center flex-1 justify-end relative">{/* Desktop icons */}
          <button
            className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {searchOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="absolute right-0 top-12 bg-white text-[#111518] rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 w-[260px]"
            >
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať produkt"
                className="flex-1 outline-none text-sm"
              />
              <button
                type="submit"
                className="text-sm font-semibold text-[#0087E3] hover:text-[#006bb3]"
              >
                Hľadať
              </button>
            </form>
          )}
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="bg-transparent border-none cursor-pointer p-0 text-white/90 transition-all duration-300 hover:text-white flex items-center gap-2"
                aria-label="User menu"
              >
                <span className="text-sm font-medium">Ahoj, {user.firstName}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 top-12 bg-white text-[#111518] rounded-lg shadow-lg py-2 w-[180px] z-50">
                  <a href="/ucet" className="block px-4 py-2 hover:bg-gray-100 text-sm">Môj účet</a>
                  <a href="/kosik" className="block px-4 py-2 hover:bg-gray-100 text-sm">Môj košík</a>
                  {isAdmin && (
                    <a href="/admin" className="block px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-200">Admin</a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 border-none cursor-pointer bg-transparent border-t border-gray-200"
                  >
                    Odhlásiť sa
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white" aria-label="User account">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
          )}
          
          <a href="/kosik" className="bg-transparent border-none cursor-pointer p-0 text-white/70 transition-all duration-300 hover:text-white relative" aria-label="Shopping cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </a>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1a1d21] fixed top-0 left-0 right-0 bottom-0 z-[9999] flex flex-col">
          {/* Logo and Close Button */}
          <div className="flex justify-between items-center px-5 py-5 border-b border-white/10">
            <a href="/" aria-label="Domov" className="inline-flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <img src="/images/slza_logo_biele.svg" alt="SLZA Print" className="h-12 w-auto" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="bg-transparent border-none cursor-pointer p-2 text-white"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          {/* Menu Items */}
          <nav className="flex flex-col px-5 py-6">
            <a href="/" className="text-[#7B5FED] font-bold text-2xl py-4" onClick={() => setMobileMenuOpen(false)}>Domov</a>
            <a href="/produkty" className="text-white font-medium text-xl py-4" onClick={() => setMobileMenuOpen(false)}>Produkty</a>
            <a href="/kontakt" className="text-white font-medium text-xl py-4" onClick={() => setMobileMenuOpen(false)}>Kontakt</a>
            <a href="/kosik" className="text-white font-medium text-xl py-4" onClick={() => setMobileMenuOpen(false)}>Košík</a>
            
            {user ? (
              <>
                <a href="/ucet" className="text-white font-medium text-base py-2 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>Môj účet</a>
                {isAdmin && (
                  <a href="/admin" className="text-white font-medium text-base py-2 border-b border-white/10" onClick={() => setMobileMenuOpen(false)}>Admin</a>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-red-400 font-medium text-base py-2 bg-transparent border-none cursor-pointer"
                >
                  Odhlásiť sa
                </button>
              </>
            ) : (
              <a href="/login" className="text-white font-medium text-base py-2" onClick={() => setMobileMenuOpen(false)}>Prihlásiť sa</a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PromoBanner = () => {
  const [copied, setCopied] = useState(false);
  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('NOVYESHOP');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-full py-2 text-center">
      <div className="inline-flex items-center gap-2 sm:gap-3">
        <a href="/produkty" className="text-xs sm:text-sm font-bold text-black hover:underline">NOVÝ ESHOP</a>
        <span className="text-black/50 text-xs">|</span>
        <span className="text-xs sm:text-sm font-semibold text-black">10% zľava s kódom</span>
        <button onClick={copyCode} className="bg-black/90 text-yellow-400 px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold hover:bg-black transition-colors cursor-pointer border-none">
          {copied ? 'Skopírované!' : 'NOVYESHOP'}
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse authUser', e);
      }
    }
    // Check if admin via adminToken (independent of customer login)
    setIsAdmin(!!localStorage.getItem('adminToken'));
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const closeMenu = () => setMobileMenuOpen(false);

  const mobileMenu = (
    <div style={{ display: mobileMenuOpen ? 'flex' : 'none', position: 'fixed', inset: 0, zIndex: 99999, flexDirection: 'column', background: 'linear-gradient(135deg,#111518 0%,#1a1d21 50%,#111518 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <a href="/" onClick={closeMenu}>
          <img src="/images/slza_logo_biele.svg" alt="SLZA" style={{ height: '48px' }} />
        </a>
        <button onClick={closeMenu} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          &#x2715;
        </button>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px' }}>
        {[{ href: '/', label: 'Domov' }, { href: '/produkty', label: 'Produkty' }, { href: '/kontakt', label: 'Kontakt' }, { href: '/kosik', label: 'Košík' }].map(item => (
          <a key={item.href} href={item.href} onClick={closeMenu} style={{ color: 'white', textDecoration: 'none', fontSize: '28px', fontWeight: 700, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'block' }}>{item.label}</a>
        ))}
      </nav>
      <div style={{ padding: '0 32px 40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0087E3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>{user.firstName?.charAt(0)?.toUpperCase() || 'U'}</div>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/ucet" onClick={closeMenu} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', fontSize: '14px' }}>Môj účet</a>
              {isAdmin && <a href="/admin" onClick={closeMenu} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(0,135,227,0.2)', color: '#0087E3', textDecoration: 'none', fontSize: '14px' }}>Admin</a>}
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Odhlásiť sa</button>
          </>
        ) : (
          <a href="/login" onClick={closeMenu} style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', background: '#0087E3', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Prihlásiť sa</a>
        )}
      </div>
    </div>
  );

  return (
    <>
    <header className="absolute top-0 left-0 right-0 z-[1000]">
      <PromoBanner />
      <div className="max-w-[1320px] mx-auto px-5 flex justify-between items-center py-5">
        <div className="logo flex-1">
          <a href="/" aria-label="Domov" className="inline-flex items-center">
            <img src="/images/slza_logo.svg" alt="SLZA Print" className="h-50 w-auto" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-[35px] items-center flex-1 justify-center">
          <a href="/" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Domov</a>
          <a href="/produkty" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Eshop</a>
          <a href="/kontakt" className="no-underline text-white font-medium text-base transition-all duration-300 opacity-90 hover:opacity-100 hover:-translate-y-0.5">Kontakt</a>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <a href="/kosik" className="p-2 text-white/80 hover:text-white transition-colors" aria-label="Košík">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </a>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            aria-label="Menu"
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        </div>
        
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
      
      {/* Mobile Menu - rendered via portal, see bottom of component */}
    </header>
    {mounted && createPortal(mobileMenu, document.body)}
    </>
  );
};

export default Header;

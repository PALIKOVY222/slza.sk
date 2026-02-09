import React from 'react';

const Kalkulacie = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] text-white rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-white">
              Kalkulácie
            </h2>
            <p className="text-lg md:text-xl mb-10 text-white/90 leading-relaxed">
              Veľmi radi Vám pripravíme nezáväznú cenovú ponuku. Kontaktujte nás prostredníctvom formuláru, emailu alebo telefonicky.
            </p>
            <a 
              href="/kontakt" 
              className="inline-block bg-white text-black px-12 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-lg mb-12"
            >
              Formulár
            </a>
            
            {/* Kalkulačka ilustrácia */}
            <div className="relative max-w-md mx-auto">
              <div className="bg-gradient-to-br from-[#5B38ED] to-[#3B1EBD] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-t-2xl p-4 mb-6">
                  <div className="flex gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                
                {/* Kalkulačka UI */}
                <div className="grid grid-cols-4 gap-3">
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">7</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">8</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">9</button>
                  <button className="bg-[#ff9500] hover:bg-[#ff9500]/90 rounded-xl p-4 text-white font-bold text-xl transition-all">÷</button>
                  
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">4</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">5</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">6</button>
                  <button className="bg-[#ff9500] hover:bg-[#ff9500]/90 rounded-xl p-4 text-white font-bold text-xl transition-all">×</button>
                  
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">1</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">2</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">3</button>
                  <button className="bg-[#ff9500] hover:bg-[#ff9500]/90 rounded-xl p-4 text-white font-bold text-xl transition-all">−</button>
                  
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all col-span-2">0</button>
                  <button className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-white font-bold text-lg transition-all">=</button>
                  <button className="bg-[#ff9500] hover:bg-[#ff9500]/90 rounded-xl p-4 text-white font-bold text-xl transition-all">+</button>
                </div>
              </div>
              
              {/* Osoba vedľa kalkulačky */}
              <div className="absolute -bottom-4 -left-4 md:-left-12">
                <div className="w-24 h-32 md:w-32 md:h-40">
                  <svg viewBox="0 0 100 120" fill="none">
                    {/* Hlava */}
                    <ellipse cx="50" cy="25" rx="18" ry="20" fill="#FDB797"/>
                    {/* Vlasy */}
                    <path d="M32 25c0-12 8-20 18-20s18 8 18 20" fill="#2C3E50"/>
                    {/* Telo */}
                    <rect x="35" y="43" width="30" height="35" rx="5" fill="#4A90E2"/>
                    {/* Ruky */}
                    <rect x="25" y="50" width="10" height="25" rx="5" fill="#FDB797"/>
                    <rect x="65" y="50" width="10" height="25" rx="5" fill="#FDB797"/>
                    {/* Nohavice */}
                    <rect x="38" y="75" width="11" height="30" rx="5" fill="#2C3E50"/>
                    <rect x="51" y="75" width="11" height="30" rx="5" fill="#2C3E50"/>
                    {/* Topánky */}
                    <ellipse cx="43" cy="110" rx="8" ry="5" fill="#34495E"/>
                    <ellipse cx="57" cy="110" rx="8" ry="5" fill="#34495E"/>
                  </svg>
                </div>
              </div>
              
              {/* Lampy */}
              <div className="absolute -top-8 left-0">
                <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                  <line x1="30" y1="0" x2="30" y2="40" stroke="#666" strokeWidth="2"/>
                  <circle cx="30" cy="50" r="15" fill="#FFF" opacity="0.3"/>
                  <circle cx="30" cy="50" r="10" fill="#FFD700"/>
                </svg>
              </div>
              
              <div className="absolute -top-8 right-0">
                <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                  <line x1="30" y1="0" x2="30" y2="40" stroke="#666" strokeWidth="2"/>
                  <circle cx="30" cy="50" r="15" fill="#FFF" opacity="0.3"/>
                  <circle cx="30" cy="50" r="10" fill="#FFD700"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Kalkulacie;

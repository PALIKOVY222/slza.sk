import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#111518] text-white py-[60px_0_30px]">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="grid grid-cols-2 gap-[60px] mb-10">
          <div>
            <h4 className="text-base font-bold mb-[25px] text-white uppercase tracking-[0.5px]">USEFUL LINKS</h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-3"><a href="#home" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Domov</a></li>
              <li className="mb-3"><a href="#products" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Produkty</a></li>
              <li className="mb-3"><a href="#blog" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Blog</a></li>
              <li className="mb-3"><a href="#contact" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-bold mb-[25px] text-white uppercase tracking-[0.5px]">CUSTOM AREA</h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-3"><a href="#account" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">My Account</a></li>
              <li className="mb-3"><a href="#tracking" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Tracking List</a></li>
              <li className="mb-3"><a href="#privacy" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Privacy Policy</a></li>
              <li className="mb-3"><a href="#orders" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">Orders</a></li>
              <li className="mb-3"><a href="#cart" className="text-white/60 no-underline transition-colors duration-300 text-base leading-[1.65] hover:text-[#5B38ED]">My Cart</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-[30px] border-t border-white/10">
          <p className="text-white/50 text-base m-0">Copyright © 2026 - Tlačiareň SLZA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

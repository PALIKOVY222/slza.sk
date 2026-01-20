import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProduktyPage = () => {
  const products = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg',
      scale: 'scale-125'
    },
    {
      title: 'Nálepky',
      price: '198,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/sticker.svg',
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
    },
    {
      title: 'Plagáty',
      price: '25,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/plagat.svg',
      scale: 'scale-115'
    }
  ];

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-[#0087E3] pt-60 pb-20 text-center">
        <div className="max-w-[1320px] mx-auto px-5">
          <nav className="text-white/80 text-sm mb-6">
            <a href="/" className="hover:text-white transition-colors">DOMOV</a>
            <span className="mx-2">/</span>
            <span className="text-white">ESHOP</span>
          </nav>
          <h1 className="text-5xl font-bold text-white">Produkty</h1>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1320px] mx-auto px-5">
          {/* Filter Bar */}
          <div className="flex justify-between items-center mb-10">
            <p className="text-sm text-[#4d5d6d]">SHOWING ALL {products.length} RESULTS</p>
            <select className="py-2 px-4 border border-[#e0e0e0] rounded text-sm text-[#4d5d6d] bg-white">
              <option>Default sorting</option>
              <option>Sort by popularity</option>
              <option>Sort by price: low to high</option>
              <option>Sort by price: high to low</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[50px] justify-items-center">
            {products.map((product, index) => (
              <div className="transition-all duration-300 max-w-[350px]" key={index}>
                <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
                  <img src={product.image} alt={product.title} className={`w-full h-full object-contain ${product.scale} transition-transform duration-300 hover:scale-110`} />
                </div>
                <div className="text-left">
                  <h3 className="text-xl mb-[10px] text-[#111518] font-bold">{product.title}</h3>
                  <div className="text-[0.9rem] font-medium text-[#4d5d6d] mb-3">{product.price}</div>
                  <p className="text-xs text-[#999] mb-4 uppercase tracking-wide">{product.category}</p>
                  <a href="#" className="inline-block bg-[#F3F5F7] text-[#111518] py-4 px-6 rounded-[5px] no-underline text-sm font-medium transition-all duration-300 border-none cursor-pointer hover:bg-[#009fe3] hover:text-white">Select options</a>
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

export default ProduktyPage;

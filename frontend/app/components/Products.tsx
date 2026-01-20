import React from 'react';

const Products = () => {
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
    <section className="py-20 bg-white" id="products">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="flex justify-between items-start mb-[60px]">
          <div>
            <h2 className="text-[35px] font-bold text-[#111518] mb-[10px]">Produkty</h2>
            <p className="text-base text-[#4d5d6d] leading-[1.65]">vyberte si z našich produktov</p>
          </div>
          <a href="/produkty" className="text-[#009fe3] no-underline text-base font-semibold transition-opacity duration-300 hover:opacity-80">View All</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[50px] justify-items-center">
          {products.map((product, index) => (
            <div className="transition-all duration-300 max-w-[350px]" key={index}>
              <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
                <img src={product.image} alt={product.title} className={`w-full h-full object-contain ${product.scale} transition-transform duration-300 hover:scale-110`} />
              </div>
              <div className="text-left">
                <h3 className="text-xl mb-[10px] text-[#111518] font-bold">{product.title}</h3>
                <div className="text-[0.9rem] font-medium text-[#4d5d6d] mb-3">{product.price}</div>
                <a href="#" className="inline-block bg-[#F3F5F7] text-[#111518] py-4 px-6 rounded-[5px] no-underline text-sm font-medium transition-all duration-300 border-none cursor-pointer hover:bg-[#009fe3] hover:text-white">Select options</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;

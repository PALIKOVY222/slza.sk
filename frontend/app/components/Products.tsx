import React from 'react';

const Products = () => {
  const products = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg'
    },
    {
      title: 'Foldre / zakladače',
      price: '198,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/offset.png'
    },
    {
      title: 'Pečiatky',
      price: '13,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/copycentrum.png'
    },
    {
      title: 'Vizitky',
      price: '20,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/offset.png'
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
          <a href="#" className="text-[#5B38ED] no-underline text-base font-semibold transition-opacity duration-300 hover:opacity-80">View All</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {products.map((product, index) => (
            <div className="transition-all duration-300" key={index}>
              <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center p-8 mb-5 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
                <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain scale-115" />
              </div>
              <div className="text-left">
                <h3 className="text-xl mb-[10px] text-[#111518] font-semibold">{product.title}</h3>
                <div className="text-[22px] font-bold text-[#4d5d6d] mb-5">{product.price}</div>
                <a href="#" className="inline-block bg-[#F3F5F7] text-[#111518] py-3 px-[25px] rounded-[5px] no-underline text-sm font-semibold transition-all duration-300 border-none cursor-pointer hover:bg-[#111518] hover:text-white">Select options</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;

import React from 'react';

const Products = () => {
  const products = [
    {
      title: 'Baner',
      price: '40,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/banner.svg',
      scale: 'scale-125',
      slug: 'baner'
    },
    {
      title: 'Nálepky',
      price: 'od 15,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/sticker.svg',
      scale: 'scale-115',
      slug: 'nalepky'
    },
    {
      title: 'Pečiatky',
      price: '13,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/trodat_peciatka.svg',
      scale: 'scale-115',
      slug: 'peciatky'
    },
    {
      title: 'Vizitky',
      price: '20,00 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/vizitky.svg',
      scale: 'scale-115',
      slug: 'vizitky'
    },
    {
      title: 'Letáky',
      price: 'od 0,35 €',
      category: 'MÁLOFORMÁTOVÁ TLAČ',
      image: '/images/letaky.svg',
      scale: 'scale-115',
      slug: 'letaky'
    },
    {
      title: 'Plagáty',
      price: '25,00 €',
      category: 'VEĽKOFORMÁTOVÁ TLAČ',
      image: '/images/plagat.svg',
      scale: 'scale-115',
      slug: 'plagaty'
    }
  ];

  return (
    <section className="py-20 bg-white" id="products">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="flex justify-between items-start mb-[60px]">
          <div>
            <h2 className="text-[35px] font-bold text-[#111518] mb-[10px]">Produkty</h2>
            <p className="text-base text-Z#4d5d6d] leading-[1.65]">vyberte si z našich produktov</p>
          </div>
          <a href="/produkty" className="text-[#009fe3] no-underline text-base font-semibold transition-opacity duration-300 hover:opacity-80">View All</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[50px] justify-items-center">
          {products.map((product) => {
            return (
              <div className="transition-all duration-300 max-w-[350px]" key={product.slug}>
                <a href={`/produkt/${product.slug}`} className="block">
                  <div className="bg-[#f9f9f9] rounded-[15px] h-[320px] flex items-center justify-center mb-8 shadow-[0_2px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden">
                    <img src={product.image} alt={product.title} className={`w-full h-full object-contain ${product.scale} transition-transform duration-300 hover:scale-110`} />
                  </div>
                </a>
                <div className="text-left">
                  <h3 className="text-xl mb-[10px] text-[#111518] font-bold">{product.title}</h3>
                  <a href={`/produkt/${product.slug}`} className="inline-block bg-[#F3F5F7] text-[#111518] py-4 px-6 rounded-[5px] no-underline text-sm font-medium transition-all duration-300 border-none cursor-pointer hover:bg-[#0087E3] hover:text-white">Konfigurovať</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Products;

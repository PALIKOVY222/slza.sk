import React from 'react';

const Services = () => {
  const services = [
    {
      title: 'Ofsetová tlač',
      image: '/images/offset.png',
      link: '#',
      bgColor: 'hover:bg-[#FFD166]'
    },
    {
      title: 'Copycentrum',
      image: '/images/copycentrum.png',
      link: '#',
      bgColor: 'hover:bg-[#5B38ED]'
    },
    {
      title: 'Veľkoformátová tlač',
      image: '/images/ploter.png',
      link: '#',
      bgColor: 'hover:bg-[#00A896]'
    },
    {
      title: 'Grafický dizajn',
      image: '/images/graficky_dizajn.png',
      link: '#',
      bgColor: 'hover:bg-[#111518]'
    }
  ];

  return (
    <section className="pt-24 lg:pt-32 pb-12 lg:pb-20 bg-[#f8f9fa]" id="services">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <a href={services[0].link} className={`bg-white rounded-[15px] no-underline flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden p-[50px] justify-between group ${services[0].bgColor}`} key={0}>
            <h5 className="text-[28px] font-bold text-[#111518] m-0 mb-[30px] transition-colors duration-300 group-hover:text-white">{services[0].title}</h5>
            <div className="w-full h-auto flex items-end justify-center">
              <img src={services[0].image} alt={services[0].title} className="max-w-full h-auto max-h-[400px] object-contain" />
            </div>
          </a>
          <div className="flex flex-col gap-5">
            <a href={services[1].link} className={`bg-white rounded-[15px] no-underline flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden p-10 justify-between min-h-[250px] group ${services[1].bgColor}`} key={1}>
              <h5 className="text-[22px] font-bold text-[#111518] m-0 mb-5 transition-colors duration-300 group-hover:text-white">{services[1].title}</h5>
              <div className="w-full h-auto flex items-end justify-center mt-auto">
                <img src={services[1].image} alt={services[1].title} className="max-w-full h-auto max-h-[200px] object-contain" />
              </div>
            </a>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <a href={services[2].link} className={`bg-white rounded-[15px] no-underline flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden p-[30px] justify-between min-h-[250px] group ${services[2].bgColor}`} key={2}>
                <h5 className="text-lg font-bold text-[#111518] m-0 mb-5 transition-colors duration-300 group-hover:text-white">{services[2].title}</h5>
                <div className="w-full h-auto flex items-end justify-center mt-auto">
                  <img src={services[2].image} alt={services[2].title} className="max-w-full h-auto max-h-[150px] object-contain" />
                </div>
              </a>
              <a href={services[3].link} className={`bg-white rounded-[15px] no-underline flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden p-[30px] justify-between min-h-[250px] group ${services[3].bgColor}`} key={3}>
                <h5 className="text-lg font-bold text-[#111518] m-0 mb-5 transition-colors duration-300 group-hover:text-white">{services[3].title}</h5>
                <div className="w-full h-auto flex items-end justify-center mt-auto">
                  <img src={services[3].image} alt={services[3].title} className="max-w-full h-auto max-h-[150px] object-contain" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;

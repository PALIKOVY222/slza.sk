import React from 'react';

const About = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Špeciálne ponuky',
      description: 'Ponúkame individuálne špeciálne ponuky prispôsobené jedinečným potrebám každého zákazníka.'
    },
    {
      icon: '✓',
      title: 'Realizujeme',
      description: 'Sme tu pre vás už viac ako 25 rokov, aby sme naplnili vaše vízie, priania a zabezpečili vašu spokojnosť s výsledkom!'
    },
    {
      icon: '⭐',
      title: 'Referencie',
      description: 'Realizovali sme propagačné materiály pre významné značky ako Samsung, Hyundai, Danone a ďalšie.'
    }
  ];

  return (
    <>
      <section className="py-0 bg-[#111518] text-white relative min-h-[800px] md:min-h-[700px] flex items-center" id="about">
        <div className="absolute inset-0 z-0">
          <img src="/images/portrait-makeup.jpg" alt="Background" className="w-full h-full object-cover opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
        </div>
        <div className="max-w-[1320px] mx-auto px-5 relative z-10 w-full py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
            <div className="flex-1 order-2 lg:order-1">
              <div className="invisible lg:visible">
                <div className="w-full h-auto"></div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-4xl md:text-[50px] font-bold mb-[30px] text-white">Tlačiareň SLZA</h2>
              <div className="mb-[35px]">
                <p className="text-xl font-semibold mb-[10px] text-white leading-[1.65]">OD VIZITKY PO KNIHU</p>
                <p className="text-xl font-semibold mb-[10px] text-white leading-[1.65]">DODÁME ZÁKAZKU AJ DO 24 HODÍN</p>
                <p className="text-xl font-semibold mb-[10px] text-white leading-[1.65]">DOKÁŽEME VIAC AKO LEN VYTLAČIŤ...</p>
              </div>
              <a href="/produkty" className="inline-block bg-[#F3F5F7] text-[#111518] py-5 px-[35px] rounded-[5px] no-underline text-base font-semibold transition-all duration-300 hover:bg-[#009fe3] hover:text-white">Eshop</a>
            </div>
          </div>
        </div>
      </section>
        
      {/* Features Section */}
      <section className="bg-white py-50">
        <div className="max-w-[1320px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div className="text-center" key={index}>
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">{feature.icon}</span>
                </div>
                <h5 className="text-lg font-bold mb-4 text-black">{feature.title}</h5>
                <p className="text-[#4d5d6d] leading-[1.65] text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

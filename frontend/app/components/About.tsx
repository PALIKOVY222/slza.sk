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
    <section className="pt-20 pb-0 bg-[#111518] text-white" id="about">
      <div className="max-w-[1320px] mx-auto px-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20 pb-20">
          <div className="flex-[0_0_auto] lg:flex-[0_0_400px] w-full max-w-[400px]">
            <img src="/images/nemo.png" alt="Tlačiareň SLZA Art" className="w-full h-auto block" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-[35px] font-bold mb-[30px] text-white">Tlačiareň SLZA</h2>
            <div className="mb-[35px]">
              <p className="text-base font-semibold mb-[10px] text-white leading-[1.65]">OD VIZITKY PO KNIHU</p>
              <p className="text-base font-semibold mb-[10px] text-white leading-[1.65]">DODÁME ZÁKAZKU AJ DO 24 HODÍN</p>
              <p className="text-base font-semibold mb-[10px] text-white leading-[1.65]">DOKÁŽEME VIAC AKO LEN VYTLAČIŤ...</p>
            </div>
            <a href="#" className="inline-block bg-[#F3F5F7] text-[#111518] py-5 px-[35px] rounded-[5px] no-underline text-base font-semibold transition-all duration-300 hover:bg-[#5B38ED] hover:text-white">Eshop</a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-white/10">
          {features.map((feature, index) => (
            <div className="py-[60px] px-10 text-center border-r border-white/10 transition-all duration-300 last:border-r-0 hover:bg-white/[0.03]" key={index}>
              <div className="text-5xl mb-5">{feature.icon}</div>
              <h5 className="text-base font-bold mb-[15px] text-white">{feature.title}</h5>
              <p className="text-white/70 leading-[1.65] text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;

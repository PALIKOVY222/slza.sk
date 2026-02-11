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
      <section className="py-0 bg-[#111518] text-white relative min-h-[700px] lg:min-h-[800px] flex items-end" id="about">
        <div className="absolute inset-0 z-0">
          <img src="/images/portrait-makeup.jpg" alt="Background" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        </div>
        <div className="max-w-[1320px] mx-auto px-5 relative z-10 w-full pb-16 lg:pb-20 pt-[300px] lg:pt-20">
          <div className="text-center lg:text-left lg:max-w-[600px] lg:ml-auto">
            <h2 className="text-4xl md:text-[50px] font-bold mb-6 text-white">Tlačiareň SLZA</h2>
            <div className="mb-8 space-y-3">
              <p className="text-xl md:text-2xl font-bold text-white leading-tight">OD VIZITKY PO <span className="text-yellow-400">KNIHU</span></p>
              <p className="text-xl md:text-2xl font-bold leading-tight"><span className="text-red-500">DODÁME ZÁKAZKU</span> <span className="text-white font-black">AJ DO 24 HODÍN</span></p>
              <p className="text-xl md:text-2xl font-bold leading-tight"><span className="text-red-500">DOKÁŽEME VIAC</span> <span className="text-yellow-400 font-black">AKO LEN VYTLAČIŤ...</span></p>
            </div>
            <a href="/produkty" className="inline-block bg-white text-[#111518] py-4 px-10 rounded-lg no-underline text-base font-semibold transition-all duration-300 hover:bg-[#0087E3] hover:text-white">Eshop</a>
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

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Kalkulacie from './components/Kalkulacie';
import Products from './components/Products';
import About from './components/About';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Services />
      <Kalkulacie />
      <Products />
      <About />
      <Newsletter />
      <Footer />
    </div>
  );
}

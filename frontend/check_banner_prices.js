const data = require('./anwell_banner_prices.json');

console.log('📊 Ukážka cien bannerov (už includujú štandardné očkovanie):\n');

// Small banner
const small = data.find(d => d.width === 500 && d.height === 500 && d.quantity === 1);
console.log('500×500mm 1ks:');
console.log('  Bez DPH:', small.priceWithoutVat.toFixed(2), '€');
console.log('  S DPH:  ', small.priceWithVat.toFixed(2), '€\n');

// Medium banner
const medium = data.find(d => d.width === 1000 && d.height === 1000 && d.quantity === 1);
console.log('1000×1000mm 1ks:');
console.log('  Bez DPH:', medium.priceWithoutVat.toFixed(2), '€');
console.log('  S DPH:  ', medium.priceWithVat.toFixed(2), '€\n');

// Large banner
const large = data.find(d => d.width === 1500 && d.height === 2000 && d.quantity === 1);
console.log('1500×2000mm 1ks:');
console.log('  Bez DPH:', large.priceWithoutVat.toFixed(2), '€');
console.log('  S DPH:  ', large.priceWithVat.toFixed(2), '€\n');

// Bulk
const bulk = data.find(d => d.width === 1000 && d.height === 1000 && d.quantity === 10);
console.log('1000×1000mm 10ks:');
console.log('  Bez DPH:', bulk.priceWithoutVat.toFixed(2), '€');
console.log('  S DPH:  ', bulk.priceWithVat.toFixed(2), '€');
console.log('  Za kus: ', bulk.pricePerPiece.toFixed(2), '€\n');

console.log('✅ Tieto ceny už obsahujú štandardné očkovanie od anwell.sk');
console.log('⚠️  Možnosť +8€ za očkovanie je teda zbytočná a mala by sa odstrániť');

const fs = require('fs');

// Load data
const data = JSON.parse(fs.readFileSync('anwell_banner_prices.json', 'utf8'));

console.log('Total entries:', data.length);

// Find bad entries (1600mm with height >= 2000 and price around 9.68€)
const bad = data.filter(e => e.width === 1600 && e.height >= 2000 && e.priceWithVat < 10);
console.log('Bad entries (1600×2000+ at 9.68€):', bad.length);

// Also check for parsing issues from v5 (500×5000 20ks around 87€)
const suspicious = data.filter(e => e.width === 500 && e.height === 5000 && e.quantity === 20 && e.priceWithVat < 100);
console.log('Suspicious entries (500×5000 20ks):', suspicious.length, suspicious.map(e => e.priceWithVat + '€'));

// Clean data: remove bad 1600mm entries
const clean = data.filter(e => !(e.width === 1600 && e.height >= 2000 && e.priceWithVat < 10));
console.log('Clean entries:', clean.length);

// Save cleaned data
fs.writeFileSync('anwell_banner_prices.json', JSON.stringify(clean, null, 2));
console.log('✅ Cleaned anwell_banner_prices.json');

// Update banner_price_table.json
const priceTable = clean.map((entry, idx) => ({
  id: idx + 1,
  width: entry.width,
  height: entry.height,
  quantity: entry.quantity,
  priceText: entry.priceWithVat.toFixed(2) + ' €',
  priceEur: entry.priceWithVat,
  priceWithoutVat: entry.priceWithoutVat,
  pricePerPiece: entry.pricePerPiece,
  timestamp: new Date().toISOString()
}));

fs.writeFileSync('../banner_price_table.json', JSON.stringify(priceTable, null, 2));
console.log('✅ Updated banner_price_table.json');
console.log('Final count:', priceTable.length, 'entries');

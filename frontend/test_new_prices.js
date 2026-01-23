// Test s novými cenami
const pricePerCm2ByQuantity = {
  10: 0.02413,   
  25: 0.01651,   
  50: 0.01270,   
  100: 0.00953,  
  250: 0.00508,  
  500: 0.00127  
};

console.log('\n🧪 TEST KALKULAČKY S NOVÝMI CENAMI\n');
console.log('═'.repeat(70));

// Test 1: 10ks 5×5cm narezané po kusoch = 24.21€
const area1 = 5 * 5; // 25cm²
const qty1 = 10;
const price1 = area1 * pricePerCm2ByQuantity[qty1] * 1.0 * 1.0 * 4.0 * qty1;
console.log('\nTest 1: 10ks 5×5cm narezané po kusoch');
console.log(`  Vypočítané: ${price1.toFixed(2)}€`);
console.log(`  Plotbase.sk: 24.21€`);
console.log(`  Rozdiel: ${Math.abs(price1 - 24.21).toFixed(2)}€`);
console.log(`  ✓ ${Math.abs(price1 - 24.21) < 1 ? 'PRESNE!' : 'CHYBA'}`);

// Test 2: 500ks 10×10cm hárky = 63.53€
const area2 = 10 * 10; // 100cm²
const qty2 = 500;
const price2 = area2 * pricePerCm2ByQuantity[qty2] * 1.0 * 1.0 * 1.0 * qty2;
console.log('\nTest 2: 500ks 10×10cm na hárku');
console.log(`  Vypočítané: ${price2.toFixed(2)}€`);
console.log(`  Plotbase.sk: 63.53€`);
console.log(`  Rozdiel: ${Math.abs(price2 - 63.53).toFixed(2)}€`);
console.log(`  ✓ ${Math.abs(price2 - 63.53) < 1 ? 'PRESNE!' : 'CHYBA'}`);

// Test 3: Rôzne kombinácie
console.log('\n\n📊 PRÍKLADY CIEN PRE RÔZNE KOMBINÁCIE:\n');

const tests = [
  { width: 5, height: 5, qty: 10, cutting: 1.0, desc: '10ks 5×5cm hárky' },
  { width: 5, height: 5, qty: 10, cutting: 4.0, desc: '10ks 5×5cm po kusoch' },
  { width: 10, height: 10, qty: 100, cutting: 1.0, desc: '100ks 10×10cm hárky' },
  { width: 10, height: 10, qty: 100, cutting: 4.0, desc: '100ks 10×10cm po kusoch' },
  { width: 20, height: 20, qty: 500, cutting: 1.0, desc: '500ks 20×20cm hárky' },
];

tests.forEach(t => {
  const area = t.width * t.height;
  const pricePerCm2 = pricePerCm2ByQuantity[t.qty];
  const total = area * pricePerCm2 * t.cutting * t.qty;
  const perPiece = total / t.qty;
  
  console.log(`  ${t.desc}:`);
  console.log(`    Celkom: ${total.toFixed(2)}€ (${perPiece.toFixed(3)}€/ks)\n`);
});

console.log('\n✨ Testovanie dokončené!\n');

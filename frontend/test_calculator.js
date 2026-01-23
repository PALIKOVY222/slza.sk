// Test kalkulačky nálepiek
const testCases = [
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 10 },
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 25 },
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 50 },
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 100 },
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 250 },
  { width: 10, height: 10, material: 'Lesklý vinyl', lamination: 'Bez laminácie', cutting: 'Na hárku', quantity: 500 },
];

const pricePerCm2ByQuantity = {
  10: 0.00254,   
  25: 0.00215,   
  50: 0.00190,   
  100: 0.00170,  
  250: 0.00145,  
  500: 0.00127  
};

console.log('\n🧪 TESTOVANIE KALKULAČKY NÁLEPIEK\n');
console.log('═'.repeat(70));

testCases.forEach((test, index) => {
  const area = test.width * test.height;
  const pricePerCm2 = pricePerCm2ByQuantity[test.quantity];
  
  // Základná cena
  let price = area * pricePerCm2;
  
  // Materiál (Lesklý = 1.0, Matný = 1.15)
  const materialMultiplier = test.material === 'Matný vinyl' ? 1.15 : 1.0;
  price *= materialMultiplier;
  
  // Laminácia (Bez = 1.0, S lamináciou = 1.35)
  const laminationMultiplier = test.lamination === 'S lamináciou' ? 1.35 : 1.0;
  price *= laminationMultiplier;
  
  // Narezanie (Na hárku = 1.0, Po kusoch = 1.15)
  const cuttingMultiplier = test.cutting === 'Narezané po kusoch' ? 1.15 : 1.0;
  price *= cuttingMultiplier;
  
  // Vynásobiť množstvom
  price *= test.quantity;
  
  const pricePerPiece = price / test.quantity;
  
  console.log(`\nTest ${index + 1}: ${test.quantity}ks ${test.width}×${test.height}cm`);
  console.log(`  Plocha: ${area}cm²`);
  console.log(`  Cena/cm² pre ${test.quantity}ks: ${pricePerCm2.toFixed(5)}€`);
  console.log(`  Materiál: ${test.material} (×${materialMultiplier})`);
  console.log(`  Laminácia: ${test.lamination} (×${laminationMultiplier})`);
  console.log(`  Narezanie: ${test.cutting} (×${cuttingMultiplier})`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  💶 CELKOVÁ CENA: ${price.toFixed(2)}€`);
  console.log(`  📦 Cena za kus: ${pricePerPiece.toFixed(3)}€`);
  
  // Očakávaná cena pre 500ks = 63.53€
  if (test.quantity === 500) {
    const expected = 63.53;
    const diff = Math.abs(price - expected);
    if (diff < 0.5) {
      console.log(`  ✅ SPRÁVNE! (plotbase.sk: ${expected}€)`);
    } else {
      console.log(`  ❌ CHYBA! Očakávané: ${expected}€, rozdiel: ${diff.toFixed(2)}€`);
    }
  }
});

console.log('\n' + '═'.repeat(70));
console.log('\n📊 DEGRESÍVNA CENA (cena za 1 kus pre 10×10cm):\n');
Object.entries(pricePerCm2ByQuantity).forEach(([qty, price]) => {
  const pricePerPiece = 100 * price; // Pre 10×10cm
  console.log(`  ${qty.padStart(3)}ks: ${pricePerPiece.toFixed(3)}€/ks`);
});

console.log('\n✨ Test dokončený!\n');

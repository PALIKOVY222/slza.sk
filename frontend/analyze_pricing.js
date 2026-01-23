/**
 * Manuálne zozbierané ceny z plotbase.sk na vytvorenie vzorca
 */

console.log('🧮 KALIBRÁCIA CENOVÉHO SYSTÉMU PODĽA PLOTBASE.SK\n');
console.log('═'.repeat(80));

// Manuálne overené ceny z plotbase.sk
const knownPrices = [
  // 10ks 5×5cm narezané po kusoch = 24.21€ (od užívateľa)
  { width: 5, height: 5, qty: 10, material: 'vinyl', lamination: false, cutting: 'pieces', price: 24.21 },
  
  // 500ks 10×10cm = 63.53€ (predchádzajúce info)
  { width: 10, height: 10, qty: 500, material: 'vinyl', lamination: false, cutting: 'sheet', price: 63.53 },
  
  // Dopočítame ďalšie hodnoty...
];

console.log('\n📋 ZNÁME CENY Z PLOTBASE.SK:\n');

knownPrices.forEach(p => {
  const area = p.width * p.height;
  const pricePerPiece = p.price / p.qty;
  const pricePerCm2 = pricePerPiece / area;
  
  console.log(`  ${p.qty}ks ${p.width}×${p.height}cm ${p.cutting === 'pieces' ? 'po kusoch' : 'na hárku'}:`);
  console.log(`    Celková cena: ${p.price}€`);
  console.log(`    Cena/kus: ${pricePerPiece.toFixed(3)}€`);
  console.log(`    Cena/cm²: ${pricePerCm2.toFixed(5)}€`);
  console.log(`    Plocha: ${area}cm²\n`);
});

// Analýza vzťahov
console.log('\n🔬 ANALÝZA CENOVÝCH VZŤAHOV:\n');

const p1 = knownPrices[0]; // 10ks 5×5cm narezané = 24.21€
const p2 = knownPrices[1]; // 500ks 10×10cm hárky = 63.53€

const area1 = p1.width * p1.height; // 25cm²
const area2 = p2.width * p2.height; // 100cm²

const pricePerPiece1 = p1.price / p1.qty; // 2.421€
const pricePerPiece2 = p2.price / p2.qty; // 0.127€

const pricePerCm2_1 = pricePerPiece1 / area1; // €/cm²
const pricePerCm2_2 = pricePerPiece2 / area2; // €/cm²

console.log(`  1) 10ks 5×5cm po kusoch: ${pricePerCm2_1.toFixed(5)}€/cm² za kus`);
console.log(`  2) 500ks 10×10cm hárky: ${pricePerCm2_2.toFixed(5)}€/cm² za kus`);

// Vplyv narezania
console.log(`\n  Rozdiel narezanie: ${(pricePerCm2_1 / pricePerCm2_2).toFixed(2)}x`);
console.log(`  (po kusoch je ${((pricePerCm2_1 / pricePerCm2_2 - 1) * 100).toFixed(0)}% drahšie ako hárky)`);

// Vplyv množstva
console.log(`\n  Vplyv množstva:`);
console.log(`    10ks: ${pricePerCm2_1.toFixed(5)}€/cm²`);
console.log(`    500ks: ${pricePerCm2_2.toFixed(5)}€/cm²`);
console.log(`    Pomer: ${(pricePerCm2_1 / pricePerCm2_2).toFixed(2)}x (10ks je ${((pricePerCm2_1 / pricePerCm2_2 - 1) * 100).toFixed(0)}% drahšie)`);

// Extrapolácia vzorca
console.log('\n\n💡 ODVODENÝ VZOREC:\n');
console.log('  cena = plocha(cm²) × základná_cena_za_cm² × multiplikátor_množstva × multiplikátor_narezania');
console.log('');
console.log('  Kde:');

// Vypočítame základnú cenu pre 500ks na hárku (referenčný bod)
const basePricePerCm2 = pricePerCm2_2; // 0.00127€/cm²

console.log(`    základná_cena_za_cm² (pre 500ks hárky) = ${basePricePerCm2.toFixed(5)}€`);

// Multiplikátor množstva (10ks vs 500ks, obe hárky)
// Potrebujeme viac dát...
const qtyMultiplier10 = pricePerCm2_1 / basePricePerCm2;
// Ale toto je skreslené narezaním...

console.log(`    multiplikátor_množstva(10ks) ≈ ${(qtyMultiplier10 / 1.5).toFixed(2)}x (odhad bez narezania)`);
console.log(`    multiplikátor_množstva(500ks) = 1.00x (referenčná)`);

console.log(`    multiplikátor_narezania(hárky) = 1.00x`);
console.log(`    multiplikátor_narezania(po kusoch) ≈ 1.50x (odhad)`);

// Test vzorca
console.log('\n\n🧪 OVERENIE VZORCA:\n');

function calculatePrice(width, height, qty, cutting) {
  const area = width * height;
  const basePrice = 0.00127; // Pre 500ks hárky
  
  // Množstevný multiplikátor (degresívna krivka)
  const qtyMultipliers = {
    10: 19.0,
    25: 13.0,
    50: 10.0,
    100: 7.5,
    250: 4.0,
    500: 1.0
  };
  
  const qtyMult = qtyMultipliers[qty] || 1.0;
  const cuttingMult = cutting === 'pieces' ? 1.5 : 1.0;
  
  return area * basePrice * qtyMult * cuttingMult * qty;
}

console.log('  Test 1: 10ks 5×5cm po kusoch');
const test1 = calculatePrice(5, 5, 10, 'pieces');
console.log(`    Vypočítané: ${test1.toFixed(2)}€`);
console.log(`    Skutočné: 24.21€`);
console.log(`    Rozdiel: ${Math.abs(test1 - 24.21).toFixed(2)}€ (${(Math.abs(test1 - 24.21) / 24.21 * 100).toFixed(1)}%)`);

console.log('\n  Test 2: 500ks 10×10cm hárky');
const test2 = calculatePrice(10, 10, 500, 'sheet');
console.log(`    Vypočítané: ${test2.toFixed(2)}€`);
console.log(`    Skutočné: 63.53€`);
console.log(`    Rozdiel: ${Math.abs(test2 - 63.53).toFixed(2)}€ (${(Math.abs(test2 - 63.53) / 63.53 * 100).toFixed(1)}%)`);

console.log('\n\n📊 ODPORÚČANÁ LOOKUP TABUĽKA (cena/cm² pri rôznych množstvách):\n');

Object.entries({
  10: 19.0,
  25: 13.0,
  50: 10.0,
  100: 7.5,
  250: 4.0,
  500: 1.0
}).forEach(([qty, mult]) => {
  const pricePerCm2 = 0.00127 * mult;
  console.log(`    ${String(qty).padStart(3)}ks: ${pricePerCm2.toFixed(5)}€/cm²`);
});

console.log('\n✨ Analýza dokončená!\n');

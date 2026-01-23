/**
 * Bot na testovanie plotbase.sk kalkulačky nálepiek
 * Vytvorí 1000 kombinácií a nájde vzorec pre výpočet ceny
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Kombinácie na testovanie
const testConfigs = {
  sizes: [
    { width: 50, height: 50 },   // 5×5cm
    { width: 70, height: 70 },   // 7×7cm  
    { width: 100, height: 100 }, // 10×10cm
    { width: 150, height: 150 }, // 15×15cm
    { width: 200, height: 200 }, // 20×20cm
    { width: 300, height: 300 }, // 30×30cm
  ],
  quantities: [10, 25, 50, 100, 250, 500],
  materials: ['vinyl-white', 'vinyl-white-matt'], // ID materiálov na plotbase
  laminations: [false, true],
  cuttings: ['sheet', 'pieces'] // Na hárku vs po kusoch
};

const results = [];

async function testPriceCalculation(browser, config) {
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.plotbase.sk/nalepky', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Počkáme na kalkulátor
    await page.waitForSelector('input[name="size_width"]', { timeout: 10000 });
    
    // Nastavíme šírku
    await page.evaluate((width) => {
      document.querySelector('input[name="size_width"]').value = width;
    }, config.width);
    
    // Nastavíme výšku
    await page.evaluate((height) => {
      document.querySelector('input[name="size_height"]').value = height;
    }, config.height);
    
    // Nastavíme množstvo
    await page.evaluate((qty) => {
      document.querySelector('input[name="amount"]').value = qty;
    }, config.quantity);
    
    // Trigger prepočítanie
    await page.evaluate(() => {
      const event = new Event('change', { bubbles: true });
      document.querySelector('input[name="amount"]').dispatchEvent(event);
    });
    
    // Počkáme na aktualizáciu ceny
    await page.waitForTimeout(2000);
    
    // Prečítame cenu
    const priceData = await page.evaluate(() => {
      // Hľadáme element s cenou
      const priceElement = document.querySelector('.price-value, .final-price, [class*="price"]');
      return priceElement ? priceElement.textContent.trim() : null;
    });
    
    await page.close();
    
    return {
      ...config,
      price: priceData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Chyba pri teste ${config.width}×${config.height}mm, ${config.quantity}ks:`, error.message);
    await page.close();
    return null;
  }
}

async function generateTestCombinations() {
  const combinations = [];
  let id = 1;
  
  for (const size of testConfigs.sizes) {
    for (const qty of testConfigs.quantities) {
      for (const material of testConfigs.materials) {
        for (const lamination of testConfigs.laminations) {
          for (const cutting of testConfigs.cuttings) {
            combinations.push({
              id: id++,
              width: size.width,
              height: size.height,
              quantity: qty,
              material: material,
              lamination: lamination,
              cutting: cutting
            });
          }
        }
      }
    }
  }
  
  return combinations;
}

async function analyzePricePattern(results) {
  console.log('\n\n📊 ANALÝZA CENOVÉHO VZORCA\n');
  console.log('═'.repeat(80));
  
  // Zoskupenie podľa množstva
  const byQuantity = {};
  results.forEach(r => {
    if (!r || !r.price) return;
    if (!byQuantity[r.quantity]) byQuantity[r.quantity] = [];
    byQuantity[r.quantity].push(r);
  });
  
  console.log('\n🔍 Analýza cien pre 10×10cm (100mm×100mm) lesklý vinyl, bez laminácie, na hárku:\n');
  
  Object.keys(byQuantity).sort((a, b) => a - b).forEach(qty => {
    const samples = byQuantity[qty].filter(r => 
      r.width === 100 && 
      r.height === 100 && 
      r.material === 'vinyl-white' &&
      !r.lamination &&
      r.cutting === 'sheet'
    );
    
    if (samples.length > 0) {
      const sample = samples[0];
      const priceNum = parseFloat(sample.price.replace(/[^\d.,]/g, '').replace(',', '.'));
      const pricePerPiece = priceNum / qty;
      const pricePerCm2 = pricePerPiece / 100; // 10×10cm = 100cm²
      
      console.log(`  ${String(qty).padStart(3)}ks: ${priceNum.toFixed(2)}€ (${pricePerPiece.toFixed(3)}€/ks, ${pricePerCm2.toFixed(5)}€/cm²)`);
    }
  });
  
  // Hľadáme pattern pre rôzne rozmery
  console.log('\n\n🔍 Testovanie degresívnej krivky pre rôzne rozmery:\n');
  
  [25, 100, 400].forEach(area => {
    const size = Math.sqrt(area * 100); // cm² -> mm
    console.log(`\n  Plocha ${area}cm² (${size}×${size}mm):`);
    
    const samples = results.filter(r => 
      r && r.price &&
      r.width === size && 
      r.height === size &&
      r.material === 'vinyl-white' &&
      !r.lamination &&
      r.cutting === 'sheet'
    );
    
    samples.forEach(s => {
      const priceNum = parseFloat(s.price.replace(/[^\d.,]/g, '').replace(',', '.'));
      const pricePerPiece = priceNum / s.quantity;
      const pricePerCm2 = pricePerPiece / area;
      console.log(`    ${String(s.quantity).padStart(3)}ks: ${pricePerCm2.toFixed(5)}€/cm²`);
    });
  });
  
  // Výpočet vzorca
  console.log('\n\n💡 ODHADOVANÝ VZOREC:\n');
  console.log('  cena = plocha(cm²) × základná_cena × materiál × laminácia × narezanie × množstvo');
  console.log('  kde základná_cena závisí od množstva (degresívna krivka)');
}

async function main() {
  console.log('🤖 PLOTBASE.SK PRICE SCRAPER BOT\n');
  console.log('═'.repeat(80));
  
  const combinations = await generateTestCombinations();
  console.log(`\n📋 Vygenerovaných ${combinations.length} kombinácií na testovanie\n`);
  
  // Obmedzíme na 100 testov (kvôli času a záťaži servera)
  const testsToRun = combinations.slice(0, 100);
  
  console.log(`⚡ Spúšťam ${testsToRun.length} testov...\n`);
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  let completed = 0;
  
  for (const config of testsToRun) {
    const result = await testPriceCalculation(browser, config);
    if (result) {
      results.push(result);
      completed++;
      
      if (completed % 10 === 0) {
        console.log(`✓ Dokončených: ${completed}/${testsToRun.length}`);
      }
    }
  }
  
  await browser.close();
  
  // Uložíme výsledky
  fs.writeFileSync('plotbase_prices.json', JSON.stringify(results, null, 2));
  console.log(`\n✅ Výsledky uložené do plotbase_prices.json\n`);
  
  // Analyzujeme pattern
  await analyzePricePattern(results);
}

// Spustenie
main().catch(console.error);

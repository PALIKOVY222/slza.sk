/**
 * Bot na získanie cenovej tabuľky pre plagáty z typocon.sk
 *
 * Postup:
 *  - otvorí stránku plagátov
 *  - nastaví šírku, výšku, materiál a počet kusov
 *  - počká na prepočet
 *  - prečíta cenu "Spolu s DPH"
 *  - uloží všetky kombinácie do JSON
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Jednoduchý sleep kompatibilný s novšími verziami Puppeteer
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Kombinácie na testovanie
const testConfigs = {
  widths: [420, 594, 841], // A3, A2, A1 šírky v mm
  heights: [594, 841, 1189], // A3, A2, A1 výšky v mm
  materials: ['Hladký papier 120g', 'Lesklý papier 135g', 'Matný papier 150g'], // Príklady materiálov
  quantities: [1, 5, 10, 25, 50, 100, 200, 500],
};

// URL kalkulačky plagátov
const BASE_URL = 'https://typocon.sk/volne-listy/plagaty';

/**
 * Vygeneruje všetky kombinácie rozmerov, materiálov a množstiev
 */
function generateCombinations() {
  const combinations = [];
  let id = 1;

  for (const width of testConfigs.widths) {
    for (const height of testConfigs.heights) {
      for (const material of testConfigs.materials) {
        for (const quantity of testConfigs.quantities) {
          combinations.push({
            id: id++,
            width,
            height,
            material,
            quantity,
          });
        }
      }
    }
  }

  return combinations;
}

/**
 * Nastaví do formulára hodnoty a prečíta cenu na už otvorenej stránke
 */
async function testPosterPriceOnPage(page, config) {
  try {
    // Počkáme na formulár
    await page.waitForSelector('form input[name="width"]', {
      timeout: 20000,
    });

    // Nastavenie hodnôt inputov
    await page.evaluate((cfg) => {
      const widthInput = document.querySelector('form input[name="width"]');
      const heightInput = document.querySelector('form input[name="height"]');
      const qtyInput = document.querySelector('form input[name="itemCount"]');
      const materialSelect = document.querySelector('form select[name="material"]');

      if (!widthInput || !heightInput || !qtyInput) return;

      widthInput.value = cfg.width.toString();
      heightInput.value = cfg.height.toString();
      qtyInput.value = cfg.quantity.toString();

      // Nastavenie materiálu (ak existuje select)
      if (materialSelect && cfg.material) {
        const options = Array.from(materialSelect.options);
        const matchingOption = options.find(opt => 
          opt.text.toLowerCase().includes(cfg.material.toLowerCase()) ||
          opt.value.toLowerCase().includes(cfg.material.toLowerCase())
        );
        if (matchingOption) {
          materialSelect.value = matchingOption.value;
        }
      }

      // Vyvoláme change event, aby sa spustil JS kalkulátor
      const ev = new Event('change', { bubbles: true });
      widthInput.dispatchEvent(ev);
      heightInput.dispatchEvent(ev);
      qtyInput.dispatchEvent(ev);
      if (materialSelect) materialSelect.dispatchEvent(ev);
    }, config);

    // Počkáme na prepočet ceny
    await sleep(1500);

    // Prečítame celkovú cenu s DPH
    const priceTotal = await page.evaluate(() => {
      const priceEl = document.querySelector('#price-total');
      if (!priceEl) return null;
      const text = priceEl.textContent || priceEl.innerText || '';
      const match = text.match(/[\d\s,]+/);
      if (!match) return null;
      const num = match[0].replace(/\s/g, '').replace(',', '.');
      return parseFloat(num);
    });

    return {
      ...config,
      priceWithVAT: priceTotal,
      scraped: priceTotal !== null,
    };
  } catch (err) {
    console.error(`Chyba pri spracovaní konfigurácie ${config.id}:`, err.message);
    return {
      ...config,
      priceWithVAT: null,
      scraped: false,
      error: err.message,
    };
  }
}

/**
 * Hlavná funkcia
 */
(async () => {
  console.log('🚀 Spúšťam scraper pre plagáty z typocon.sk...');

  const combinations = generateCombinations();
  console.log(`📊 Celkový počet kombinácií: ${combinations.length}`);

  const browser = await puppeteer.launch({
    headless: false, // false ak chceš vidieť prehliadač
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log(`🌐 Otváram ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  const results = [];

  for (let i = 0; i < combinations.length; i++) {
    const config = combinations[i];
    console.log(
      `⏳ [${i + 1}/${combinations.length}] Testujem: ${config.width}×${config.height}mm, ${config.material}, ${config.quantity}ks...`
    );

    const result = await testPosterPriceOnPage(page, config);
    results.push(result);

    if (result.scraped) {
      console.log(`   ✅ Cena s DPH: ${result.priceWithVAT} €`);
    } else {
      console.log(`   ❌ Nepodarilo sa získať cenu`);
    }

    // Malá pauza medzi testami
    await sleep(300);
  }

  await browser.close();

  // Uložíme výsledky do JSON
  const outputFile = 'typocon_plagaty_prices.json';
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n✅ Hotovo! Výsledky uložené do ${outputFile}`);
  console.log(`📈 Úspešne načítaných: ${results.filter((r) => r.scraped).length}/${results.length}`);
})();

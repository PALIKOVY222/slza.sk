/**
 * Bot na získanie cenovej tabuľky pre baner z typocon.sk
 *
 * Postup:
 *  - otvorí stránku banerov
 *  - nastaví šírku, výšku a počet kusov
 *  - počká na prepočet
 *  - prečíta cenu "Spolu s DPH" (#price-total)
 *  - uloží všetky kombinácie do JSON
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Jednoduchý sleep kompatibilný s novšími verziami Puppeteer
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Kombinácie na testovanie (môžeš si upraviť podľa potreby)
const testConfigs = {
  widths: [500, 1000, 2000, 3000, 5000, 8000, 10000], // mm
  heights: [500, 1000, 1500, 2000], // mm
  quantities: [1, 2, 5, 10, 20, 50],
};

// Živá URL kalkulačky baneru (bez .html)
const BASE_URL = 'https://typocon.sk/rolove-materialy/banner';

/**
 * Vygeneruje všetky kombinácie rozmerov a množstiev
 */
function generateCombinations() {
  const combinations = [];
  let id = 1;

  for (const width of testConfigs.widths) {
    for (const height of testConfigs.heights) {
      for (const quantity of testConfigs.quantities) {
        combinations.push({
          id: id++,
          width,
          height,
          quantity,
        });
      }
    }
  }

  return combinations;
}

/**
 * Nastaví do formulára hodnoty a prečíta cenu na už otvorenej stránke
 */
async function testBannerPriceOnPage(page, config) {
  try {
    // Uistíme sa, že sme na správnej stránke a formulár už existuje
    await page.waitForSelector('#largeDigitalPrint-form input[name="width"]', {
      timeout: 20000,
    });

    // Nastavenie hodnoty inputu (bez simulácie klávesnice – rýchlejšie a spoľahlivejšie)
    await page.evaluate((cfg) => {
      const widthInput = document.querySelector('#largeDigitalPrint-form input[name="width"]');
      const heightInput = document.querySelector('#largeDigitalPrint-form input[name="height"]');
      const qtyInput = document.querySelector('#largeDigitalPrint-form input[name="itemCount"]');

      if (!widthInput || !heightInput || !qtyInput) return;

      widthInput.value = cfg.width.toString();
      heightInput.value = cfg.height.toString();
      qtyInput.value = cfg.quantity.toString();

      // Vyvoláme change event, aby sa spustil JS kalkulátor
      const ev = new Event('change', { bubbles: true });
      widthInput.dispatchEvent(ev);
      heightInput.dispatchEvent(ev);
      qtyInput.dispatchEvent(ev);
    }, config);

    // Počkáme na prepočet ceny
    await sleep(2500);

    // Prečítame cenu "Spolu s DPH" – element <span id="price-total">xx,xx</span>
    const priceText = await page.evaluate(() => {
      const el = document.querySelector('#price-total');
      return el ? el.textContent.trim() : null;
    });

    // Prevod textu na číslo v EUR (napr. "46,05" -> 46.05)
    let priceEur = null;
    if (priceText) {
      const normalized = priceText.replace(/[^0-9,\.]/g, '').replace(',', '.');
      const parsed = parseFloat(normalized);
      if (!Number.isNaN(parsed)) {
        priceEur = parsed;
      }
    }

    return {
      ...config,
      priceText,
      priceEur,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      `❌ Chyba pri teste ${config.width}×${config.height}mm, ${config.quantity}ks:`,
      err.message,
    );
    return null;
  }
}

async function main() {
  console.log('🤖 TYPOCON BANER PRICE SCRAPER');
  console.log('='.repeat(80));

  const combinations = generateCombinations();
  console.log(`Vygenerovaných kombinácií: ${combinations.length}`);

  // Z bezpečnostných dôvodov a kvôli nezaťaženiu servera môžeš počet obmedziť
  const LIMIT = 120; // uprav podľa potreby
  const testsToRun = combinations.slice(0, LIMIT);

  console.log(`Spúšťam ${testsToRun.length} testov proti ${BASE_URL}...`);

  const browser = await puppeteer.launch({
    headless: false, // otvorí viditeľné okno Chrome
    defaultViewport: null,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Načítame stránku len raz – môžeš tu ručne odkliknúť cookies prípadne prihlásenie
  await page.goto(BASE_URL, {
    waitUntil: 'networkidle2',
    timeout: 45000,
  });

  console.log('Stránka načítaná, skontroluj okno pre cookies / prihlásenie ak treba...');
  await sleep(5000);

  const results = [];
  let completed = 0;

  for (const cfg of testsToRun) {
    const result = await testBannerPriceOnPage(page, cfg);
    if (result) {
      results.push(result);
      completed++;
      if (completed % 10 === 0) {
        console.log(`✓ Dokončených: ${completed}/${testsToRun.length}`);
      }
    }
    // Krátka pauza medzi requestami, aby sme boli šetrní
    await sleep(500);
  }

  await browser.close();

  const outFile = 'typocon_banner_prices.json';
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\n✅ Výsledky uložené do ${outFile}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

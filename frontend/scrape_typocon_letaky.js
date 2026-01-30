/**
 * Bot na získanie cenovej tabuľky pre letáky z typocon.sk
 *
 * Postup:
 *  - otvorí stránku letákov
 *  - nastaví formát, gramáž, farebnosť a počet kusov
 *  - počká na prepočet
 *  - prečíta cenu "Spolu s DPH" (#price-total)
 *  - uloží všetky kombinácie do JSON
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Kombinácie na testovanie – priamo podľa nášho konfigurátora
const formats = ['A6', 'DL', 'A5', 'A4', 'A3'];
const quantities = [25, 50, 100, 250, 500, 1000];
const grammages = [115, 150, 200, 250, 300];

// Mapovanie našich farebností na hodnoty selectu chromaSelect na Typocone
// Podľa HTML: 55=4/4, 22=1/1, 51=4/0, 21=1/0
const colors = [
  { key: '4/4', chromaValue: '55' },
  { key: '1/1', chromaValue: '22' },
  { key: '4/0', chromaValue: '51' },
  { key: '1/0', chromaValue: '21' }
];

// Živá URL kalkulačky letákov (bez .html)
const BASE_URL = 'https://typocon.sk/volne-listy/letaky';

function generateCombinations() {
  const combos = [];
  let id = 1;

  for (const format of formats) {
    for (const grammage of grammages) {
      for (const color of colors) {
        for (const quantity of quantities) {
          combos.push({
            id: id++,
            format,
            grammage,
            colorKey: color.key,
            chromaValue: color.chromaValue,
            quantity
          });
        }
      }
    }
  }

  return combos;
}

async function testFlyerPriceOnPage(page, cfg) {
  try {
    await page.waitForSelector('#unboundedSheet-form form#product-formular', { timeout: 20000 });

    await page.evaluate((conf) => {
      const form = document.querySelector('#unboundedSheet-form form#product-formular');
      if (!form) return;

      const qtyInput = form.querySelector('input[name="itemCount"]');
      const formatSelect = form.querySelector('select[name="formatKey"]');
      const gramSelect = form.querySelector('select[name="grammageOrThickness"]');
      const chromaSelect = form.querySelector('select[name="chromaSelect"]');

      if (!qtyInput || !formatSelect || !gramSelect || !chromaSelect) return;

      qtyInput.value = String(conf.quantity);
      formatSelect.value = conf.format;
      gramSelect.value = String(conf.grammage);
      chromaSelect.value = conf.chromaValue;

      const ev = new Event('change', { bubbles: true });
      qtyInput.dispatchEvent(ev);
      formatSelect.dispatchEvent(ev);
      gramSelect.dispatchEvent(ev);
      chromaSelect.dispatchEvent(ev);
    }, cfg);

    await sleep(2500);

    const priceText = await page.evaluate(() => {
      const el = document.querySelector('#price-total');
      return el ? el.textContent.trim() : null;
    });

    let priceEur = null;
    if (priceText) {
      const normalized = priceText.replace(/[^0-9,\.]/g, '').replace(',', '.');
      const parsed = parseFloat(normalized);
      if (!Number.isNaN(parsed)) {
        priceEur = parsed;
      }
    }

    return {
      ...cfg,
      priceText,
      priceEur,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error(
      `❌ Chyba pri teste formát=${cfg.format}, ${cfg.grammage}g, farba=${cfg.colorKey}, ${cfg.quantity}ks:`,
      err.message
    );
    return null;
  }
}

async function main() {
  console.log('🤖 TYPOCON LETAKY PRICE SCRAPER');
  console.log('='.repeat(80));

  const combinations = generateCombinations();
  console.log(`Vygenerovaných kombinácií: ${combinations.length}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.goto(BASE_URL, {
    waitUntil: 'networkidle2',
    timeout: 45000
  });

  console.log('Stránka načítaná, skontroluj okno pre cookies / prihlásenie ak treba...');
  await sleep(5000);

  const results = [];
  let completed = 0;

  for (const cfg of combinations) {
    const result = await testFlyerPriceOnPage(page, cfg);
    if (result) {
      results.push(result);
      completed += 1;
      if (completed % 25 === 0) {
        console.log(`✓ Dokončených: ${completed}/${combinations.length}`);
      }
    }

    await sleep(400);
  }

  await browser.close();

  const outFile = 'typocon_letaky_prices.json';
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\n✅ Výsledky uložené do ${outFile}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

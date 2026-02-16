/**
 * Scraper cien bannerov z anwell.sk – v6 (missing widths only)
 * Scrapes only 1500mm and 1600mm widths that failed in v5.
 * 
 * FIX: Thousand separator parsing (e.g., "1 087,71" → 1087.71)
 * FIX: Page reload at each new width to prevent DOM staleness
 *
 * Spustenie:  node scrape_anwell_banner_missing.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SEL_WIDTH  = '#generated_product_form_fields_field_868_0_field_869';
const SEL_HEIGHT = '#generated_product_form_fields_field_868_0_field_870';
const SEL_QTY    = '#generated_product_form_fields_field_868_0_field_873';

// ONLY MISSING WIDTHS
const WIDTHS     = [1500, 1600];
const HEIGHTS    = [500, 700, 1000, 1500, 2000, 3000, 5000];
const QUANTITIES = [1, 2, 3, 5, 10, 20];

const BASE_URL = 'https://www.anwell.sk/produkt/tlac-bannerov';

function generateCombinations() {
  const combos = [];
  let id = 1000; // Start from 1000 to avoid ID conflicts
  for (const w of WIDTHS)
    for (const h of HEIGHTS)
      for (const q of QUANTITIES)
        combos.push({ id: id++, width: w, height: h, quantity: q });
  return combos;
}

/**
 * Set all 3 inputs at once using page.evaluate + native InputEvent dispatch.
 */
async function setAllInputs(page, width, height, quantity) {
  await page.evaluate((selW, selH, selQ, w, h, q) => {
    function setVal(sel, val) {
      const el = document.querySelector(sel);
      if (!el) throw new Error('Input not found: ' + sel);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      ).set;
      nativeInputValueSetter.call(el, String(val));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setVal(selW, w);
    setVal(selH, h);
    setVal(selQ, q);
  }, SEL_WIDTH, SEL_HEIGHT, SEL_QTY, width, height, quantity);
}

/**
 * Read price from page with THOUSAND SEPARATOR support.
 * Handles formats like: "1 087,71" or "1087,71" or "1.087,71"
 */
async function readPrice(page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    let priceWithoutVat = null, priceWithVat = null, perPiece = null;

    // Helper to parse price with thousand separators
    function parsePrice(str) {
      // Remove all spaces and dots used as thousand separators
      // Then replace comma with dot for decimal
      return parseFloat(str.replace(/[\s\.]/g, '').replace(',', '.'));
    }

    // "Suma bez DPH: X XXX,XX €" or "Suma bez DPH: XXX,XX €"
    const bezDph = body.match(/Suma\s+bez\s+DPH[:\s]*([0-9\s\.]+[,][0-9]+)\s*€/i);
    if (bezDph) priceWithoutVat = parsePrice(bezDph[1]);

    // "Spolu: X XXX,XX €"
    const idx = body.indexOf('Spolu:');
    if (idx >= 0) {
      const m = body.substring(idx, idx + 100).match(/([0-9\s\.]+[,][0-9]+)\s*€/);
      if (m) priceWithVat = parsePrice(m[1]);
    }

    // "(XXX,XX € / ks)"
    const ks = body.match(/\(([0-9\s\.]+[,][0-9]+)\s*€\s*\/\s*ks\)/i);
    if (ks) perPiece = parsePrice(ks[1]);

    return { priceWithoutVat, priceWithVat, perPiece };
  });
}

/**
 * Wait for the price to change from prevPrice.
 */
async function waitForPriceChange(page, prevPrice, maxWait = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const p = await readPrice(page);
    if (p.priceWithVat && p.priceWithVat !== prevPrice) return p;
    await sleep(300);
  }
  return readPrice(page);
}

async function scrapePrice(page, config, prevPriceWithVat) {
  try {
    await setAllInputs(page, config.width, config.height, config.quantity);

    let prices;
    if (prevPriceWithVat) {
      prices = await waitForPriceChange(page, prevPriceWithVat, 6000);
    } else {
      await sleep(3000);
      prices = await readPrice(page);
    }

    // If no bez DPH, compute from s DPH (23% VAT)
    if (!prices.priceWithoutVat && prices.priceWithVat) {
      prices.priceWithoutVat = Math.round((prices.priceWithVat / 1.23) * 100) / 100;
    }

    // Verify inputs
    const inputValues = await page.evaluate((sw, sh, sq) => ({
      w: document.querySelector(sw)?.value,
      h: document.querySelector(sh)?.value,
      q: document.querySelector(sq)?.value,
    }), SEL_WIDTH, SEL_HEIGHT, SEL_QTY);

    const inputOk = inputValues.w == config.width && inputValues.h == config.height && inputValues.q == config.quantity;
    const flag = inputOk ? '' : ` ⚠️ INPUTS: ${inputValues.w}×${inputValues.h}×${inputValues.q}`;

    console.log(`  ${config.width}×${config.height}mm ${config.quantity}ks => ${prices.priceWithoutVat ?? '?'}€ bez DPH, ${prices.priceWithVat ?? '?'}€ s DPH, ${prices.perPiece ?? '?'}€/ks${flag}`);

    if (!inputOk) {
      console.log('    ⚠️  Input mismatch! Retrying with wait...');
      await sleep(3000);
      prices = await readPrice(page);
      if (!prices.priceWithoutVat && prices.priceWithVat) {
        prices.priceWithoutVat = Math.round((prices.priceWithVat / 1.23) * 100) / 100;
      }
      console.log(`    → Retry: ${prices.priceWithoutVat ?? '?'}€ bez DPH, ${prices.priceWithVat ?? '?'}€ s DPH`);
    }

    return {
      ...config,
      priceWithoutVat: prices.priceWithoutVat,
      priceWithVat: prices.priceWithVat,
      pricePerPiece: prices.perPiece,
      priceEur: prices.priceWithVat,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`  ❌ ${config.width}×${config.height}mm ${config.quantity}ks: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🤖 ANWELL BANNER PRICE SCRAPER v6 (missing widths 1500+1600 only)');
  console.log('='.repeat(80));

  const combinations = generateCombinations();
  console.log(`Kombinácií: ${combinations.length} (2 widths × 7 heights × 6 quantities)`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  
  const results = [];
  let completed = 0;
  let currentWidth = null;

  for (const cfg of combinations) {
    // If width changed, RELOAD the page to prevent DOM staleness
    if (cfg.width !== currentWidth) {
      console.log(`\n🔄 RELOAD for width = ${cfg.width}mm...`);
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
      await sleep(8000); // Wait for JS

      // Cookie popup
      try {
        await page.evaluate(() => {
          for (const btn of document.querySelectorAll('button'))
            if (btn.textContent.includes('ODMIETNUŤ')) { btn.click(); return; }
        });
        await sleep(1000);
      } catch (e) {}

      // Scroll to form
      await page.evaluate(sel => {
        document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, SEL_WIDTH);
      await sleep(1000);

      currentWidth = cfg.width;
    }

    const result = await scrapePrice(page, cfg, results[results.length - 1]?.priceWithVat);
    if (result?.priceWithVat) {
      results.push(result);
    }
    completed++;

    if (completed % 10 === 0) {
      console.log(`\n✓ ${completed}/${combinations.length} (OK: ${results.length})\n`);
    }
    await sleep(100);
  }

  await browser.close();

  // Merge with existing data
  const existing = JSON.parse(fs.readFileSync('anwell_banner_prices.json', 'utf8'));
  const merged = [...existing, ...results];

  fs.writeFileSync('anwell_banner_prices.json', JSON.stringify(merged, null, 2));
  console.log(`\n✅ anwell_banner_prices.json (${merged.length} riadkov)`);

  const compatData = merged.map((r, i) => ({
    id: i + 1, 
    width: r.width, 
    height: r.height, 
    quantity: r.quantity,
    priceText: r.priceWithVat?.toFixed(2).replace('.', ','),
    priceEur: r.priceWithVat,
    priceWithoutVat: r.priceWithoutVat,
    pricePerPiece: r.pricePerPiece,
    timestamp: r.timestamp,
  }));
  fs.writeFileSync('../banner_price_table.json', JSON.stringify(compatData, null, 2));
  console.log('✅ banner_price_table.json aktualizovaný');
  console.log(`\nHotovo! ${merged.length} celkovo záznamov (${results.length} nových).`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });

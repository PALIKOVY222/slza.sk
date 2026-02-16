/**
 * Scraper cien bannerov z anwell.sk – v5
 * Max 20ks (nad 20 je individuálna ponuka)
 *
 * APPROACH: page.evaluate() to set input.value + dispatch native events
 * This avoids all keyboard/selection issues from v3/v4.
 *
 * Spustenie:  node scrape_anwell_banner.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SEL_WIDTH  = '#generated_product_form_fields_field_868_0_field_869';
const SEL_HEIGHT = '#generated_product_form_fields_field_868_0_field_870';
const SEL_QTY    = '#generated_product_form_fields_field_868_0_field_873';

const WIDTHS     = [500, 800, 1000, 1200, 1500, 1600];
const HEIGHTS    = [500, 700, 1000, 1500, 2000, 3000, 5000];
const QUANTITIES = [1, 2, 3, 5, 10, 20];

const BASE_URL = 'https://www.anwell.sk/produkt/tlac-bannerov';

function generateCombinations() {
  const combos = [];
  let id = 1;
  for (const w of WIDTHS)
    for (const h of HEIGHTS)
      for (const q of QUANTITIES)
        combos.push({ id: id++, width: w, height: h, quantity: q });
  return combos;
}

/**
 * Set all 3 inputs at once using page.evaluate + native InputEvent dispatch.
 * The site uses Symfony forms that listen for 'input' and 'change' events.
 */
async function setAllInputs(page, width, height, quantity) {
  await page.evaluate((selW, selH, selQ, w, h, q) => {
    function setVal(sel, val) {
      const el = document.querySelector(sel);
      if (!el) throw new Error('Input not found: ' + sel);
      // Use native setter to bypass React/framework getter wrappers
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
 * Read the computed price from the page text.
 */
async function readPrice(page) {
  return page.evaluate(() => {
    const body = document.body.innerText;
    let priceWithoutVat = null, priceWithVat = null, perPiece = null;

    const bezDph = body.match(/Suma\s+bez\s+DPH[:\s]*([0-9]+[,\.][0-9]+)\s*€/i);
    if (bezDph) priceWithoutVat = parseFloat(bezDph[1].replace(',', '.'));

    const idx = body.indexOf('Spolu:');
    if (idx >= 0) {
      const m = body.substring(idx, idx + 80).match(/([0-9]+[,\.][0-9]+)\s*€/);
      if (m) priceWithVat = parseFloat(m[1].replace(',', '.'));
    }

    const ks = body.match(/\(([0-9]+[,\.][0-9]+)\s*€\s*\/\s*ks\)/i);
    if (ks) perPiece = parseFloat(ks[1].replace(',', '.'));

    return { priceWithoutVat, priceWithVat, perPiece };
  });
}

/**
 * Wait for the price to change from prevPrice, with timeout.
 */
async function waitForPriceChange(page, prevPrice, maxWait = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const p = await readPrice(page);
    if (p.priceWithVat && p.priceWithVat !== prevPrice) return p;
    await sleep(300);
  }
  // Return whatever we have after timeout
  return readPrice(page);
}

async function scrapePrice(page, config, prevPriceWithVat) {
  try {
    await setAllInputs(page, config.width, config.height, config.quantity);

    // If we have a previous price, wait for it to change; otherwise just wait
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

    // Verify the input values are correct (debug check)
    const inputValues = await page.evaluate((sw, sh, sq) => ({
      w: document.querySelector(sw)?.value,
      h: document.querySelector(sh)?.value,
      q: document.querySelector(sq)?.value,
    }), SEL_WIDTH, SEL_HEIGHT, SEL_QTY);

    const inputOk = inputValues.w == config.width && inputValues.h == config.height && inputValues.q == config.quantity;
    const flag = inputOk ? '' : ` ⚠️ INPUTS: ${inputValues.w}×${inputValues.h}×${inputValues.q}`;

    console.log(`  ${config.width}×${config.height}mm ${config.quantity}ks => ${prices.priceWithoutVat ?? '?'}€ bez DPH, ${prices.priceWithVat ?? '?'}€ s DPH, ${prices.perPiece ?? '?'}€/ks${flag}`);

    if (!inputOk) {
      console.log('    ⚠️  Input mismatch! Retrying with page reload...');
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(5000);
      await setAllInputs(page, config.width, config.height, config.quantity);
      await sleep(4000);
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
  console.log('🤖 ANWELL BANNER PRICE SCRAPER v5 (page.evaluate)');
  console.log('='.repeat(80));

  const combinations = generateCombinations();
  console.log(`Kombinácií: ${combinations.length}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  console.log(`Načítavam ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 45000 });
  console.log('Čakám 8s na JavaScript...');
  await sleep(8000);

  // Cookie popup
  try {
    await page.evaluate(() => {
      for (const btn of document.querySelectorAll('button'))
        if (btn.textContent.includes('ODMIETNUŤ')) { btn.click(); return; }
    });
    await sleep(1000);
  } catch (e) {}

  // Scroll na formulár
  await page.evaluate(sel => {
    document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, SEL_WIDTH);
  await sleep(1000);

  // ===== VERIFIKÁCIA =====
  console.log('\n--- VERIFIKÁCIA ---');

  // Read default price first (1000×1000 1ks)
  const defaultPrice = await readPrice(page);
  console.log(`  Predvolená cena (1000×1000 1ks): ${defaultPrice.priceWithVat}€ s DPH`);

  // Set 500×500 1ks
  await setAllInputs(page, 500, 500, 1);
  await sleep(4000);
  const p500 = await readPrice(page);
  console.log(`  500×500mm 1ks: ${p500.priceWithVat}€ s DPH`);

  // Check inputs
  const verifyInputs = await page.evaluate((sw, sh, sq) => ({
    w: document.querySelector(sw)?.value,
    h: document.querySelector(sh)?.value,
    q: document.querySelector(sq)?.value,
  }), SEL_WIDTH, SEL_HEIGHT, SEL_QTY);
  console.log(`  Input values after set: w=${verifyInputs.w} h=${verifyInputs.h} q=${verifyInputs.q}`);

  if (!defaultPrice.priceWithVat || !p500.priceWithVat) {
    console.log('\n❌ Nemôžem čítať ceny. Koniec.');
    await sleep(60000);
    await browser.close();
    return;
  }

  if (defaultPrice.priceWithVat === p500.priceWithVat) {
    console.log('\n❌ Ceny sa nezmenili - page.evaluate dispatch nefunguje!');
    console.log('   Skúsim alternatívny prístup...');

    // Try alternative: focus + type approach
    await page.focus(SEL_WIDTH);
    await page.evaluate(sel => { document.querySelector(sel).value = ''; }, SEL_WIDTH);
    await page.type(SEL_WIDTH, '800', { delay: 30 });
    await page.focus(SEL_HEIGHT);
    await page.evaluate(sel => { document.querySelector(sel).value = ''; }, SEL_HEIGHT);
    await page.type(SEL_HEIGHT, '800', { delay: 30 });
    await page.keyboard.press('Tab');
    await sleep(4000);
    const p800 = await readPrice(page);
    console.log(`  800×800mm 1ks (alternative): ${p800.priceWithVat}€ s DPH`);

    if (p800.priceWithVat === defaultPrice.priceWithVat) {
      console.log('\n❌ Ani alternatívny prístup nefunguje. Koniec.');
      await sleep(60000);
      await browser.close();
      return;
    }
    console.log('\n✅ Alternatívny prístup funguje! Prepínam...');
  } else {
    console.log(`\n✅ OK! Ceny sa líšia: default=${defaultPrice.priceWithVat}€ vs 500×500=${p500.priceWithVat}€`);
  }

  // Reset to defaults before starting
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(6000);

  // ===== SCRAPING =====
  console.log('\n--- SCRAPING ---');

  const results = [];
  let completed = 0;
  let lastPriceWithVat = null;

  for (const cfg of combinations) {
    // Every 42 combos (one full width), scroll to form
    if (completed % 42 === 0 && completed > 0) {
      await page.evaluate(sel => {
        document.querySelector(sel)?.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, SEL_WIDTH);
    }

    const result = await scrapePrice(page, cfg, lastPriceWithVat);
    if (result?.priceWithVat) {
      results.push(result);
      lastPriceWithVat = result.priceWithVat;
    }
    completed++;

    if (completed % 20 === 0) {
      console.log(`\n✓ ${completed}/${combinations.length} (OK: ${results.length})\n`);
      fs.writeFileSync('anwell_banner_prices_partial.json', JSON.stringify(results, null, 2));
    }
    await sleep(100);
  }

  await browser.close();

  // Čistenie outlierov: pre qty=1, perPiece by mal byť ~= priceWithVat
  const cleaned = results.filter(r => {
    if (r.quantity === 1 && r.pricePerPiece && r.priceWithVat) {
      if (Math.abs(r.pricePerPiece - r.priceWithVat) > 2) return false;
    }
    return r.priceWithVat > 0;
  });

  fs.writeFileSync('anwell_banner_prices.json', JSON.stringify(cleaned, null, 2));
  console.log(`\n✅ anwell_banner_prices.json (${cleaned.length} riadkov)`);

  const compatData = cleaned.map(r => ({
    id: r.id, width: r.width, height: r.height, quantity: r.quantity,
    priceText: r.priceWithVat?.toFixed(2).replace('.', ','),
    priceEur: r.priceWithVat,
    priceWithoutVat: r.priceWithoutVat,
    pricePerPiece: r.pricePerPiece,
    timestamp: r.timestamp,
  }));
  fs.writeFileSync('../banner_price_table.json', JSON.stringify(compatData, null, 2));
  console.log('✅ banner_price_table.json aktualizovaný');
  console.log(`\nHotovo! ${cleaned.length} záznamov.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });

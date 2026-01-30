/**
 * Bot na získanie cenovej tabuľky pre plastové samolepky z typocon.sk
 *
 * Postup:
 *  - otvorí stránku plastových samolepiek
 *  - nastaví rozmery, množstvo, materiál, tlač a rezanie
 *  - vyčíta cenu "Spolu s DPH" (#price-total)
 *  - uloží výsledky aj agregovanú tabuľku do JSON
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BASE_URL = 'https://typocon.sk/samolepky/plastove-samolepky';

const sizes = [
  { name: '50x50', width: 50, height: 50 },
  { name: '70x70', width: 70, height: 70 },
  { name: '100x100', width: 100, height: 100 },
  { name: '150x150', width: 150, height: 150 },
  { name: '200x200', width: 200, height: 200 },
  { name: 'A6', width: 105, height: 148 },
  { name: 'A5', width: 148, height: 210 },
  { name: 'A4', width: 210, height: 297 }
];

const quantities = [1, 5, 10, 25, 50, 100, 250, 500];

const cutModes = [
  { key: 'orez', dieCut: true, kissCut: false },
  { key: 'orez_predrez', dieCut: true, kissCut: true }
];

function areaKeyCm2(widthMm, heightMm) {
  const area = (widthMm / 10) * (heightMm / 10);
  return Number(area.toFixed(2));
}

function buildCombinations() {
  const combos = [];
  let id = 1;

  for (const size of sizes) {
    for (const quantity of quantities) {
      for (const cutMode of cutModes) {
        combos.push({
          id: id++,
          width: size.width,
          height: size.height,
          sizeName: size.name,
          quantity,
          cutMode: cutMode.key,
          dieCut: cutMode.dieCut,
          kissCut: cutMode.kissCut
        });
      }
    }
  }

  return combos;
}

async function applyConfig(page, cfg) {
  await page.evaluate((conf) => {
    const form = document.querySelector('form#product-formular');
    if (!form) return;

    const qtyInput = form.querySelector('input[name="itemCount"]');
    const formatSelect = form.querySelector('select[name="formatKey"]');
    const widthInput = form.querySelector('input[name="width"]');
    const heightInput = form.querySelector('input[name="height"]');
    const materialSelect = form.querySelector('select[name="materialKey"]');
    const chromaSelect = form.querySelector('select[name="chromaSelect"]');
    const dieCutCheckbox = form.querySelector('input[name="dieCut"]');
    const kissCutCheckbox = form.querySelector('input[name="kissCut"]');

    const dispatch = (el) => {
      if (!el) return;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    if (qtyInput) {
      qtyInput.value = String(conf.quantity);
      dispatch(qtyInput);
    }

    if (formatSelect) {
      formatSelect.value = 'Custom';
      dispatch(formatSelect);
    }

    if (widthInput) {
      widthInput.value = String(conf.width);
      dispatch(widthInput);
    }

    if (heightInput) {
      heightInput.value = String(conf.height);
      dispatch(heightInput);
    }

    if (materialSelect) {
      materialSelect.value = 'DG_PVC_White_perm';
      dispatch(materialSelect);
    }

    if (chromaSelect) {
      chromaSelect.value = '51';
      dispatch(chromaSelect);
    }

    if (dieCutCheckbox) {
      dieCutCheckbox.checked = Boolean(conf.dieCut);
      dispatch(dieCutCheckbox);
    }

    if (kissCutCheckbox) {
      kissCutCheckbox.checked = Boolean(conf.kissCut);
      dispatch(kissCutCheckbox);
    }
  }, cfg);
}

async function readPrice(page) {
  try {
    await page.waitForFunction(() => {
      const el = document.querySelector('#price-total');
      return el && el.textContent && el.textContent.trim().length > 0;
    }, { timeout: 10000 });
  } catch (err) {
    return null;
  }

  const priceText = await page.evaluate(() => {
    const el = document.querySelector('#price-total');
    return el ? el.textContent.trim() : null;
  });

  if (!priceText) return null;

  const normalized = priceText.replace(/[^0-9,\.]/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

async function scrapeCombination(page, cfg) {
  try {
    await page.waitForSelector('form#product-formular', { timeout: 20000 });
    await applyConfig(page, cfg);
    await sleep(2200);

    const priceWithVat = await readPrice(page);
    if (!priceWithVat) {
      return {
        ...cfg,
        priceText: null,
        priceWithVat: null,
        priceExVat: null,
        timestamp: new Date().toISOString()
      };
    }

    const priceExVat = Number((priceWithVat / 1.2).toFixed(2));

    return {
      ...cfg,
      priceText: String(priceWithVat),
      priceWithVat,
      priceExVat,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error(
      `❌ Chyba pri ${cfg.width}x${cfg.height}mm, ${cfg.quantity}ks, ${cfg.cutMode}:`,
      err.message
    );
    return null;
  }
}

function aggregateTable(results) {
  const table = {
    orez: {},
    orez_predrez: {}
  };

  for (const row of results) {
    if (!row || row.priceExVat == null) continue;
    const area = areaKeyCm2(row.width, row.height);
    if (!table[row.cutMode]) continue;
    if (!table[row.cutMode][row.quantity]) {
      table[row.cutMode][row.quantity] = {};
    }
    table[row.cutMode][row.quantity][area] = row.priceExVat;
  }

  return table;
}

async function main() {
  console.log('🤖 TYPOCON PLASTOVÉ SAMOLEPKY PRICE SCRAPER');
  console.log('='.repeat(80));

  const combinations = buildCombinations();
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
    const result = await scrapeCombination(page, cfg);
    if (result) {
      results.push(result);
      completed += 1;
      if (completed % 20 === 0) {
        console.log(`✓ Dokončených: ${completed}/${combinations.length}`);
      }
    }

    await sleep(350);
  }

  await browser.close();

  const rawOut = path.resolve(__dirname, '..', 'typocon_sticker_prices.json');
  fs.writeFileSync(rawOut, JSON.stringify(results, null, 2));

  const table = aggregateTable(results);
  const tableOut = path.resolve(__dirname, '..', 'sticker_price_table.json');
  fs.writeFileSync(tableOut, JSON.stringify(table, null, 2));

  console.log(`\n✅ Výsledky uložené do ${rawOut}`);
  console.log(`✅ Tabuľka uložená do ${tableOut}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

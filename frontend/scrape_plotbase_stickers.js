/**
 * Scraper nálepiek z plotbase.sk
 *
 * Cieľ: získať reálne ceny bez DPH pre základnú kombináciu
 * (default materiál, bez laminácie, bez výrezu) pre rovnakú
 * mriežku plocha × množstvo, akú používa náš produkt "nalepky".
 *
 * Výstup:
 *  - plotbase_sticker_prices.json  (surové riadky)
 *  - sticker_price_table.json      (agregovaná tabuľka {qty -> {areaCm2 -> price}})
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Rovnaké plochy ako v totalPriceByQuantityAndArea (v cm²)
const sizeConfigs = [
  { label: '50x50mm', widthMm: 50, heightMm: 50 }, // 25 cm²
  { label: '70x70mm', widthMm: 70, heightMm: 70 }, // 49 cm²
  { label: '100x100mm', widthMm: 100, heightMm: 100 }, // 100 cm²
  { label: 'A6 105x148mm', widthMm: 105, heightMm: 148 }, // ~155.4 cm²
];

// Rovnaké množstvá ako v produktoch "nalepky"
const quantities = [1, 5, 10, 25, 50, 100, 250, 500];

const results = [];

async function ensureCookieBannerClosed(page) {
  try {
    // Krátka pauza, kým sa prípadný cookie banner zobrazí
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const accept = buttons.find((el) =>
        /akceptovať všetky|akceptovať všetky cookies|prijať všetky cookies/i.test(el.textContent || '')
      );
      if (accept) {
        (accept).click();
      }
    });
  } catch {
    // Ignoruj, ak banner nie je
  }
}

async function setNumericInput(page, selector, value) {
  await page.evaluate((sel, val) => {
    const input = document.querySelector(sel);
    if (!input) return;
    input.value = String(val);
    const events = ['input', 'change', 'keyup'];
    for (const type of events) {
      const ev = new Event(type, { bubbles: true });
      input.dispatchEvent(ev);
    }
  }, selector, value);
}

async function readPrice(page) {
  const priceInfo = await page.evaluate(() => {
    // Skúsime nájsť blok s textom "CENA BEZ DPH"
    const allElements = Array.from(document.querySelectorAll('body *'));
    const block = allElements.find((el) => /CENA BEZ DPH/i.test(el.textContent || ''));
    const text = (block && block.textContent) ? block.textContent.replace(/\s+/g, ' ').trim() : '';

    if (!text) {
      return { text: null, priceEur: null };
    }

    // Nájdeme všetky čísla pred symbolom € a vezmeme posledné (aktuálna cena)
    const matches = [...text.matchAll(/(\d+[\.,]\d+)\s*€/g)];
    if (!matches.length) {
      return { text, priceEur: null };
    }
    const last = matches[matches.length - 1][1];
    const normalized = last.replace(/\./g, '').replace(',', '.');
    const priceEur = Number.parseFloat(normalized);
    return { text, priceEur: Number.isFinite(priceEur) ? priceEur : null };
  });

  return priceInfo;
}

async function main() {
  console.log('🤖 PLOTBASE.SK NÁLEPKY SCRAPER');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://www.plotbase.sk/nalepky', {
    waitUntil: 'networkidle2',
    timeout: 45000,
  });

  await page.waitForSelector('input[name="size_width"]', { timeout: 15000 });
  await ensureCookieBannerClosed(page);

  for (const size of sizeConfigs) {
    for (const qty of quantities) {
      const areaCm2 = Number(((size.widthMm * size.heightMm) / 100).toFixed(2));
      console.log(`➡️  ${size.label}, ${qty} ks (plocha ${areaCm2} cm²)`);

      try {
        await setNumericInput(page, 'input[name="size_width"]', size.widthMm);
        await setNumericInput(page, 'input[name="size_height"]', size.heightMm);
        await setNumericInput(page, 'input[name="amount"]', qty);

        // Počkajme chvíľu na prepočet ceny na stránke
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const { text, priceEur } = await readPrice(page);

        const row = {
          widthMm: size.widthMm,
          heightMm: size.heightMm,
          areaCm2,
          quantity: qty,
          priceEur,
          rawText: text,
          scrapedAt: new Date().toISOString(),
        };

        results.push(row);
        console.log(`   -> cena bez DPH: ${priceEur ?? 'NEZNÁMA'} €`);
      } catch (error) {
        console.error(`❌ Chyba pri kombinácii ${size.label}, ${qty} ks:`, error.message);
      }
    }
  }

  await browser.close();

  // Ulož surové výsledky
  fs.writeFileSync('plotbase_sticker_prices.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Uložené surové dáta do plotbase_sticker_prices.json');

  // Agregácia do tabuľky {quantity -> {areaCm2 -> priceEur}}
  const table = {};
  for (const row of results) {
    if (!Number.isFinite(row.priceEur)) continue;
    const qKey = String(row.quantity);
    const aKey = String(row.areaCm2);
    if (!table[qKey]) table[qKey] = {};
    table[qKey][aKey] = row.priceEur;
  }

  fs.writeFileSync('sticker_price_table.json', JSON.stringify(table, null, 2));
  console.log('✅ Uložená tabuľka do sticker_price_table.json');
}

main().catch((err) => {
  console.error('❌ Neošetrená chyba scraperu:', err);
  process.exit(1);
});

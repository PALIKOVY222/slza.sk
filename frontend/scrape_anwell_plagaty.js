#!/usr/bin/env node
/**
 * Scraper: Anwell.sk – Plagáty (maloformátové, do A3)
 *
 * Prechádza všetky kombinácie:
 *   formát   : A4, A3
 *   papier   : 115g matná, 115g lesklá, 170g matná   (grammage filter)
 *   farebnosť: 4+0, 4+4, 1+0, 1+1
 *   množstvo : 10, 25, 50, 100, 250, 500, 1000
 *
 * Výstup: anwell_plagaty_prices.json
 *
 * Spustenie:
 *   node scrape_anwell_plagaty.js
 *
 * Závislosti:
 *   npm i puppeteer   (alebo puppeteer-core)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.anwell.sk/produkt/plagaty';

const FORMATS = ['A4', 'A3'];
const PAPERS = ['115g matná', '115g lesklá', '170g matná'];
const COLOR_KEYS = ['4+0', '4+4', '1+0', '1+1'];
const QUANTITIES = [10, 25, 50, 100, 250, 500, 1000];

const DELAY = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForPriceUpdate(page, timeout = 8000) {
  const start = Date.now();
  let lastPrice = '';
  while (Date.now() - start < timeout) {
    await DELAY(400);
    const current = await page.evaluate(() => {
      // Look for price element – Anwell shows total with VAT
      const el =
        document.querySelector('[class*="price-total"]') ||
        document.querySelector('[class*="totalPrice"]') ||
        document.querySelector('.product-price-total') ||
        // fallback: find element containing € near "Spolu"
        [...document.querySelectorAll('*')].find(
          (e) =>
            e.textContent &&
            e.textContent.includes('€') &&
            e.textContent.includes('Spolu') &&
            e.children.length < 5
        );
      if (!el) return '';
      const match = el.textContent.match(/([\d\s]+[,.][\d]+)\s*€/);
      return match ? match[1].replace(/\s/g, '').replace(',', '.') : '';
    });
    if (current && current !== '0' && current !== lastPrice) {
      // Wait a bit more to ensure it's settled
      await DELAY(600);
      const settled = await page.evaluate(() => {
        const el =
          document.querySelector('[class*="price-total"]') ||
          document.querySelector('[class*="totalPrice"]') ||
          document.querySelector('.product-price-total') ||
          [...document.querySelectorAll('*')].find(
            (e) =>
              e.textContent &&
              e.textContent.includes('€') &&
              e.textContent.includes('Spolu') &&
              e.children.length < 5
          );
        if (!el) return '';
        const match = el.textContent.match(/([\d\s]+[,.][\d]+)\s*€/);
        return match ? match[1].replace(/\s/g, '').replace(',', '.') : '';
      });
      if (settled === current) return parseFloat(settled);
      lastPrice = current;
    }
  }
  return null;
}

/**
 * Try to extract the Spolu price from the page, looking for the pattern:
 *  "Spolu:XX,XX €" or similar
 */
async function readTotalPrice(page) {
  return page.evaluate(() => {
    const allText = document.body.innerText || '';
    // Pattern: "Spolu:" followed by number with , and € 
    const match = allText.match(/Spolu\s*:\s*([\d\s]+[,.][\d]+)\s*€/i);
    if (match) {
      return parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
    }
    return null;
  });
}

async function selectOption(page, labelText, optionText) {
  // Anwell uses custom dropdowns / clickable filters
  // Try clicking the filter label, then the option
  try {
    // Find and click the configurator item by text
    const clicked = await page.evaluate((label, option) => {
      // Try finding a select element near the label
      const selects = document.querySelectorAll('select');
      for (const sel of selects) {
        const parent = sel.closest('[class*="config"], [class*="filter"], [class*="option"], div');
        if (parent && parent.textContent.includes(label)) {
          const opts = sel.querySelectorAll('option');
          for (const opt of opts) {
            if (opt.textContent.trim().toLowerCase().includes(option.toLowerCase())) {
              sel.value = opt.value;
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              return 'select';
            }
          }
        }
      }

      // Try clickable buttons / divs
      const allEls = document.querySelectorAll('button, [role="button"], label, div[class*="option"], div[class*="item"], span');
      for (const el of allEls) {
        const txt = el.textContent?.trim() || '';
        if (txt.toLowerCase().includes(option.toLowerCase()) && txt.length < 100) {
          el.click();
          return 'click';
        }
      }
      return null;
    }, labelText, optionText);

    return clicked;
  } catch (err) {
    console.warn(`  ⚠ Could not select ${labelText}=${optionText}: ${err.message}`);
    return null;
  }
}

async function setQuantity(page, qty) {
  try {
    await page.evaluate((q) => {
      // Try to find quantity input
      const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
      for (const inp of inputs) {
        const parent = inp.closest('[class*="quantity"], [class*="pocet"], [class*="config"], div');
        if (parent && (parent.textContent.includes('Počet') || parent.textContent.includes('kusov') || parent.textContent.includes('Množstvo'))) {
          inp.value = '';
          inp.focus();
          // Use native input setter
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(inp, String(q));
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          inp.blur();
          return true;
        }
      }
      return false;
    }, qty);
  } catch (err) {
    console.warn(`  ⚠ Could not set quantity to ${qty}: ${err.message}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // use false for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('🌐 Loading Anwell plagáty page...');
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await DELAY(3000);

  // Accept cookies if present
  try {
    const cookieBtn = await page.$('button[id*="cookie"], button[class*="cookie"], [class*="consent"] button');
    if (cookieBtn) {
      await cookieBtn.click();
      await DELAY(1000);
    }
  } catch {}

  const results = [];
  let id = 0;

  for (const format of FORMATS) {
    console.log(`\n📐 Formát: ${format}`);
    await selectOption(page, 'Formát', format);
    await DELAY(1500);

    for (const paper of PAPERS) {
      console.log(`  📄 Papier: ${paper}`);
      
      // Map paper names to what Anwell shows
      let paperSearch = paper;
      if (paper === '115g matná') paperSearch = 'matný 115';
      else if (paper === '115g lesklá') paperSearch = 'lesklý 115';
      else if (paper === '170g matná') paperSearch = 'matný 170';

      await selectOption(page, 'Papier', paperSearch);
      await DELAY(1500);

      for (const colorKey of COLOR_KEYS) {
        console.log(`    🎨 Farebnosť: ${colorKey}`);

        // Select sides (Jednostranná / Obojstranná)
        const isDouble = colorKey.includes('+') ? colorKey.split('+')[1] !== '0' : false;
        const sideLabel = isDouble ? 'Obojstranná' : 'Jednostranná';
        await selectOption(page, 'Tlač', sideLabel);
        await DELAY(800);

        // Select color mode
        const isColor = colorKey.startsWith('4');
        const colorLabel = isColor ? 'Farebná' : 'Čiernobiela';
        // Try clicking the specific color option
        await selectOption(page, 'Farb', colorLabel);
        await DELAY(800);

        for (const qty of QUANTITIES) {
          await setQuantity(page, qty);
          await DELAY(2000);

          const totalPrice = await readTotalPrice(page);

          id++;
          const entry = {
            id,
            format,
            paper,
            colorKey,
            quantity: qty,
            priceWithVat: totalPrice,
            scraped: totalPrice !== null,
            timestamp: new Date().toISOString()
          };

          results.push(entry);
          
          if (totalPrice !== null) {
            console.log(`      ${qty} ks = ${totalPrice.toFixed(2)} € s DPH ✅`);
          } else {
            console.log(`      ${qty} ks = ??? ❌`);
          }
        }
      }
    }
  }

  // Save results
  const outPath = path.join(__dirname, 'anwell_plagaty_prices.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ Saved ${results.length} entries to ${outPath}`);
  console.log(`   Scraped: ${results.filter((r) => r.scraped).length}`);
  console.log(`   Failed:  ${results.filter((r) => !r.scraped).length}`);

  await browser.close();
})();

/**
 * Scraper nálepiek z anwell.sk (veľkoformátové vinylové nálepky)
 *
 * Cieľ: získať reálne ceny bez DPH pre základnú kombináciu
 * (default typ samolepky, bez laminácie, dodané narezané na kusy, default rýchlosť výroby)
 * pre mriežku plocha × množstvo ako v našom produkte "nalepky".
 *
 * Výstup:
 *  - anwell_sticker_prices.json  (surové riadky)
 *  - sticker_price_table.json    (agregovaná tabuľka {qty -> {areaCm2 -> price}})
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

// Rovnaké množstvá ako v produkte "nalepky"
const quantities = [1, 5, 10, 25, 50, 100, 250, 500];

// Variácie laminácie a prevedenia, ktoré chceme otestovať
const laminationVariants = [
  { key: 'bez', labelSubstring: 'Bez laminácie' },
  // akákoľvek laminácia (matná/lesklá) – text obsahuje "lamin"
  { key: 's', labelSubstring: 'lamin' },
];

const cuttingVariants = [
  { key: 'kusy', labelSubstring: 'narezané na kusy' },
  { key: 'rolka', labelSubstring: 'rolke' },
];

const results = [];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureCookieBannerClosed(page) {
  try {
    await delay(1500);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const accept = buttons.find((el) =>
        /POVOLIŤ VŠETKO|POVOLIŤ VSETKO|POVOLIT VSE/i.test((el.textContent || '').trim())
      );
      if (accept) {
        accept.click();
      }
    });
  } catch {
    // Ignoruj, ak banner nie je
  }
}

async function setDimensionAndQuantity(page, widthMm, heightMm, quantity) {
  await page.evaluate((w, h, qty) => {
    const setByLabel = (labelText, value) => {
      const all = Array.from(document.querySelectorAll('label, span, div, p, strong'));
      const labelEl = all.find((el) => (el.textContent || '').includes(labelText));
      if (!labelEl) return;

      let container = labelEl.closest('div') || labelEl.parentElement;
      let input = null;

      if (container) {
        input = container.querySelector('input');
      }

      if (!input) {
        let sibling = labelEl.nextElementSibling;
        while (sibling && !sibling.querySelector('input')) {
          sibling = sibling.nextElementSibling;
        }
        if (sibling) input = sibling.querySelector('input');
      }

      if (!input) return;

      input.value = String(value);
      ['input', 'change', 'keyup', 'blur'].forEach((type) => {
        const ev = new Event(type, { bubbles: true });
        input.dispatchEvent(ev);
      });
    };

    setByLabel('Šírka (v mm)', w);
    setByLabel('Výška (v mm)', h);
    setByLabel('Počet ks', qty);
  }, widthMm, heightMm, quantity);
}

async function setOptionByGroupLabel(page, groupLabelSubstring, optionSubstring) {
  await page.evaluate((groupLabel, optionSub) => {
    const groupText = groupLabel.toLowerCase();
    const optionText = optionSub.toLowerCase();

    const all = Array.from(document.querySelectorAll('body *'));
    const root = all.find((el) => (el.textContent || '').toLowerCase().includes(groupText));
    if (!root) return;

    const container = root.closest('section, article, div') || root.parentElement || document.body;

    // 1) Prefer select elements
    const selectEl = container.querySelector('select');
    if (selectEl) {
      const options = Array.from(selectEl.querySelectorAll('option'));
      const match = options.find((opt) => (opt.textContent || '').toLowerCase().includes(optionText));
      if (match) {
        selectEl.value = match.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }

    // 2) Radio/checkbox inputs with labels
    const inputs = Array.from(container.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
    for (const input of inputs) {
      const id = input.getAttribute('id');
      if (!id) continue;
      const label = container.querySelector(`label[for="${CSS.escape(id)}"]`);
      const labelText = (label?.textContent || '').toLowerCase();
      if (labelText.includes(optionText)) {
        label?.click();
        return;
      }
    }

    // 3) Elements with roles/options
    const interactive = Array.from(
      container.querySelectorAll('[role="option"], [role="radio"], button, a')
    );
    const target = interactive.find((el) => (el.textContent || '').toLowerCase().includes(optionText));
    if (target) {
      (target).click();
    }
  }, groupLabelSubstring, optionSubstring);
}

async function setDefaultOption(page, groupLabelSubstring, fallbackOptionSubstring) {
  await page.evaluate((groupLabel, fallbackSub) => {
    const groupText = groupLabel.toLowerCase();
    const all = Array.from(document.querySelectorAll('body *'));
    const root = all.find((el) => (el.textContent || '').toLowerCase().includes(groupText));
    if (!root) return;

    const container = root.closest('section, article, div') || root.parentElement || document.body;

    const selectEl = container.querySelector('select');
    if (selectEl) {
      const options = Array.from(selectEl.querySelectorAll('option')).filter((o) => o.value);
      const preferred = options.find((opt) => (opt.textContent || '').toLowerCase().includes(fallbackSub.toLowerCase()));
      const selected = preferred || options[0];
      if (selected) {
        selectEl.value = selected.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    const interactive = Array.from(
      container.querySelectorAll('[role="option"], [role="radio"], button, a, label')
    );
    const preferred = interactive.find((el) => (el.textContent || '').toLowerCase().includes(fallbackSub.toLowerCase()));
    const target = preferred || interactive[0];
    if (target) {
      (target).click();
    }
  }, groupLabelSubstring, fallbackOptionSubstring);
}

async function main() {
  console.log('🤖 ANWELL.SK NÁLEPKY SCRAPER');

  const isHeadless = process.env.HEADLESS === '1';

  const browser = await puppeteer.launch({
    headless: isHeadless ? 'new' : false,
    slowMo: isHeadless ? 0 : 50,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://www.anwell.sk/produkt/vinylove-samolepky', {
    waitUntil: 'networkidle2',
    timeout: 45000,
  });

  await ensureCookieBannerClosed(page);

  // Počkaj, kým sa načíta konfigurátor (podľa textu "Šírka (v mm)")
  await page.waitForFunction(
    () => document.body && document.body.innerText.includes('Šírka (v mm)'),
    { timeout: 20000 }
  );

  // Nastav základné povinné voľby, aby kalkulačka počítala cenu
  await setDefaultOption(page, 'Typ samolepky', 'Biela lesklá');
  await setDefaultOption(page, 'Tlač', 'Farebná / čiernobiela');
  await setDefaultOption(page, 'Rýchlosť výroby', 'OPTIMAL');
  await setDefaultOption(page, 'Grafické podklady', 'Mám hotové');

  for (const size of sizeConfigs) {
    for (const qty of quantities) {
      for (const lam of laminationVariants) {
        for (const cut of cuttingVariants) {
          const areaCm2 = Number(((size.widthMm * size.heightMm) / 100).toFixed(2));
          console.log(
            `➡️  ${size.label}, ${qty} ks, lam: ${lam.key}, prev: ${cut.key} (plocha ${areaCm2} cm²)`
          );

          try {
            await setDimensionAndQuantity(page, size.widthMm, size.heightMm, qty);

            // Nastav lamináciu
            await setOptionByGroupLabel(page, 'Laminácia', lam.labelSubstring);

            // Nastav prevedenie (narezanie / rolka)
            await setOptionByGroupLabel(page, 'Prevedenie', cut.labelSubstring);

            await delay(2500);

            // Počkaj chvíľu, kým sa zobrazí suma bez DPH
            try {
              await page.waitForFunction(
                () => document.body && /Suma bez DPH:/i.test(document.body.innerText),
                { timeout: 5000 }
              );
            } catch {
              // ignoruj, ak sa suma nezobrazí
            }

            const priceInfo = await page.evaluate(() => {
              const all = Array.from(document.querySelectorAll('body *'));

              const priceBlock = all.find((el) => /Suma bez DPH:/i.test(el.textContent || ''));
              const priceText = priceBlock && priceBlock.textContent
                ? priceBlock.textContent.replace(/\s+/g, ' ').trim()
                : '';

              let priceEur = null;
              if (priceText) {
                const match = priceText.match(/Suma bez DPH:\s*([0-9.,]+)\s*€/i);
                if (match) {
                  const normalized = match[1].replace(/\./g, '').replace(',', '.');
                  const num = Number.parseFloat(normalized);
                  priceEur = Number.isFinite(num) ? num : null;
                }
              }

              const lamBlock = all.find((el) => /Laminácia/i.test(el.textContent || ''));
              const lamText = lamBlock && lamBlock.textContent
                ? lamBlock.textContent.replace(/\s+/g, ' ').trim()
                : null;

              const prevBlock = all.find((el) => /Prevedenie/i.test(el.textContent || ''));
              const prevText = prevBlock && prevBlock.textContent
                ? prevBlock.textContent.replace(/\s+/g, ' ').trim()
                : null;

              return {
                priceText,
                priceEur,
                laminationText: lamText,
                cuttingText: prevText,
              };
            });

            if (priceInfo.priceEur == null) {
              const ts = new Date().toISOString().replace(/[:.]/g, '-');
              await page.screenshot({
                path: `anwell_debug_${size.label}_${qty}_${lam.key}_${cut.key}_${ts}.png`,
                fullPage: true,
              });
              console.log('   ⚠️  Cena nenašla, uložený screenshot pre debug.');
            }

            const row = {
              widthMm: size.widthMm,
              heightMm: size.heightMm,
              areaCm2,
              quantity: qty,
              laminationKey: lam.key,
              cuttingKey: cut.key,
              laminationText: priceInfo.laminationText,
              cuttingText: priceInfo.cuttingText,
              priceEur: priceInfo.priceEur,
              rawPriceText: priceInfo.priceText,
              scrapedAt: new Date().toISOString(),
            };

            results.push(row);
            console.log(
              `   -> cena bez DPH: ${priceInfo.priceEur ?? 'NEZNÁMA'} €, lam: ${priceInfo.laminationText || 'neznáme'}, prev: ${priceInfo.cuttingText || 'neznáme'}`
            );
          } catch (error) {
            console.error(
              `❌ Chyba pri kombinácii ${size.label}, ${qty} ks, lam ${lam.key}, prev ${cut.key}:`,
              error.message
            );
          }
        }
      }
    }
  }

  await browser.close();

  // Ulož surové výsledky
  fs.writeFileSync('anwell_sticker_prices.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Uložené surové dáta do anwell_sticker_prices.json');

  // Agregácia do tabuľky {quantity -> {areaCm2 -> priceEur}}
  const table = {};
  for (const row of results) {
    if (!Number.isFinite(row.priceEur)) continue;
    // Pre backendovú tabuľku používame len baseline:
    // bez laminácie + narezané na kusy
    if (row.laminationKey !== 'bez' || row.cuttingKey !== 'kusy') continue;
    const qKey = String(row.quantity);
    const aKey = String(row.areaCm2);
    if (!table[qKey]) table[qKey] = {};
    table[qKey][aKey] = row.priceEur;
  }

  fs.writeFileSync('sticker_price_table.json', JSON.stringify(table, null, 2));
  console.log('✅ Uložená tabuľka do sticker_price_table.json');
}

main().catch((err) => {
  console.error('❌ Neošetrená chyba scraperu (Anwell):', err);
  process.exit(1);
});

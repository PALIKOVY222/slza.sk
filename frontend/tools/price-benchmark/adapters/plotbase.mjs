import puppeteer from 'puppeteer';

const PLOTBASE_URL = 'https://www.plotbase.sk/nalepky';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEuro(text) {
  // Handles: "19,40 €" "25.20" "19,40" etc.
  const cleaned = String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/€/g, '')
    .trim();

  const match = cleaned.match(/([0-9]+(?:[\.,][0-9]{1,2})?)/);
  if (!match) return null;

  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function parsePriceNearCenaBezDph(blockText) {
  const lower = String(blockText || '').toLowerCase();
  const idx = lower.indexOf('cena bez dph');
  const slice = idx === -1 ? String(blockText || '') : String(blockText || '').slice(idx, idx + 300);

  // Prefer amounts that are immediately followed by the euro symbol.
  // Avoid false positives like "95 €" inside "8,095 €/KS" by requiring a non-number boundary before.
  const euroMatches = [...slice.matchAll(/(?<![0-9\.,])([0-9]+(?:[\.,][0-9]{1,2})?)\s*€/g)].map((m) => m[1]);
  if (euroMatches.length) {
    const last = euroMatches[euroMatches.length - 1];
    const value = Number(last.replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }

  return parseEuro(slice);
}

async function acceptCookiesIfPresent(page) {
  // Try common Slovak cookie modal buttons
  const candidates = [
    'Akceptovať všetky',
    'Akceptovať',
    'Prijať všetky',
    'Prijať',
    'Súhlasím',
    'Accept all'
  ];

  for (const label of candidates) {
    const clicked = await page.evaluate((btnText) => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const target = buttons.find((b) => (b.textContent || '').trim() === btnText);
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, label);

    if (clicked) {
      await sleep(800);
      break;
    }
  }
}

async function setNumericByNearbyLabel(page, labelIncludes, value) {
  const success = await page.evaluate(
    ({ labelIncludes, value }) => {
      const needle = String(labelIncludes).toLowerCase();
      const all = Array.from(document.querySelectorAll('input[type="number"], input')); // sometimes not typed

      const findClosest = () => {
        // 1) Try aria-label / name / placeholder
        for (const input of all) {
          const aria = (input.getAttribute('aria-label') || '').toLowerCase();
          const name = (input.getAttribute('name') || '').toLowerCase();
          const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
          if (aria.includes(needle) || name.includes(needle) || placeholder.includes(needle)) {
            return input;
          }
        }

        // 2) Try DOM text near input
        for (const input of all) {
          const container = input.closest('div, label, li, td, th, section') || input.parentElement;
          const text = (container?.textContent || '').toLowerCase();
          if (text.includes(needle)) {
            return input;
          }
        }

        return null;
      };

      const el = findClosest();
      if (!el) return false;

      el.focus();
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.value = String(value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    },
    { labelIncludes, value }
  );

  if (success) {
    await sleep(400);
  }

  return success;
}

async function setQuantityByExclusion(page, quantity) {
  const success = await page.evaluate(({ quantity }) => {
    const all = Array.from(document.querySelectorAll('input[type="number"], input')).filter((el) => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return type === 'number' || el instanceof HTMLInputElement;
    });

    const findClosest = (needle) => {
      const n = String(needle).toLowerCase();

      for (const input of all) {
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        if (aria.includes(n) || name.includes(n) || placeholder.includes(n)) {
          return input;
        }
      }

      for (const input of all) {
        const container = input.closest('div, label, li, td, th, section') || input.parentElement;
        const text = (container?.textContent || '').toLowerCase();
        if (text.includes(n)) {
          return input;
        }
      }

      return null;
    };

    const widthEl = findClosest('šírka');
    const heightEl = findClosest('výška');

    const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const qtyEl = numberInputs.find((el) => el !== widthEl && el !== heightEl) || null;
    if (!qtyEl) return false;

    qtyEl.focus();
    qtyEl.value = '';
    qtyEl.dispatchEvent(new Event('input', { bubbles: true }));
    qtyEl.value = String(quantity);
    qtyEl.dispatchEvent(new Event('input', { bubbles: true }));
    qtyEl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, { quantity });

  if (success) {
    await sleep(400);
  }
  return success;
}

async function setQuantityByLabelBlock(page, quantity) {
  const success = await page.evaluate(({ quantity }) => {
    const normalize = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();

    const allInputs = Array.from(document.querySelectorAll('input[type="number"], input'));
    const findClosest = (needle) => {
      const n = String(needle).toLowerCase();
      for (const input of allInputs) {
        const aria = normalize(input.getAttribute('aria-label') || '');
        const name = normalize(input.getAttribute('name') || '');
        const placeholder = normalize(input.getAttribute('placeholder') || '');
        if (aria.includes(n) || name.includes(n) || placeholder.includes(n)) return input;
      }
      for (const input of allInputs) {
        const container = input.closest('div, label, li, td, th, section') || input.parentElement;
        const text = normalize(container?.textContent || '');
        if (text.includes(n)) return input;
      }
      return null;
    };

    const widthEl = findClosest('šírka');
    const heightEl = findClosest('výška');

    const blocks = Array.from(document.querySelectorAll('div, label, li, section'))
      .filter((el) => normalize(el.textContent || '').includes('počet kusov'));

    for (const block of blocks) {
      const candidates = Array.from(block.querySelectorAll('input[type="number"], input'))
        .filter((el) => (el.getAttribute('type') || '').toLowerCase() === 'number');

      const remaining = candidates.filter((el) => el !== widthEl && el !== heightEl);
      const input = remaining[0] || candidates[candidates.length - 1];
      if (!input) continue;

      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = String(quantity);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  }, { quantity });

  if (success) {
    await sleep(400);
  }
  return success;
}

async function getQuantityByLabelBlock(page) {
  return page.evaluate(() => {
    const normalize = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();

    const allInputs = Array.from(document.querySelectorAll('input[type="number"], input'));
    const findClosest = (needle) => {
      const n = String(needle).toLowerCase();
      for (const input of allInputs) {
        const aria = normalize(input.getAttribute('aria-label') || '');
        const name = normalize(input.getAttribute('name') || '');
        const placeholder = normalize(input.getAttribute('placeholder') || '');
        if (aria.includes(n) || name.includes(n) || placeholder.includes(n)) return input;
      }
      for (const input of allInputs) {
        const container = input.closest('div, label, li, td, th, section') || input.parentElement;
        const text = normalize(container?.textContent || '');
        if (text.includes(n)) return input;
      }
      return null;
    };

    const widthEl = findClosest('šírka');
    const heightEl = findClosest('výška');
    const blocks = Array.from(document.querySelectorAll('div, label, li, section'))
      .filter((el) => normalize(el.textContent || '').includes('počet kusov'));

    for (const block of blocks) {
      const candidates = Array.from(block.querySelectorAll('input[type="number"], input'))
        .filter((el) => (el.getAttribute('type') || '').toLowerCase() === 'number');

      const remaining = candidates.filter((el) => el !== widthEl && el !== heightEl);
      const input = remaining[0] || candidates[candidates.length - 1];
      if (!input) continue;
      const value = Number(String(input.value ?? '').replace(',', '.'));
      if (Number.isFinite(value)) return value;
    }

    return null;
  });
}

async function getQuantityByExclusion(page) {
  return page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('input[type="number"], input'));

    const findClosest = (needle) => {
      const n = String(needle).toLowerCase();
      for (const input of all) {
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        if (aria.includes(n) || name.includes(n) || placeholder.includes(n)) {
          return input;
        }
      }
      for (const input of all) {
        const container = input.closest('div, label, li, td, th, section') || input.parentElement;
        const text = (container?.textContent || '').toLowerCase();
        if (text.includes(n)) {
          return input;
        }
      }
      return null;
    };

    const widthEl = findClosest('šírka');
    const heightEl = findClosest('výška');
    const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const qtyEl = numberInputs.find((el) => el !== widthEl && el !== heightEl) || null;
    if (!qtyEl) return null;
    const value = Number(String(qtyEl.value ?? '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  });
}

async function selectDropdownByVisibleText(page, labelNeedle, optionNeedle) {
  if (!optionNeedle) return false;

  const ok = await page.evaluate(
    ({ labelNeedle, optionNeedle }) => {
      const labelNorm = String(labelNeedle).toLowerCase();
      const optionNorm = String(optionNeedle).toLowerCase();

      // Heuristic: find container that contains the label text and a select element.
      const containers = Array.from(document.querySelectorAll('div, section, li, form'));
      const container = containers.find((c) => (c.textContent || '').toLowerCase().includes(labelNorm));
      if (!container) return false;

      const select = container.querySelector('select');
      if (!select) {
        // Some sites use custom dropdowns.
        // We try clicking an element that looks like a dropdown trigger.
        const triggers = Array.from(container.querySelectorAll('[role="button"], button, .select, .dropdown, .ng-select'));
        const trigger = triggers[0];
        if (!trigger) return false;
        trigger.click();

        const options = Array.from(document.querySelectorAll('li, div, span, button'));
        const opt = options.find((o) => (o.textContent || '').toLowerCase().includes(optionNorm));
        if (!opt) return false;
        opt.click();
        return true;
      }

      const options = Array.from(select.options);

      const isAnyLamination = optionNorm === '__any_lamination__';
      const match = isAnyLamination
        ? options.find((o) => {
            const t = (o.textContent || '').toLowerCase();
            return t.includes('lamin') && !t.includes('bez');
          })
        : options.find((o) => (o.textContent || '').toLowerCase().includes(optionNorm));

      if (!match) return false;

      select.value = match.value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    },
    { labelNeedle, optionNeedle }
  );

  if (ok) {
    await sleep(500);
  }
  return ok;
}

async function getNumericByNearbyLabel(page, labelIncludes) {
  return page.evaluate(({ labelIncludes }) => {
    const needle = String(labelIncludes).toLowerCase();
    const all = Array.from(document.querySelectorAll('input[type="number"], input'));

    const findClosest = () => {
      for (const input of all) {
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        if (aria.includes(needle) || name.includes(needle) || placeholder.includes(needle)) {
          return input;
        }
      }

      for (const input of all) {
        const container = input.closest('div, label, li, td, th, section') || input.parentElement;
        const text = (container?.textContent || '').toLowerCase();
        if (text.includes(needle)) {
          return input;
        }
      }

      return null;
    };

    const el = findClosest();
    if (!el) return null;
    const raw = el.value ?? el.getAttribute('value') ?? '';
    const value = Number(String(raw).replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }, { labelIncludes });
}

async function readPriceBlock(page) {
  // Try to extract the *calculator widget* block, not the whole page.
  const widgetText = await page.evaluate(() => {
    const normalize = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();

    // Most reliable anchor: the width input lives inside the calculator widget.
    // Walk up from that input until we find a parent block containing "CENA BEZ DPH".
    const inputs = Array.from(document.querySelectorAll('input[type="number"], input'));
    const widthEl = inputs.find((input) => {
      const aria = normalize(input.getAttribute('aria-label') || '');
      const name = normalize(input.getAttribute('name') || '');
      const placeholder = normalize(input.getAttribute('placeholder') || '');
      if (aria.includes('šírka') || name.includes('šírka') || placeholder.includes('šírka')) return true;
      const container = input.closest('div, label, li, td, th, section') || input.parentElement;
      const text = normalize(container?.textContent || '');
      return text.includes('šírka');
    });

    let node = widthEl?.parentElement || null;
    for (let i = 0; i < 12; i++) {
      if (!node) break;
      const t = normalize(node.innerText || node.textContent || '');
      if (t.includes('cena bez dph')) {
        return node.innerText || node.textContent || '';
      }
      node = node.parentElement;
    }

    return '';
  });

  const fallbackText = await page.evaluate(() => document.body?.innerText || '');
  const block = widgetText || fallbackText;

  // Prefer “CENA BEZ DPH” block if present.
  const lower = block.toLowerCase();
  const rawIdx = lower.indexOf('cena bez dph');
  const windowText = rawIdx === -1
    ? block.slice(0, 1200)
    : block.slice(Math.max(0, rawIdx - 200), Math.min(block.length, rawIdx + 500));

  const price = parsePriceNearCenaBezDph(windowText);
  return { priceWithoutVat: price, rawText: windowText };
}

/**
 * @param {import('../types.mjs').StickerCase} testCase
 * @returns {Promise<import('../types.mjs').BenchmarkResult>}
 */
export async function runPlotbaseStickerCase(testCase) {
  const [result] = await runPlotbaseStickerCases([testCase]);
  return result;
}

/**
 * Runs multiple cases in a single browser session (much faster and less flaky).
 * @param {import('../types.mjs').StickerCase[]} testCases
 * @returns {Promise<import('../types.mjs').BenchmarkResult[]>}
 */
export async function runPlotbaseStickerCases(testCases) {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 900 }
  });

  /** @type {import('../types.mjs').BenchmarkResult[]} */
  const results = [];

  try {
    const page = await browser.newPage();
    await page.goto(PLOTBASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1200);
    await acceptCookiesIfPresent(page);

    for (const testCase of testCases) {
      try {
        // Set dimensions in mm
        const widthOk = await setNumericByNearbyLabel(page, 'šírka', testCase.widthMm);
        const heightOk = await setNumericByNearbyLabel(page, 'výška', testCase.heightMm);

        // Quantity
        const qtyOk =
          (await setQuantityByLabelBlock(page, testCase.quantity)) ||
          (await setNumericByNearbyLabel(page, 'počet kusov', testCase.quantity)) ||
          (await setNumericByNearbyLabel(page, 'počet', testCase.quantity)) ||
          (await setQuantityByExclusion(page, testCase.quantity));

        // Dropdowns (best-effort)
        await selectDropdownByVisibleText(page, 'materiál', testCase.materialLabel);
        await selectDropdownByVisibleText(page, 'výrez', testCase.cutLabel);
        await selectDropdownByVisibleText(page, 'laminovanie', testCase.laminationLabel);

        // Wait until the calculator widget contains a euro price.
        for (let i = 0; i < 20; i++) {
          const hasEuro = await page.evaluate(() => {
            const normalize = (t) => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();

            const inputs = Array.from(document.querySelectorAll('input[type="number"], input'));
            const widthEl = inputs.find((input) => {
              const aria = normalize(input.getAttribute('aria-label') || '');
              const name = normalize(input.getAttribute('name') || '');
              const placeholder = normalize(input.getAttribute('placeholder') || '');
              if (aria.includes('šírka') || name.includes('šírka') || placeholder.includes('šírka')) return true;
              const container = input.closest('div, label, li, td, th, section') || input.parentElement;
              const text = normalize(container?.textContent || '');
              return text.includes('šírka');
            });

            let node = widthEl?.parentElement || null;
            for (let i = 0; i < 12; i++) {
              if (!node) break;
              const t = normalize(node.innerText || node.textContent || '');
              if (t.includes('cena bez dph') && t.includes('€') && /\d/.test(t)) {
                return true;
              }
              node = node.parentElement;
            }

            return false;
          });

          if (hasEuro) break;
          await sleep(350);
        }

        const appliedWidth = await getNumericByNearbyLabel(page, 'šírka');
        const appliedHeight = await getNumericByNearbyLabel(page, 'výška');
        const appliedQty =
          (await getQuantityByLabelBlock(page)) ??
          (await getNumericByNearbyLabel(page, 'počet kusov')) ??
          (await getNumericByNearbyLabel(page, 'počet')) ??
          (await getQuantityByExclusion(page));

        const { priceWithoutVat, rawText } = await readPriceBlock(page);
        const debugHeader = `APPLIED width=${appliedWidth} height=${appliedHeight} qty=${appliedQty}`;

        results.push({
          site: 'plotbase',
          caseId: testCase.id,
          priceWithoutVat,
          rawText: `${debugHeader}\n${rawText}`,
          error: (!widthOk || !heightOk)
            ? 'Failed to set width/height inputs reliably (selectors heuristic)'
            : (!qtyOk ? 'Failed to set quantity input reliably (selectors heuristic)' : null)
        });
      } catch (e) {
        results.push({
          site: 'plotbase',
          caseId: testCase.id,
          priceWithoutVat: null,
          rawText: '',
          error: e?.message || String(e)
        });
      }
    }

    return results;
  } finally {
    await browser.close();
  }
}

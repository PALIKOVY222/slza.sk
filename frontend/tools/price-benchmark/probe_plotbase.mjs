import puppeteer from 'puppeteer';

const url = 'https://www.plotbase.sk/nalepky';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 900 } });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1200);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button,a'));
    const labels = ['Akceptovať všetky', 'Prijať všetky', 'Accept all'];
    for (const label of labels) {
      const btn = buttons.find((b) => (b.textContent || '').trim() === label);
      if (btn) {
        btn.click();
        break;
      }
    }
  });
  await sleep(1000);

  async function setByNeedle(needle, value) {
    const ok = await page.evaluate(
      ({ needle, value }) => {
        const n = String(needle).toLowerCase();
        const inputs = Array.from(document.querySelectorAll('input[type=number],input'));

        const pick = () => {
          for (const i of inputs) {
            const aria = (i.getAttribute('aria-label') || '').toLowerCase();
            const name = (i.getAttribute('name') || '').toLowerCase();
            if (aria.includes(n) || name.includes(n)) return i;
          }
          for (const i of inputs) {
            const c = i.closest('div,label,li,td,th,section') || i.parentElement;
            const t = (c?.textContent || '').toLowerCase();
            if (t.includes(n)) return i;
          }
          return null;
        };

        const el = pick();
        if (!el) return false;
        el.focus();
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        return true;
      },
      { needle, value }
    );

    await sleep(600);
    return ok;
  }

  await setByNeedle('šírka', 100);
  await setByNeedle('výška', 100);

  // try to set quantity by typing into the last numeric input
  const qtySelector = await page.evaluate(() => {
    const nums = Array.from(document.querySelectorAll('input[type=number]'));
    if (!nums.length) return null;
    nums.forEach((x, i) => x.setAttribute('data-idx', String(i)));
    return 'input[type=number][data-idx="' + (nums.length - 1) + '"]';
  });

  if (qtySelector) {
    await page.click(qtySelector, { clickCount: 3 });
    await page.keyboard.type('500');
    await page.keyboard.press('Tab');
  }
  await sleep(2000);

  const snapshot = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    const includesAny = (arr) => arr.some((s) => t.includes(s));
    return {
      len: t.length,
      has6353: includesAny(['63,53', '63.53']),
      has6350: includesAny(['63,50', '63.50']),
      has840: includesAny(['8,40', '8.40']),
      excerptAroundCena: (() => {
        const lower = t.toLowerCase();
        const idx = lower.indexOf('cena bez dph');
        if (idx === -1) return '';
        return t.slice(Math.max(0, idx - 250), Math.min(t.length, idx + 350));
      })()
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));
  await browser.close();
})();

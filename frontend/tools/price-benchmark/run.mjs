import { stickerCases } from './cases.mjs';
import { runPlotbaseStickerCases } from './adapters/plotbase.mjs';

async function main() {
  const site = process.argv.find((a) => a.startsWith('--site='))?.split('=')[1] || 'plotbase';
  const debug = process.argv.includes('--debug');

  if (site !== 'plotbase') {
    console.error(`Only --site=plotbase implemented right now (got: ${site}).`);
    process.exit(2);
  }

  console.log(`\n🔎 Running price benchmark (${site})`);
  console.log(`Cases: ${stickerCases.length}\n`);

  /** @type {any[]} */
  const results = await runPlotbaseStickerCases(stickerCases);

  for (const result of results) {
    process.stdout.write(`- ${result.caseId} ... `);
    if (result.error) console.log(`ERROR (${result.error})`);
    else console.log(`${result.priceWithoutVat ?? 'n/a'} € (bez DPH)`);
  }

  if (debug) {
    console.log('\nRaw excerpts (debug):');
    for (const r of results) {
      console.log(`\n--- ${r.site}:${r.caseId} ---`);
      console.log(String(r.rawText || '').trim().slice(0, 400));
    }
  }

  const okCount = results.filter((r) => typeof r.priceWithoutVat === 'number').length;
  console.log(`\nDone. Parsed prices: ${okCount}/${results.length}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

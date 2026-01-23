/** @type {import('./types.mjs').StickerCase[]} */
export const stickerCases = (() => {
  const materialLabel = 'monomerická samolepka biela lesklá';
  const cutLabel = 'bez výrezu';
  const laminationVariants = [
    { id: 'nolam', label: 'bez laminovania' },
    // Special value handled by adapter: picks the first available laminated option.
    { id: 'lam', label: '__ANY_LAMINATION__' }
  ];

  const sizes = [
    { w: 50, h: 50 },
    { w: 70, h: 70 },
    { w: 100, h: 100 },
    { w: 105, h: 148 }, // A6
  ];

  const quantities = [1, 5, 10, 25, 50, 100, 250, 500];

  /** @type {import('./types.mjs').StickerCase[]} */
  const cases = [];

  for (const s of sizes) {
    for (const q of quantities) {
      for (const lam of laminationVariants) {
        cases.push({
          id: `pb-${s.w}x${s.h}mm-qty${q}-${lam.id}`,
          widthMm: s.w,
          heightMm: s.h,
          quantity: q,
          materialLabel,
          cutLabel,
          laminationLabel: lam.label
        });
      }
    }
  }

  return cases;
})();

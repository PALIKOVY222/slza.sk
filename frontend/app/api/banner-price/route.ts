import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface BannerPriceRow {
  width: number;
  height: number;
  quantity: number;
  priceEur: number; // total price WITH VAT for given width/height/qty
}

interface PriceResult {
  areaM2Single: number;
  pricePerM2WithVat: number;
  totalWithVat: number;
  totalWithoutVat: number;
}

let cachedData: BannerPriceRow[] | null = null;

function loadPriceTable(): BannerPriceRow[] {
  if (cachedData) return cachedData;

  const jsonPath = path.resolve(process.cwd(), '..', 'banner_price_table.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(raw) as any[];

  cachedData = parsed.map((row) => ({
    width: Number(row.width),
    height: Number(row.height),
    quantity: Number(row.quantity),
    priceEur: Number(row.priceEur),
  }));

  return cachedData;
}

function computePrice(
  table: BannerPriceRow[],
  widthMm: number,
  heightMm: number,
  quantity: number,
): PriceResult {
  const w = Math.max(1, widthMm);
  const h = Math.max(1, heightMm);
  const qty = Math.max(1, Math.floor(quantity));

  const areaM2Single = (w / 1000) * (h / 1000);

  const sameQty = table.filter((r) => r.quantity === qty);
  const qtyGroups = sameQty.length ? sameQty : table;

  const rowsWithArea = qtyGroups.map((r) => ({
    ...r,
    areaM2: (r.width / 1000) * (r.height / 1000),
  }));

  const minPrice = rowsWithArea.reduce(
    (min, r) => (r.priceEur < min ? r.priceEur : min),
    rowsWithArea[0]?.priceEur ?? 0,
  );

  // ak je náš baner menší ako najmenší v tabuľke, aplikujeme minimálnu cenu
  const smallest = rowsWithArea.reduce((min, r) => (r.areaM2 < min.areaM2 ? r : min), rowsWithArea[0]);
  if (areaM2Single <= smallest.areaM2) {
    const totalWithVat = minPrice;
    const totalWithoutVat = totalWithVat / 1.2; // približné rozdelenie DPH 20%
    const pricePerM2WithVat = totalWithVat / (areaM2Single * qty);

    return {
      areaM2Single,
      pricePerM2WithVat,
      totalWithVat,
      totalWithoutVat,
    };
  }

  // nájdeme najbližšiu plochu pre dané množstvo
  let best = rowsWithArea[0];
  let bestDiff = Math.abs(areaM2Single - rowsWithArea[0].areaM2);

  for (const r of rowsWithArea) {
    const diff = Math.abs(areaM2Single - r.areaM2);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = r;
    }
  }

  const pricePerM2WithVat = best.priceEur / (best.areaM2 * best.quantity);
  let totalWithVat = pricePerM2WithVat * areaM2Single * qty;

  if (totalWithVat < minPrice) {
    totalWithVat = minPrice;
  }

  const totalWithoutVat = totalWithVat / 1.2;

  return {
    areaM2Single,
    pricePerM2WithVat,
    totalWithVat,
    totalWithoutVat,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const widthMm = Number(body.widthMm);
    const heightMm = Number(body.heightMm);
    const quantity = Number(body.quantity);

    if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || !Number.isFinite(quantity)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const table = loadPriceTable();
    if (!table.length) {
      return NextResponse.json({ error: 'Price table empty' }, { status: 500 });
    }

    const result = computePrice(table, widthMm, heightMm, quantity);

    return NextResponse.json(result);
  } catch (err) {
    console.error('banner-price API error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export type PosterColorKey = '1/0' | '1/1' | '4/0' | '4/4';
export type PosterFormatKey = 'A4' | 'A3';

interface RawRow {
  format: string;
  grammage: number;
  colorKey: string;
  quantity: number;
  priceEur?: number | null;
  priceWithVat?: number | null;
}

interface PriceRow {
  format: PosterFormatKey;
  grammage: number;
  colorKey: PosterColorKey;
  quantity: number;
  priceWithVat: number;
}

interface PosterPriceResult {
  priceExVat: number;
  priceIncVat: number;
}

let cachedTable: PriceRow[] | null = null;

function loadPriceTable(): PriceRow[] {
  if (cachedTable) return cachedTable;

  // Try plagáty-specific file first, fall back to flyer table (which has A4 & A3 data)
  let filePath = path.resolve(process.cwd(), 'anwell_plagaty_prices.json');

  if (!fs.existsSync(filePath)) {
    filePath = path.resolve(process.cwd(), '..', 'flyer_price_table.json');
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as RawRow[];

  const table: PriceRow[] = parsed
    .filter((row) => {
      const fmt = row.format as string;
      if (fmt !== 'A4' && fmt !== 'A3') return false;
      const price = row.priceEur ?? row.priceWithVat;
      return price !== undefined && price !== null && row.grammage && row.colorKey && row.quantity;
    })
    .map((row) => {
      // Normalize colorKey from '4+0' to '4/0' format
      const normalizedColor = (row.colorKey || '').replace('+', '/') as PosterColorKey;
      return {
        format: row.format as PosterFormatKey,
        grammage: row.grammage,
        colorKey: normalizedColor,
        quantity: row.quantity,
        priceWithVat: (row.priceEur ?? row.priceWithVat) as number,
      };
    });

  cachedTable = table;
  return table;
}

// Grammage multipliers relative to 115g base
const GRAMMAGE_FACTORS: Record<number, number> = {
  115: 1.0,
  135: 1.15,
  150: 1.25,
  170: 1.4,
  200: 1.6,
  250: 1.9,
  300: 2.2,
  350: 2.5,
};

function interpolateOnLogScale(points: { qty: number; priceWithVat: number }[], targetQty: number) {
  if (points.length === 0) return 0;

  points.sort((a, b) => a.qty - b.qty);

  const exact = points.find((p) => p.qty === targetQty);
  if (exact) return exact.priceWithVat;

  const first = points[0];
  const last = points[points.length - 1];

  if (targetQty < first.qty && points.length >= 2) {
    const p1 = points[0];
    const p2 = points[1];
    const slope = (p2.priceWithVat - p1.priceWithVat) / (Math.log(p2.qty) - Math.log(p1.qty));
    return p1.priceWithVat + slope * (Math.log(targetQty) - Math.log(p1.qty));
  }

  if (targetQty > last.qty && points.length >= 2) {
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    const slope = (p2.priceWithVat - p1.priceWithVat) / (Math.log(p2.qty) - Math.log(p1.qty));
    return p2.priceWithVat + slope * (Math.log(targetQty) - Math.log(p2.qty));
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (targetQty > p1.qty && targetQty < p2.qty) {
      const ratio = (Math.log(targetQty) - Math.log(p1.qty)) / (Math.log(p2.qty) - Math.log(p1.qty));
      return p1.priceWithVat + (p2.priceWithVat - p1.priceWithVat) * ratio;
    }
  }

  return last.priceWithVat;
}

function computePosterPrice(
  table: PriceRow[],
  format: PosterFormatKey,
  grammage: number,
  colorKey: PosterColorKey,
  quantity: number,
): PosterPriceResult {
  const baseRows = table.filter((r) => r.format === format && r.grammage === 115 && r.colorKey === colorKey);

  if (baseRows.length === 0) {
    return { priceExVat: 0, priceIncVat: 0 };
  }

  const series115 = baseRows.map((r) => ({ qty: r.quantity, priceWithVat: r.priceWithVat }));
  const base115WithVat = interpolateOnLogScale(series115, quantity);

  const factor = GRAMMAGE_FACTORS[grammage] ?? 1.0;
  const priceWithVat = base115WithVat * factor;

  const roundedWithVat = Math.max(0, Math.round(priceWithVat * 100) / 100);
  const priceExVat = Math.round((roundedWithVat / 1.23) * 100) / 100;

  return { priceExVat, priceIncVat: roundedWithVat };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, grammage, colorKey, quantity } = body as {
      format: PosterFormatKey;
      grammage: number;
      colorKey: PosterColorKey;
      quantity: number;
    };

    if (!format || !grammage || !colorKey || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const table = loadPriceTable();
    const result = computePosterPrice(table, format, grammage, colorKey, quantity);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Poster price API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

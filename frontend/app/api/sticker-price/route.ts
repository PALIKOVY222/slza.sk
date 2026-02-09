import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { rateLimit, sanitizeInput, addSecurityHeaders } from '../../../lib/security';

interface StickerPriceResult {
  priceExVat: number;
}

type StickerPriceTable = Record<string, Record<string, number>>;
type StickerPriceTables = {
  orez: StickerPriceTable;
  orez_predrez: StickerPriceTable;
};

type LoadedTable = StickerPriceTable | StickerPriceTables;

let cachedTable: LoadedTable | null = null;

const priceRateLimit = rateLimit({ windowMs: 10000, maxRequests: 20 });

async function loadPriceTable(): Promise<LoadedTable> {
  if (cachedTable) return cachedTable;

  // Obfuscated file path - hide pricing source
  const filePath = path.join(process.cwd(), '..', 'sticker_price_table.json');
  try {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as LoadedTable;
    cachedTable = parsed;
    return parsed;
  } catch (error) {
    console.error('Price table load error (source protected)', error);
    // Fallback to empty table to prevent API crash
    cachedTable = {};
    return cachedTable;
  }
}

const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'Lesklý vinyl': 1.0,
  'Matný vinyl': 1.15,
};

const LAMINATION_MULTIPLIERS: Record<string, number> = {
  'Bez laminácie': 1.0,
  'Lesklá laminácia': 1.09,
  'Matná laminácia': 1.09,
};

const CUTTING_MULTIPLIERS: Record<string, number> = {
  'Bez výrezu': 1.0,
  'Na hárku': 1.0,
  'Narezané po kusoch': 1.0,
};

function resolveCutTable(table: LoadedTable, cuttingName: string): StickerPriceTable {
  if (!table || typeof table !== 'object') return {};

  const maybeTables = table as StickerPriceTables;
  if (maybeTables.orez && maybeTables.orez_predrez) {
    const normalized = (cuttingName || '').toLowerCase();
    if (normalized.includes('po kusoch') || normalized.includes('predrez') || normalized.includes('hárku') || normalized.includes('harku')) {
      return normalized.includes('po kusoch') ? maybeTables.orez_predrez : maybeTables.orez;
    }
    return maybeTables.orez;
  }

  return table as StickerPriceTable;
}

function interpolateByArea(areaTable: Record<string, number>, area: number): number {
  const points = Object.entries(areaTable)
    .map(([a, v]) => ({ area: Number(a), value: Number(v) }))
    .filter((p) => Number.isFinite(p.area) && Number.isFinite(p.value))
    .sort((a, b) => a.area - b.area);

  if (!points.length) return 0;

  const exact = points.find((p) => p.area === area);
  if (exact) return exact.value;

  const lower = [...points].reverse().find((p) => p.area < area) || points[0];
  const upper = points.find((p) => p.area > area) || points[points.length - 1];
  if (lower.area === upper.area) return lower.value;

  const ratio = (area - lower.area) / (upper.area - lower.area);
  return lower.value + ratio * (upper.value - lower.value);
}

function interpolateByQuantity(table: StickerPriceTable, amount: number, area: number): number {
  const qtyKeys = Object.keys(table)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (!qtyKeys.length) return 0;

  const exact = qtyKeys.find((q) => q === amount);
  if (exact) return interpolateByArea(table[String(exact)], area);

  const lower = [...qtyKeys].reverse().find((q) => q < amount) || qtyKeys[0];
  const upper = qtyKeys.find((q) => q > amount) || qtyKeys[qtyKeys.length - 1];
  if (lower === upper) return interpolateByArea(table[String(lower)], area);

  const logLower = Math.log(lower);
  const logUpper = Math.log(upper);
  const logAmount = Math.log(amount);
  const ratio = (logAmount - logLower) / (logUpper - logLower);

  const vLower = interpolateByArea(table[String(lower)], area);
  const vUpper = interpolateByArea(table[String(upper)], area);
  return vLower + ratio * (vUpper - vLower);
}

function computeStickerPrice(params: {
  widthMm: number;
  heightMm: number;
  quantity: number;
  materialName: string;
  laminationName: string;
  cuttingName: string;
}, table: LoadedTable): StickerPriceResult {
  const { widthMm, heightMm, quantity, materialName, laminationName, cuttingName } = params;

  const wCm = widthMm / 10;
  const hCm = heightMm / 10;
  const areaCm2 = Number((wCm * hCm).toFixed(2));
  if (!Number.isFinite(areaCm2) || areaCm2 <= 0) {
    return { priceExVat: 0 };
  }

  const amount = Math.max(1, Math.floor(quantity));
  const resolvedTable = resolveCutTable(table, cuttingName);
  let price = interpolateByQuantity(resolvedTable, amount, areaCm2);

  const materialMulti = MATERIAL_MULTIPLIERS[materialName] ?? 1.0;
  const laminationMulti = LAMINATION_MULTIPLIERS[laminationName] ?? 1.0;
  const cuttingMulti = CUTTING_MULTIPLIERS[cuttingName] ?? 1.0;

  price = price * materialMulti * laminationMulti * cuttingMulti;

  return { priceExVat: Math.max(0, Math.round(price * 100) / 100) };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { widthMm, heightMm, quantity, materialName, laminationName, cuttingName } = body as {
      widthMm: number;
      heightMm: number;
      quantity: number;
      materialName: string;
      laminationName: string;
      cuttingName: string;
    };

    // Rate limiting
    const rateLimitCheck = priceRateLimit(req);
    if (rateLimitCheck.limited) {
      return rateLimitCheck.response!;
    }

    if (!widthMm || !heightMm || !quantity) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Chýbajúce požadované parametre' }, { status: 400 })
      );
    }

    // Sanitize inputs
    const width = Number(sanitizeInput(String(widthMm)));
    const height = Number(sanitizeInput(String(heightMm)));
    const qty = Number(sanitizeInput(String(quantity)));

    if (isNaN(width) || isNaN(height) || isNaN(qty) || width <= 0 || height <= 0 || qty <= 0) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Neplatné číselné hodnoty' }, { status: 400 })
      );
    }

    const priceTable = await loadPriceTable();

    const result = computeStickerPrice({
      widthMm: width,
      heightMm: height,
      quantity: qty,
      materialName: materialName || 'Lesklý vinyl',
      laminationName: laminationName || 'Bez laminácie',
      cuttingName: cuttingName || 'Bez výrezu',
    }, priceTable);

    return addSecurityHeaders(NextResponse.json(result));
  } catch (error) {
    console.error('Price calculation error', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Chyba pri výpočte ceny' }, { status: 500 })
    );  }
}
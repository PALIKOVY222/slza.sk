import { NextRequest, NextResponse } from 'next/server';
import priceData from '../../../typocon_plagaty_prices.json';

export const runtime = 'nodejs';

interface PosterPriceEntry {
  id: number;
  width: number;
  height: number;
  material: string;
  quantity: number;
  priceWithVAT: number;
  scraped: boolean;
}

const data = priceData as PosterPriceEntry[];

export async function POST(req: NextRequest) {
  try {
    const { width, height, material, quantity } = await req.json();

    if (!width || !height || !material || !quantity) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find exact match
    const entry = data.find(
      (item) =>
        item.width === width &&
        item.height === height &&
        item.material === material &&
        item.quantity === quantity &&
        item.scraped
    );

    if (entry) {
      const totalWithVat = entry.priceWithVAT;
      const totalWithoutVat = totalWithVat / 1.2;
      const unitPriceWithoutVat = totalWithoutVat / quantity;

      return NextResponse.json({
        width,
        height,
        material,
        quantity,
        unitPriceWithoutVat: Math.round(unitPriceWithoutVat * 100) / 100,
        totalWithoutVat: Math.round(totalWithoutVat * 100) / 100,
        totalWithVat: Math.round(totalWithVat * 100) / 100,
      });
    }

    // If no exact match, return error
    return NextResponse.json(
      { error: 'No price data for this configuration' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Poster price API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

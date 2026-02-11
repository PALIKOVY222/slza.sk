import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let nextNumber = 1;
    try {
      // Find last order number for this month
      const lastOrder = await prisma.order.findFirst({
        where: {
          orderNumber: {
            startsWith: yearMonth
          }
        },
        orderBy: {
          orderNumber: 'desc'
        }
      });

      if (lastOrder && lastOrder.orderNumber) {
        const parts = lastOrder.orderNumber.split('-');
        if (parts.length === 2) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }
    } catch {
      // DB unavailable – use timestamp-based fallback
      nextNumber = parseInt(
        `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`,
        10
      );
    }

    const orderNumber = `${yearMonth}-${nextNumber}`;

    return NextResponse.json({ orderNumber });
  } catch (error) {
    console.error('Generate order number error:', error);
    return NextResponse.json(
      { error: 'Failed to generate order number' },
      { status: 500 }
    );
  }
}

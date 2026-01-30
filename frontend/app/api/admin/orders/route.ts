import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // TODO: Add authentication check - verify admin role from authToken
    // For now, returning all orders for demo purposes
    
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        company: {
          select: {
            name: true,
            vatId: true,
            taxId: true,
          },
        },
        billingAddress: true,
        shippingAddress: true,
        items: true,
        uploads: true,
        invoices: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

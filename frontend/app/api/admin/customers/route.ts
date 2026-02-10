import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            name: true,
            vatId: true,
            taxId: true
          }
        },
        orders: {
          select: {
            total: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const customers = users.map((user) => {
      const ordersTotal = user.orders.reduce((sum, order) => sum + (order.total || 0), 0);
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        company: user.company,
        ordersCount: user.orders.length,
        ordersTotal
      };
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

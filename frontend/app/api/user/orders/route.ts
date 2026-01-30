import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Neprihlásený' },
        { status: 401 }
      );
    }

    // Find user by session token
    const user = await prisma.user.findFirst({
      where: {
        sessionToken: sessionToken,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Neplatná relácia' },
        { status: 401 }
      );
    }

    // Fetch user's orders with items
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        orderItems: {
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Chyba pri načítaní objednávok' },
      { status: 500 }
    );
  }
}

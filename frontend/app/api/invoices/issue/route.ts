import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, dueDate } = body as { orderId: string; dueDate?: string };

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({ where: { orderId } });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'ISSUED',
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate
      }
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Invoice',
        entityId: updated.id,
        action: 'ISSUED',
        payload: { orderId }
      }
    });

    return NextResponse.json({ invoiceId: updated.id, status: updated.status });
  } catch (error) {
    console.error('Invoice issue error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

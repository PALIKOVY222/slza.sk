import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    const body = await request.json();
    const { status, trackingNumber } = body;

    // Build update data
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
      
      // Auto-update payment status when order is marked as PAID
      if (status === 'PAID') {
        updateData.paymentStatus = 'PAID';
        updateData.paidAt = new Date();
      }
      
      // Auto-update shipment when marked as SHIPPED
      if (status === 'SHIPPED') {
        updateData.shippedAt = new Date();
      }
    }
    
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Chyba pri aktualizácii objednávky' },
      { status: 500 }
    );
  }
}

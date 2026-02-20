import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessionToken } from '../../../lib/security';
import { uploadToOwnCloud } from '../../../lib/owncloud';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '../../../lib/mailer';

async function buildOrderNumber() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
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

  let nextNumber = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const parts = lastOrder.orderNumber.split('-');
    if (parts.length === 2) {
      nextNumber = parseInt(parts[1], 10) + 1;
    }
  }

  return `${yearMonth}-${nextNumber}`;
}

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber: providedOrderNumber,
      customer,
      company,
      billingAddress,
      shippingAddress,
      items,
      totals,
      discount,
      uploads,
      payment,
      shipping: shippingInfo,
      note
    } = body as {
      orderNumber?: string;
      customer: {
        email: string;
        name: string;
        phone?: string;
        userId?: string;
      };
      company?: {
        name: string;
        vatId?: string;
        taxId?: string;
        registration?: string;
        email?: string;
        phone?: string;
      };
      billingAddress?: {
        name?: string;
        street?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
      shippingAddress?: {
        name?: string;
        street?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
      items: Array<{
        productSlug: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        options?: any;
      }>;
      uploads?: Array<{
        fileName: string;
        mimeType?: string;
        fileSize?: number;
        url: string;
      }>;
      totals: {
        subtotal: number;
        vatTotal: number;
        total: number;
        vatRate?: number;
        currency?: string;
      };
      payment?: {
        method: string;
        status?: string;
      };
      discount?: {
        code: string;
        percent: number;
        amount: number;
      };
      shipping?: {
        method: string;
        cost: number;
        packetaPointId?: string;
        packetaPointName?: string;
      };
      note?: string;
    };

    if (!customer?.email || !customer?.name || !items?.length) {
      return NextResponse.json({ error: 'Missing order data.' }, { status: 400 });
    }

    const sessionToken = req.cookies.get('session_token')?.value || getSessionToken(req);
    let sessionUserId: string | undefined;
    let order: { id: string } | null = null;
    let dbAvailable = true;

    try {
      if (sessionToken) {
        const session = await prisma.session.findUnique({
          where: { token: sessionToken }
        });
        if (session && session.expiresAt > new Date()) {
          sessionUserId = session.userId;
        }
      }
    } catch {
      // DB unavailable for session lookup
      dbAvailable = false;
    }

    // Use provided orderNumber or generate new one
    const orderNumber = providedOrderNumber || await buildOrderNumber().catch(() => {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    });

    if (dbAvailable) {
      try {
        const companyRecord = company?.name
          ? await prisma.company.create({
              data: {
                name: company.name,
                vatId: company.vatId,
                taxId: company.taxId,
                registration: company.registration,
                email: company.email,
                phone: company.phone
              }
            })
          : null;

        const billing = billingAddress
          ? await prisma.address.create({
              data: {
                type: 'billing',
                name: billingAddress.name,
                street: billingAddress.street,
                city: billingAddress.city,
                postalCode: billingAddress.postalCode,
                country: billingAddress.country,
                companyId: companyRecord?.id
              }
            })
          : null;

        const shipping = shippingAddress
          ? await prisma.address.create({
              data: {
                type: 'shipping',
                name: shippingAddress.name,
                street: shippingAddress.street,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                companyId: companyRecord?.id
              }
            })
          : null;

        order = await prisma.order.create({
          data: {
            orderNumber,
            status: 'NEW',
            currency: totals.currency || 'EUR',
            vatRate: totals.vatRate ?? 0.23,
            subtotal: totals.subtotal,
            vatTotal: totals.vatTotal,
            total: totals.total,
            customerEmail: customer.email,
            customerName: customer.name,
            customerPhone: customer.phone,
            note,
            discountCode: discount?.code,
            discountAmount: discount?.amount ?? 0,
            paymentMethod: payment?.method,
            paymentStatus: payment?.status || 'pending',
            shippingMethod: shippingInfo?.method,
            shippingCost: shippingInfo?.cost ?? 0,
            packetaPointId: shippingInfo?.packetaPointId,
            packetaPointName: shippingInfo?.packetaPointName,
            userId: customer.userId || sessionUserId,
            companyId: companyRecord?.id,
            billingAddressId: billing?.id,
            shippingAddressId: shipping?.id,
            items: {
              create: items.map((item) => ({
                productSlug: item.productSlug,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                options: item.options ?? undefined
              }))
            },
            uploads: uploads?.length
              ? {
                  create: uploads.map((upload) => ({
                    fileName: upload.fileName,
                    mimeType: upload.mimeType,
                    fileSize: upload.fileSize,
                    url: upload.url
                  }))
                }
              : undefined
          }
        });
      } catch (dbError) {
        console.error('DB write failed, continuing with email-only:', dbError);
        dbAvailable = false;
      }
    }

    // Send email notifications
    try {
      await sendOrderConfirmationEmail({
        to: customer.email,
        name: customer.name,
        orderNumber,
        total: totals.total,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.totalPrice
        })),
        paymentMethod: payment?.method || 'card',
        shippingMethod: shippingInfo?.method || 'packeta'
      });

      await sendAdminOrderNotification({
        orderNumber,
        customerName: customer.name,
        customerEmail: customer.email,
        total: totals.total,
        items: items.map(item => ({
          productName: item.productName,
          quantity: item.quantity
        }))
      });
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      // Don't fail the order if email sending fails
    }

    if (dbAvailable && order) {
      try {
        await prisma.auditLog.create({
          data: {
            entityType: 'Order',
            entityId: order.id,
            action: 'CREATED',
            payload: { orderNumber, itemsCount: items.length }
          }
        });
      } catch {
        // audit log is non-critical
      }
    }

    return NextResponse.json({ orderId: order?.id || orderNumber, orderNumber });
  } catch (error) {
    console.error('Order create error', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { uploadToOwnCloud } from '../../../lib/owncloud';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendInvoiceEmail } from '../../../lib/mailer';
import { buildInvoicePdf } from '../../../lib/invoice';

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
      uploads,
      payment,
      shipping,
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

    // Use provided orderNumber or generate new one
    const orderNumber = providedOrderNumber || await buildOrderNumber();
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'NEW',
        currency: totals.currency || 'EUR',
        vatRate: totals.vatRate ?? 0.2,
        subtotal: totals.subtotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone,
        note,
        paymentMethod: payment?.method,
        paymentStatus: payment?.status || 'pending',
        shippingMethod: shipping?.method,
        shippingCost: shipping?.cost ?? 0,
        packetaPointId: shipping?.packetaPointId,
        packetaPointName: shipping?.packetaPointName,
        userId: customer.userId,
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

    // Generate and send invoice if enabled
    const enableInvoices = process.env.ENABLE_INVOICES === 'true';
    
    if (enableInvoices) {
      try {
        // Generate invoice PDF
        const invoiceNumber = `F-${orderNumber}`;
        const pdfBuffer = await buildInvoicePdf({
          invoiceNumber,
          orderNumber,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone
          },
          company: company ? {
            name: company.name,
            vatId: company.vatId,
            taxId: company.taxId,
            registration: company.registration,
            email: company.email,
            phone: company.phone
          } : undefined,
          items: items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          })),
          totals: {
            subtotal: totals.subtotal,
            vatTotal: totals.vatTotal,
            total: totals.total,
            currency: totals.currency,
            vatRate: totals.vatRate
          }
        });

        // Upload invoice to ownCloud
        const now = new Date();
        const dateFolder = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const invoicePath = `/faktury/${dateFolder}/${invoiceNumber}.pdf`;
        
        await uploadToOwnCloud(pdfBuffer, invoicePath, 'application/pdf');

        // Save invoice reference in database
        await prisma.upload.create({
          data: {
            orderId: order.id,
            fileName: `${invoiceNumber}.pdf`,
            mimeType: 'application/pdf',
            fileSize: pdfBuffer.length,
            url: invoicePath
          }
        });

        // Send invoice email
        await sendInvoiceEmail({
          to: customer.email,
          name: customer.name,
          invoiceNumber,
          orderNumber,
          pdfBuffer
        });

        console.log(`Invoice ${invoiceNumber} generated and sent successfully`);
      } catch (invoiceError) {
        console.error('Failed to generate/send invoice:', invoiceError);
        // Don't fail the order if invoice generation fails
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
        shippingMethod: shipping?.method || 'packeta'
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

    await prisma.auditLog.create({
      data: {
        entityType: 'Order',
        entityId: order.id,
        action: 'CREATED',
        payload: { orderNumber, itemsCount: items.length }
      }
    });

    return NextResponse.json({ orderId: order.id, orderNumber });
  } catch (error) {
    console.error('Order create error', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

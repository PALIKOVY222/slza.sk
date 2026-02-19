import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@slza.sk';
const ADMIN_EMAIL = process.env.EMAIL_TO || process.env.ADMIN_EMAIL || 'kovac.jr@slza.sk';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendInvoiceEmail(params: {
  to: string;
  name: string;
  invoiceNumber: string;
  orderNumber: string;
  pdfBuffer: Buffer;
}) {
  if (!resend) {
    throw new Error('Resend not configured – RESEND_API_KEY missing');
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: `Faktúra ${params.invoiceNumber} – SLZA Print`,
    text: `Dobrý deň ${params.name},\n\nĎakujeme za objednávku ${params.orderNumber}. V prílohe nájdete faktúru ${params.invoiceNumber}.\n\nSLZA Print`,
    attachments: [
      {
        filename: `${params.invoiceNumber}.pdf`,
        content: params.pdfBuffer
      }
    ]
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  name: string;
  orderNumber: string;
  total: number;
  items: Array<{ productName: string; quantity: number; price: number }>;
  paymentMethod: string;
  shippingMethod: string;
}) {
  if (!resend) {
    console.warn('Resend not configured (RESEND_API_KEY missing) – skipping customer email');
    return;
  }

  const paymentLabels: Record<string, string> = {
    card: 'Platobná karta',
    bank_transfer: 'Bankový prevod',
    cash_on_delivery: 'Dobierka'
  };

  const shippingLabels: Record<string, string> = {
    packeta: 'Packeta',
    courier: 'Kuriér',
    personal_pickup: 'Osobný odber'
  };

  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} €</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0087E3;">Potvrdenie objednávky</h1>
      <p>Dobrý deň ${params.name},</p>
      <p>Ďakujeme za vašu objednávku. Vaše číslo objednávky je: <strong>${params.orderNumber}</strong></p>
      
      <h2 style="margin-top: 30px;">Objednané produkty:</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Produkt</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Množstvo</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right;">
        <strong>Celkom: ${params.total.toFixed(2)} €</strong>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p style="margin: 5px 0;"><strong>Spôsob platby:</strong> ${paymentLabels[params.paymentMethod] || params.paymentMethod}</p>
        <p style="margin: 5px 0;"><strong>Spôsob dopravy:</strong> ${shippingLabels[params.shippingMethod] || params.shippingMethod}</p>
      </div>
      
      <p style="margin-top: 30px;">V prípade otázok nás neváhajte kontaktovať.</p>
      <p>S pozdravom,<br>Tím SLZA Print</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Tento email bol odoslaný automaticky. Prosím neodpovedajte naň.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: `Potvrdenie objednávky ${params.orderNumber} – SLZA Print`,
    html
  });
}

export async function sendAdminOrderNotification(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ productName: string; quantity: number }>;
}) {
  if (!resend) {
    console.warn('Resend not configured (RESEND_API_KEY missing) – skipping admin email');
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://slza.sk';

  const itemsHtml = params.items
    .map((item) => `<li>${item.productName} (${item.quantity}x)</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0087E3;">Nová objednávka: ${params.orderNumber}</h1>
      <p><strong>Zákazník:</strong> ${params.customerName}</p>
      <p><strong>Email:</strong> ${params.customerEmail}</p>
      <p><strong>Celková suma:</strong> ${params.total.toFixed(2)} €</p>
      
      <h2>Objednané produkty:</h2>
      <ul>
        ${itemsHtml}
      </ul>
      
      <p style="margin-top: 30px;">
        <a href="${siteUrl}/admin" style="background-color: #0087E3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zobraziť v admin paneli</a>
      </p>
    </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `Nová objednávka ${params.orderNumber} – SLZA Print`,
    html
  });
}


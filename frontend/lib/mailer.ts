import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@slza.sk';

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER
        ? {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        : undefined
    })
  : null;

export async function sendInvoiceEmail(params: {
  to: string;
  name: string;
  invoiceNumber: string;
  orderNumber: string;
  pdfBuffer: Buffer;
}) {
  if (!transporter) {
    throw new Error('SMTP not configured');
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to: params.to,
    subject: `Faktúra ${params.invoiceNumber} – SLZA`,
    text: `Dobrý deň ${params.name},\n\nĎakujeme za objednávku ${params.orderNumber}. V prílohe nájdete faktúru ${params.invoiceNumber}.\n\nSLZA`,
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
  if (!transporter) {
    console.warn('SMTP not configured - skipping email');
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

  await transporter.sendMail({
    from: SMTP_FROM,
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
  if (!transporter) {
    console.warn('SMTP not configured - skipping email');
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_TO || 'kovac.jr@slza.sk';

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
        <a href="http://localhost:3000/admin" style="background-color: #0087E3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zobraziť v admin paneli</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: SMTP_FROM,
    to: adminEmail,
    subject: `Nová objednávka ${params.orderNumber} – SLZA Print`,
    html
  });
}


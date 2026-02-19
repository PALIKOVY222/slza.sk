import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@slza.sk';
const ADMIN_EMAIL = process.env.EMAIL_TO || process.env.ADMIN_EMAIL || 'kovac.jr@slza.sk';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
    bank_transfer: 'Faktúra prevodom',
    cash_on_delivery: 'Dobierka',
    cash_on_pickup: 'Pri prevzatí',
  };

  const shippingLabels: Record<string, string> = {
    packeta: 'Packeta',
    courier: 'Kuriér',
    personal_pickup: 'Osobný odber',
    reproservis: 'Osobný odber – REPROservis',
    borova_sihot: 'Osobný odber – Hotel Borová Sihoť',
  };

  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">${item.productName}</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 14px; color: #555;">${item.quantity}×</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 600; color: #333;">${item.price.toFixed(2)} €</td>
        </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #0087E3, #005fa3); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
      <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 24px; font-weight: 700;">Ďakujeme za objednávku!</h1>
      <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 14px;">Objednávka <strong style="color: #fff;">#${params.orderNumber}</strong></p>
    </div>
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
      <p style="margin: 0 0 24px; font-size: 15px; color: #333; line-height: 1.6;">Dobrý deň <strong>${params.name}</strong>,<br>vaša objednávka bola úspešne prijatá. Nižšie nájdete prehľad.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 2px solid #0087E3;">Produkt</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 2px solid #0087E3;">Množ.</th>
            <th style="padding: 10px 16px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; border-bottom: 2px solid #0087E3;">Cena</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="background: #f8f9fb; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: right;">
        <span style="font-size: 14px; color: #555;">Celkom s DPH: </span>
        <span style="font-size: 22px; font-weight: 800; color: #0087E3;">${params.total.toFixed(2)} €</span>
      </div>
      <table style="width: 100%; margin-bottom: 28px;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top; width: 50%;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Spôsob platby</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">${paymentLabels[params.paymentMethod] || params.paymentMethod}</div>
          </td>
          <td style="padding: 8px 0; vertical-align: top; width: 50%;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Doručenie</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">${shippingLabels[params.shippingMethod] || params.shippingMethod}</div>
          </td>
        </tr>
      </table>
      <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 20px;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #666; line-height: 1.6;">V prípade otázok nás kontaktujte na <a href="mailto:slza@slza.sk" style="color: #0087E3; text-decoration: none;">slza@slza.sk</a> alebo telefonicky na <a href="tel:+421911536671" style="color: #0087E3; text-decoration: none;">0911 536 671</a></p>
      <p style="margin: 0; font-size: 13px; color: #666;">S pozdravom, tím <strong>SLZA Print</strong></p>
    </div>
    <div style="text-align: center; padding: 20px; font-size: 11px; color: #aaa;">Tento email bol odoslaný automaticky.</div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Potvrdenie objednávky #${params.orderNumber} – SLZA Print`,
      html
    });
    console.log(`Order confirmation email sent to ${params.to}`);
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
    throw err;
  }
}

export async function sendRegistrationConfirmationEmail(params: {
  to: string;
  firstName: string;
}) {
  if (!resend) {
    throw new Error('Email služba nie je nakonfigurovaná (RESEND_API_KEY chýba).');
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://slza.sk';

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #0087E3, #005fa3); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
      <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 24px; font-weight: 700;">Vitajte v SLZA Print!</h1>
      <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 14px;">Váš účet bol úspešne vytvorený</p>
    </div>
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
      <p style="margin: 0 0 20px; font-size: 15px; color: #333; line-height: 1.6;">Dobrý deň <strong>${params.firstName}</strong>,<br>váš účet bol úspešne vytvorený. Teraz sa môžete prihlásiť a začať nakupovať.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${siteUrl}/login" style="display: inline-block; background: #0087E3; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;">Prihlásiť sa →</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 20px;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #666; line-height: 1.6;">V prípade otázok nás kontaktujte na <a href="mailto:slza@slza.sk" style="color: #0087E3; text-decoration: none;">slza@slza.sk</a> alebo telefonicky na <a href="tel:+421911536671" style="color: #0087E3; text-decoration: none;">0911 536 671</a></p>
      <p style="margin: 0; font-size: 13px; color: #666;">S pozdravom, tím <strong>SLZA Print</strong></p>
    </div>
    <div style="text-align: center; padding: 20px; font-size: 11px; color: #aaa;">Tento email bol odoslaný automaticky.</div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Váš účet bol vytvorený – SLZA Print`,
      html
    });
    console.log(`Registration confirmation email sent to ${params.to}`);
  } catch (err) {
    console.error('Failed to send registration confirmation email:', err);
    // Don't throw – registration should still succeed even if email fails
  }
}

export async function sendAdminNewUserNotification(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
}) {
  if (!resend) {
    console.warn('Resend not configured – skipping admin new user email');
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://slza.sk';
  const fullName = [params.firstName, params.lastName].filter(Boolean).join(' ') || '—';

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
      <h1 style="margin: 0 0 4px; font-size: 20px; color: #111;">👤 Nový používateľ</h1>
      <p style="margin: 0 0 24px; font-size: 14px; color: #888;">Nová registrácia na slza.sk</p>
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Meno</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">${fullName}</div>
          </td>
          <td style="padding: 8px 0; vertical-align: top;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Email</div>
            <div style="font-size: 14px; color: #333;">${params.email}</div>
          </td>
        </tr>
        ${params.phone ? `<tr><td colspan="2" style="padding: 8px 0;"><div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Telefón</div><div style="font-size: 14px; color: #333;">${params.phone}</div></td></tr>` : ''}
        ${params.companyName ? `<tr><td colspan="2" style="padding: 8px 0;"><div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Firma</div><div style="font-size: 14px; color: #333;">${params.companyName}</div></td></tr>` : ''}
      </table>
      <a href="${siteUrl}/admin" style="display: block; text-align: center; background: #0087E3; color: #ffffff; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Otvoriť admin panel →</a>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `👤 Nový používateľ: ${fullName} (${params.email})`,
      html
    });
    console.log(`Admin new user notification sent to ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('Failed to send admin new user notification:', err);
  }
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
    .map((item) => `<li style="padding: 4px 0; font-size: 14px; color: #333;">${item.productName} <span style="color: #888;">(${item.quantity}×)</span></li>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
      <h1 style="margin: 0 0 4px; font-size: 20px; color: #111;">📦 Nová objednávka</h1>
      <p style="margin: 0 0 24px; font-size: 14px; color: #888;">#${params.orderNumber}</p>
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; vertical-align: top;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Zákazník</div>
            <div style="font-size: 14px; font-weight: 600; color: #333;">${params.customerName}</div>
            <div style="font-size: 13px; color: #666;">${params.customerEmail}</div>
          </td>
          <td style="padding: 8px 0; vertical-align: top; text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px;">Celková suma</div>
            <div style="font-size: 22px; font-weight: 800; color: #0087E3;">${params.total.toFixed(2)} €</div>
          </td>
        </tr>
      </table>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 8px;">Položky</div>
      <ul style="margin: 0 0 24px; padding: 0 0 0 20px; list-style: disc;">${itemsHtml}</ul>
      <a href="${siteUrl}/admin" style="display: block; text-align: center; background: #0087E3; color: #ffffff; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Otvoriť admin panel →</a>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `📦 Nová objednávka #${params.orderNumber} – ${params.customerName} – ${params.total.toFixed(2)} €`,
      html
    });
    console.log(`Admin notification email sent to ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('Failed to send admin notification email:', err);
    throw err;
  }
}


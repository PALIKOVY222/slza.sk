import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const latinize = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();

export async function buildInvoicePdf(params: {
  invoiceNumber: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  company?: {
    name: string;
    vatId?: string;
    taxId?: string;
    registration?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
  totals: { subtotal: number; vatTotal: number; total: number; currency?: string; vatRate?: number };
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;
  const left = 50;

  page.drawText(latinize('Faktúra'), {
    x: left,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1)
  });

  y -= 30;
  page.drawText(latinize(`Číslo faktúry: ${params.invoiceNumber}`), { x: left, y, size: 11, font });
  y -= 16;
  page.drawText(latinize(`Číslo objednávky: ${params.orderNumber}`), { x: left, y, size: 11, font });
  y -= 16;
  page.drawText(latinize(`Dátum vystavenia: ${new Date().toLocaleDateString('sk-SK')}`), { x: left, y, size: 11, font });

  y -= 28;
  page.drawText(latinize('Odberateľ:'), { x: left, y, size: 12, font: boldFont });
  y -= 16;
  page.drawText(latinize(params.customer.name), { x: left, y, size: 11, font });
  y -= 14;
  page.drawText(latinize(params.customer.email), { x: left, y, size: 11, font });
  if (params.customer.phone) {
    y -= 14;
    page.drawText(latinize(params.customer.phone), { x: left, y, size: 11, font });
  }

  if (params.company?.name) {
    y -= 22;
    page.drawText(latinize('Firma:'), { x: left, y, size: 12, font: boldFont });
    y -= 16;
    page.drawText(latinize(params.company.name), { x: left, y, size: 11, font });
    if (params.company.vatId) {
      y -= 14;
      page.drawText(latinize(`IČ DPH: ${params.company.vatId}`), { x: left, y, size: 11, font });
    }
    if (params.company.taxId) {
      y -= 14;
      page.drawText(latinize(`DIČ: ${params.company.taxId}`), { x: left, y, size: 11, font });
    }
  }

  y -= 26;
  page.drawText(latinize('Položky:'), { x: left, y, size: 12, font: boldFont });
  y -= 16;

  params.items.forEach((item) => {
    const line = `${item.productName} — ${item.quantity} ks × ${item.unitPrice.toFixed(2)} € = ${item.totalPrice.toFixed(2)} €`;
    page.drawText(latinize(line), { x: left, y, size: 10.5, font });
    y -= 14;
  });

  y -= 10;
  page.drawText(latinize(`Medzisúčet: ${params.totals.subtotal.toFixed(2)} €`), { x: left, y, size: 11, font });
  y -= 14;
  page.drawText(
    latinize(`DPH (${Math.round((params.totals.vatRate ?? 0.2) * 100)}%): ${params.totals.vatTotal.toFixed(2)} €`),
    { x: left, y, size: 11, font }
  );
  y -= 18;
  page.drawText(latinize(`Celkom: ${params.totals.total.toFixed(2)} €`), { x: left, y, size: 13, font: boldFont });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

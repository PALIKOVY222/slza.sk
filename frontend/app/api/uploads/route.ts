import { NextRequest, NextResponse } from 'next/server';
import { uploadToOwnCloud } from '../../../lib/owncloud';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, base64, mimeType, orderId, productSlug, orderNumber } = body as {
      fileName: string;
      base64: string;
      mimeType?: string;
      orderId?: string;
      productSlug?: string;
      orderNumber?: string;
    };

    if (!fileName || !base64) {
      return NextResponse.json({ error: 'fileName and base64 are required.' }, { status: 400 });
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid base64 payload.' }, { status: 400 });
    }

    const dateFolder = new Date().toISOString().slice(0, 10);
    const productFolder = productSlug ? String(productSlug).replace(/[^a-zA-Z0-9._-]/g, '_') : 'nezaradene';
    
    // Add orderNumber prefix to filename if provided
    const finalFileName = orderNumber ? `${orderNumber}_${fileName}` : fileName;
    
    const upload = await uploadToOwnCloud(finalFileName, buffer, undefined, `${dateFolder}/${productFolder}`);

    if (orderId) {
      await prisma.upload.create({
        data: {
          orderId,
          fileName: finalFileName,
          mimeType,
          fileSize: buffer.length,
          url: upload.url
        }
      });
    }

    return NextResponse.json({ url: upload.url, path: upload.path });
  } catch (error) {
    console.error('Upload error', error);
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

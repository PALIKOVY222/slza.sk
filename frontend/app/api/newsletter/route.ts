import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@slza.sk';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Neplatná emailová adresa' }, { status: 400 });
    }

    // Check if email already exists in newsletter
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tento email je už prihlásený na newsletter' },
        { status: 400 }
      );
    }

    // Save to database
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        subscribedAt: new Date(),
      },
    });

    // Send welcome email via Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: 'Ďakujeme za prihlásenie do newslettera - SLZA Print',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0087E3;">Vitajte v SLZA Print newsletteri!</h1>
              <p>Ďakujeme, že ste sa prihlásili do nášho newslettera.</p>
              <p>Budeme vás informovať o:</p>
              <ul>
                <li>Nových produktoch a službách</li>
                <li>Špeciálnych akciách a zľavách</li>
                <li>Tipoch a radách pre tlač</li>
              </ul>
              <p>S pozdravom,<br>Tím SLZA Print</p>
              <hr style="margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                Ak si neželáte prijímať ďalšie správy, kontaktujte nás na info@slza.sk
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email via Resend:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Úspešne ste sa prihlásili do newslettera!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Nepodarilo sa prihlásiť do newslettera' },
      { status: 500 }
    );
  }
}

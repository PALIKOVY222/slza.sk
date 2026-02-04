import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { EmailTemplates } from '@/lib/email-templates';

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

    // Check if email already exists in newsletter (skip if no DB)
    try {
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
    } catch (dbError) {
      console.error('Database error (skipping):', dbError);
      // Continue without DB - just send email
    }

    // Send welcome email via Resend
    if (resend) {
      try {
        const template = EmailTemplates.newsletterWelcome(email);
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: template.subject,
          html: template.html,
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

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplates } from '@/lib/email-templates';

export const runtime = 'nodejs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@slza.sk';
const EMAIL_TO = process.env.EMAIL_TO || 'kovac.jr@slza.sk';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Neplatná emailová adresa' }, { status: 400 });
    }

    // Skip database - just send emails

    // Send emails via Resend
    if (resend) {
      try {
        // 1. Send welcome email to subscriber
        const template = EmailTemplates.newsletterWelcome(email);
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        // 2. Send notification to admin
        await resend.emails.send({
          from: EMAIL_FROM,
          to: EMAIL_TO,
          subject: `🎉 Nový newsletter subscriber: ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Nový newsletter subscriber!</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Čas:</strong> ${new Date().toLocaleString('sk-SK')}</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        return NextResponse.json(
          { error: 'Nepodarilo sa odoslať email. Skúste to neskôr.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Email služba nie je nakonfigurovaná.' },
        { status: 500 }
      );
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

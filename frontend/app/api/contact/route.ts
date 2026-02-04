import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { EmailTemplates } from '@/lib/email-templates';

export const runtime = 'nodejs';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@slza.sk';
const EMAIL_TO = process.env.EMAIL_TO || 'info@slza.sk';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function verifyTurnstile(token: string, ip?: string) {
  if (!TURNSTILE_SECRET_KEY) return false;

  const body = new URLSearchParams();
  body.append('secret', TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });

  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

function sanitize(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 2000);
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, subject, message, token, website } = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      token?: string;
      website?: string;
    };

    // Honeypot catches basic bots
    if (website) {
      return NextResponse.json({ error: 'Blocked' }, { status: 400 });
    }

    const normalized = {
      firstName: sanitize(firstName),
      lastName: sanitize(lastName),
      email: sanitize(email),
      phone: sanitize(phone),
      subject: sanitize(subject),
      message: sanitize(message),
      token: sanitize(token),
    };

    if (!normalized.firstName || !normalized.lastName || !normalized.email || !normalized.message || !normalized.token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(normalized.email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!TURNSTILE_SECRET_KEY) {
      return NextResponse.json({ error: 'Turnstile secret key missing' }, { status: 500 });
    }

    const forwardedFor = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const verified = await verifyTurnstile(normalized.token, forwardedFor || undefined);
    if (!verified) {
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
    }

    const contactData = {
      name: `${normalized.firstName} ${normalized.lastName}`,
      email: normalized.email,
      phone: normalized.phone,
      subject: normalized.subject,
      message: normalized.message,
    };

    // Save to database
    try {
      await prisma.contactMessage.create({
        data: {
          name: `${normalized.firstName} ${normalized.lastName}`,
          email: normalized.email,
          phone: normalized.phone || null,
          subject: normalized.subject || null,
          message: normalized.message,
        },
      });
    } catch (dbError) {
      console.error('Failed to save contact message to database:', dbError);
      // Continue anyway to send email
    }

    if (resend) {
      try {
        // 1. Send notification to admin
        const adminTemplate = EmailTemplates.contactNotification(contactData);
        await resend.emails.send({
          from: EMAIL_FROM,
          to: EMAIL_TO,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        });

        // 2. Send confirmation to customer
        const confirmTemplate = EmailTemplates.contactConfirmation(contactData.name);
        await resend.emails.send({
          from: EMAIL_FROM,
          to: normalized.email,
          subject: confirmTemplate.subject,
          html: confirmTemplate.html,
        });
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // Don't fail the request if email sending fails
      }
    } else {
      console.warn('Resend not configured. Received contact message from:', normalized.email);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact API error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

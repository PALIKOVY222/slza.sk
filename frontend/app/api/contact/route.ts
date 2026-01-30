import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const SMTP_TO = process.env.SMTP_TO;

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM && SMTP_TO);

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

    const bodyText = [
      `Meno: ${normalized.firstName} ${normalized.lastName}`,
      `Email: ${normalized.email}`,
      `Telefón: ${normalized.phone || '-'} `,
      `Predmet: ${normalized.subject || '-'} `,
      'Správa:',
      normalized.message,
    ].join('\n');

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

    if (hasSmtpConfig) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: SMTP_FROM,
        to: SMTP_TO,
        subject: `SLZA Kontakt: ${normalized.subject || 'Nová správa'}`,
        text: bodyText,
      });
    } else {
      console.warn('SMTP not configured. Received contact message:', bodyText);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact API error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

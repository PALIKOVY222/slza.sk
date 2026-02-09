import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma';
import { rateLimit, sanitizeInput, validateEmail, addSecurityHeaders } from '../../../../lib/security';

export const runtime = 'nodejs';

const loginRateLimit = rateLimit({ windowMs: 60000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitCheck = loginRateLimit(req);
  if (rateLimitCheck.limited) {
    return rateLimitCheck.response!;
  }

  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    // Input validation
    if (!email || !password) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Email a heslo sú povinné.' }, { status: 400 })
      );
    }

    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Neplatný formát emailu.' }, { status: 400 })
      );
    }

    // Try-catch for database connection errors
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Služba momentálne nie je dostupná. Skúste neskôr.' },
          { status: 503 }
        )
      );
    }

    if (!user) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Neplatné prihlasovacie údaje.' }, { status: 401 })
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Neplatné prihlasovacie údaje.' }, { status: 401 })
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    try {
      await prisma.session.create({
        data: {
          token,
          userId: user.id,
          expiresAt
        }
      });
    } catch (dbError) {
      console.error('Session creation error:', dbError);
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Nie je možné vytvoriť reláciu. Skúste neskôr.' },
          { status: 500 }
        )
      );
    }

    return addSecurityHeaders(
      NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          companyId: user.companyId
        }
      })
    );
  } catch (error) {
    console.error('Login error', error);
    const message = 'Interná chyba servera.';
    return addSecurityHeaders(
      NextResponse.json({ error: message }, { status: 500 })
    );

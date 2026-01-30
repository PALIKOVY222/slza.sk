import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      company
    } = body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      company?: {
        name: string;
        vatId?: string;
        taxId?: string;
        registration?: string;
        email?: string;
        phone?: string;
      };
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        company: company?.name
          ? {
              create: {
                name: company.name,
                vatId: company.vatId,
                taxId: company.taxId,
                registration: company.registration,
                email: company.email,
                phone: company.phone
              }
            }
          : undefined
      }
    });

    return NextResponse.json({
      id: created.id,
      email: created.email
    });
  } catch (error) {
    console.error('Register error', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

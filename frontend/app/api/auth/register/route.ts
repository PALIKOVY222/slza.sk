import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { sendRegistrationConfirmationEmail, sendAdminNewUserNotification } from '../../../../lib/mailer';

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
      street,
      city,
      postalCode,
      country,
      company
    } = body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
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

    // Create address record if any address field was provided
    if (street || city || postalCode) {
      await prisma.address.create({
        data: {
          type: 'billing',
          street: street || '',
          city: city || '',
          postalCode: postalCode || '',
          country: country || 'Slovensko',
          userId: created.id
        }
      });
    }

    // Send registration confirmation email (non-blocking)
    sendRegistrationConfirmationEmail({
      to: created.email,
      firstName: firstName || created.email.split('@')[0],
    }).catch(console.error);

    // Notify admin about new user (non-blocking)
    sendAdminNewUserNotification({
      email: created.email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      companyName: company?.name,
    }).catch(console.error);

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

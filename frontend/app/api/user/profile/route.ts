import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionToken, sanitizeInput, validateEmail, validatePhone } from '@/lib/security';

async function getAuthenticatedUser(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value || getSessionToken(request);
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: { company: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Neprihlásený' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            vatId: user.company.vatId,
            taxId: user.company.taxId,
            registration: user.company.registration,
            email: user.company.email,
            phone: user.company.phone,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Chyba pri načítaní profilu' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Neprihlásený' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, company } = body;

    // Validate
    if (firstName !== undefined && typeof firstName !== 'string') {
      return NextResponse.json({ error: 'Neplatné meno' }, { status: 400 });
    }
    if (lastName !== undefined && typeof lastName !== 'string') {
      return NextResponse.json({ error: 'Neplatné priezvisko' }, { status: 400 });
    }
    if (phone !== undefined && phone !== '' && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Neplatné telefónne číslo (formát: +421... alebo 09...)' }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName !== undefined ? sanitizeInput(firstName) : undefined,
        lastName: lastName !== undefined ? sanitizeInput(lastName) : undefined,
        phone: phone !== undefined ? sanitizeInput(phone) : undefined,
      },
      include: { company: true },
    });

    // Update company if present
    if (company && user.companyId) {
      await prisma.company.update({
        where: { id: user.companyId },
        data: {
          name: company.name !== undefined ? sanitizeInput(company.name) : undefined,
          vatId: company.vatId !== undefined ? sanitizeInput(company.vatId) : undefined,
          taxId: company.taxId !== undefined ? sanitizeInput(company.taxId) : undefined,
          registration: company.registration !== undefined ? sanitizeInput(company.registration) : undefined,
          email: company.email !== undefined ? sanitizeInput(company.email) : undefined,
          phone: company.phone !== undefined ? sanitizeInput(company.phone) : undefined,
        },
      });
    }

    // Update localStorage data (will be synced on client)
    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: refreshedUser!.id,
        email: refreshedUser!.email,
        firstName: refreshedUser!.firstName,
        lastName: refreshedUser!.lastName,
        phone: refreshedUser!.phone,
        role: refreshedUser!.role,
        company: refreshedUser!.company
          ? {
              id: refreshedUser!.company.id,
              name: refreshedUser!.company.name,
              vatId: refreshedUser!.company.vatId,
              taxId: refreshedUser!.company.taxId,
              registration: refreshedUser!.company.registration,
              email: refreshedUser!.company.email,
              phone: refreshedUser!.company.phone,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Chyba pri aktualizácii profilu' }, { status: 500 });
  }
}

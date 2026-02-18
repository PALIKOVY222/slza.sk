import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionToken, generateToken } from '@/lib/security';
import bcrypt from 'bcryptjs';

async function getAuthenticatedUser(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value || getSessionToken(request);
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Neprihlásený' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Vyplňte aktuálne aj nové heslo' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Nové heslo musí mať minimálne 8 znakov' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Aktuálne heslo je nesprávne' },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // TODO: In the future, send confirmation email via Resend
    // await resend.emails.send({
    //   from: 'noreply@slza.sk',
    //   to: user.email,
    //   subject: 'Heslo bolo zmenené',
    //   html: '<p>Vaše heslo bolo úspešne zmenené.</p>',
    // });

    return NextResponse.json({ success: true, message: 'Heslo bolo úspešne zmenené' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Chyba pri zmene hesla' }, { status: 500 });
  }
}

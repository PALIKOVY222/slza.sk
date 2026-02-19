import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'slza-1160sk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body as { username: string; password: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Meno a heslo sú povinné.' },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Nesprávne prihlasovacie údaje.' },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');

    const response = NextResponse.json({
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'ADMIN',
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Interná chyba servera.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'slza2026';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === SITE_PASSWORD) {
      // Create response with cookie
      const response = NextResponse.json({ success: true });
      
      // Set cookie that expires in 7 days
      response.cookies.set('site_access', SITE_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

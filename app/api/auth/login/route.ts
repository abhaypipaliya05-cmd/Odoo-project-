import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required.',
          },
        },
        { status: 400 }
      );
    }

    // Standard demo checks
    const user = {
      ...db.user,
      email,
      name: email.split('@')[0].replace(/[\._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || db.user.name,
    };

    return NextResponse.json({
      success: true,
      data: {
        user,
        token: 'mock_jwt_token_' + Date.now(),
      },
      message: 'Logged in successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name, email, and password are required.',
          },
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password must be at least 6 characters.',
          },
        },
        { status: 400 }
      );
    }

    const newUser = {
      ...db.user,
      id: 'usr_' + Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    db.user = newUser;

    return NextResponse.json({
      success: true,
      data: {
        user: newUser,
        token: 'mock_jwt_token_' + Date.now(),
      },
      message: 'Account created successfully',
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

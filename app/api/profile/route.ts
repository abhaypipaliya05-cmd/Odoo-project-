import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: db.user,
      message: 'Profile fetched successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to fetch profile',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, avatar, bio, homeCity, currency, language } = body;

    db.user = {
      ...db.user,
      name: name !== undefined ? name : db.user.name,
      avatar: avatar !== undefined ? avatar : db.user.avatar,
      bio: bio !== undefined ? bio : db.user.bio,
      homeCity: homeCity !== undefined ? homeCity : db.user.homeCity,
      currency: currency !== undefined ? currency : db.user.currency,
      language: language !== undefined ? language : db.user.language,
    };

    return NextResponse.json({
      success: true,
      data: db.user,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to update profile',
        },
      },
      { status: 500 }
    );
  }
}

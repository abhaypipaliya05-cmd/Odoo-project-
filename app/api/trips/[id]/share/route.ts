import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trip = db.trips.find((t) => t.id === params.id);

    if (!trip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Trip not found',
          },
        },
        { status: 404 }
      );
    }

    // Toggle public share token
    const token = trip.shareToken || 'tok_' + Math.random().toString(36).substring(2, 10);
    trip.shareToken = token;
    trip.visibility = 'public';

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        shareToken: token,
        visibility: trip.visibility,
      },
      message: 'Share link generated',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to generate share link',
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Trip } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const originalTrip = db.trips.find((t) => t.id === params.id);

    if (!originalTrip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Original trip not found',
          },
        },
        { status: 404 }
      );
    }

    const clonedTrip: Trip = {
      ...originalTrip,
      id: 'trip_' + Date.now(),
      title: `${originalTrip.title} (Copy)`,
      userId: db.user.id,
      shareToken: 'tok_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    };

    db.trips.unshift(clonedTrip);

    return NextResponse.json({
      success: true,
      data: clonedTrip,
      message: 'Trip cloned successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to clone trip',
        },
      },
      { status: 500 }
    );
  }
}

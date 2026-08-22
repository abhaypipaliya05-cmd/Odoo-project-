import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const savedDestinations = db.destinations
      .filter((d) => db.savedDestinationIds.has(d.id))
      .map((d) => ({
        ...d,
        isSaved: true,
      }));

    return NextResponse.json({
      success: true,
      data: savedDestinations,
      message: 'Saved destinations retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to retrieve saved destinations',
        },
      },
      { status: 500 }
    );
  }
}

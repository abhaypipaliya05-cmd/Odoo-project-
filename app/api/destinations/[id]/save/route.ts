import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const destinationId = params.id;
    let isSaved = false;

    if (db.savedDestinationIds.has(destinationId)) {
      db.savedDestinationIds.delete(destinationId);
      isSaved = false;
    } else {
      db.savedDestinationIds.add(destinationId);
      isSaved = true;
    }

    return NextResponse.json({
      success: true,
      data: { isSaved },
      message: isSaved ? 'Destination saved to wishlist' : 'Destination removed from wishlist',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to update saved destination',
        },
      },
      { status: 500 }
    );
  }
}

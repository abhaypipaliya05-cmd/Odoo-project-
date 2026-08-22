import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();

    let destinations = db.destinations.map((d) => ({
      ...d,
      isSaved: db.savedDestinationIds.has(d.id),
    }));

    if (search) {
      destinations = destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.country.toLowerCase().includes(search) ||
          d.region.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: destinations,
      message: 'Destinations retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to retrieve destinations',
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
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

    return NextResponse.json({
      success: true,
      data: trip,
      message: 'Trip retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to retrieve trip',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const tripIndex = db.trips.findIndex((t) => t.id === params.id);

    if (tripIndex === -1) {
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

    const updatedTrip = {
      ...db.trips[tripIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    db.trips[tripIndex] = updatedTrip;

    return NextResponse.json({
      success: true,
      data: updatedTrip,
      message: 'Trip updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to update trip',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tripIndex = db.trips.findIndex((t) => t.id === params.id);

    if (tripIndex === -1) {
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

    db.trips.splice(tripIndex, 1);

    return NextResponse.json({
      success: true,
      data: { message: 'Trip deleted successfully' },
      message: 'Trip deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to delete trip',
        },
      },
      { status: 500 }
    );
  }
}

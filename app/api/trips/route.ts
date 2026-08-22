import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Trip } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    let filteredTrips = [...db.trips];

    if (status && status !== 'all') {
      filteredTrips = filteredTrips.filter((t) => t.status === status);
    }

    if (search) {
      filteredTrips = filteredTrips.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.destinations?.some((d) => d.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredTrips,
      message: 'Trips retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to retrieve trips',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, budget, currency, coverImage } = body;

    if (!title || !startDate || !endDate || budget === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title, start date, end date, and budget are required.',
          },
        },
        { status: 400 }
      );
    }

    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATES',
            message: 'Start date cannot be after end date.',
          },
        },
        { status: 400 }
      );
    }

    const newTrip: Trip = {
      id: 'trip_' + Date.now(),
      userId: db.user.id,
      title: title.trim(),
      description: description?.trim() || '',
      coverImage:
        coverImage?.trim() ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate,
      endDate,
      budget: Number(budget) || 0,
      currency: currency || db.user.currency || 'USD',
      visibility: 'private',
      shareToken: 'tok_' + Math.random().toString(36).substring(2, 10),
      status: new Date(startDate) > new Date() ? 'upcoming' : 'ongoing',
      destinationCount: 1,
      destinations: [title.split(' ')[0] || 'Worldwide'],
      createdAt: new Date().toISOString(),
      stops: [],
    };

    db.trips.unshift(newTrip);

    return NextResponse.json({
      success: true,
      data: newTrip,
      message: 'Trip created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to create trip',
        },
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const trips = db.trips;
    const destinations = db.destinations.map((d) => ({
      ...d,
      isSaved: db.savedDestinationIds.has(d.id),
    }));

    const upcomingTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'ongoing');
    const totalBudget = trips.reduce((acc, curr) => acc + (curr.budget || 0), 0);

    const stats = {
      totalTrips: trips.length,
      upcomingTrips: upcomingTrips.length,
      savedDestinationsCount: db.savedDestinationIds.size,
      totalBudget,
      currency: db.user.currency || 'USD',
      recentTrips: trips.slice(0, 3),
      recommendedDestinations: destinations.slice(0, 4),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to fetch dashboard stats',
        },
      },
      { status: 500 }
    );
  }
}

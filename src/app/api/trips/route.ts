import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { TripService } from '@/services/trip.service';
import { createTripSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status') || undefined;
    const upcomingOnly = searchParams.get('upcoming') === 'true';

    const trips = await TripService.getUserTrips(authUser.id, {
      status,
      upcomingOnly,
    });

    return apiSuccess(trips);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = createTripSchema.parse(body);

    const trip = await TripService.createTrip(authUser.id, validated);
    return apiSuccess(trip, 'Trip created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

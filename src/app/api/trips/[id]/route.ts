import { NextRequest } from 'next/server';
import { getAuthenticatedUser, requireAuth } from '@/lib/auth';
import { TripService } from '@/services/trip.service';
import { updateTripSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const trip = await TripService.getTripById(params.id, authUser?.id);
    return apiSuccess(trip);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = updateTripSchema.parse(body);

    const updatedTrip = await TripService.updateTrip(params.id, authUser.id, validated);
    return apiSuccess(updatedTrip, 'Trip updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const result = await TripService.deleteTrip(params.id, authUser.id);
    return apiSuccess(result, 'Trip deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

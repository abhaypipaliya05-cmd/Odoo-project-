import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PublicTripService } from '@/services/public-trip.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const clonedTrip = await PublicTripService.cloneTrip(params.id, authUser.id);
    return apiSuccess(clonedTrip, 'Trip successfully cloned to your account', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

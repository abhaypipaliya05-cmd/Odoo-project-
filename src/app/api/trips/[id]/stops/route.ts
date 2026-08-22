import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { createTripStopSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = createTripStopSchema.parse(body);

    const stop = await ItineraryService.addStopToTrip(params.id, authUser.id, validated);
    return apiSuccess(stop, 'Stop added to trip successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

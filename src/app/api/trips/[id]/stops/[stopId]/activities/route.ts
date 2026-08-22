import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { createTripActivitySchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = createTripActivitySchema.parse(body);

    const activity = await ItineraryService.addActivityToStop(
      params.id,
      params.stopId,
      authUser.id,
      validated
    );

    return apiSuccess(activity, 'Activity scheduled successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

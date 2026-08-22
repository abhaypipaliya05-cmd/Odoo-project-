import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { updateTripActivitySchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = updateTripActivitySchema.parse(body);

    const updated = await ItineraryService.updateActivity(
      params.id,
      params.activityId,
      authUser.id,
      validated
    );

    return apiSuccess(updated, 'Scheduled activity updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const result = await ItineraryService.deleteActivity(
      params.id,
      params.activityId,
      authUser.id
    );

    return apiSuccess(result, 'Scheduled activity removed from trip');
  } catch (error) {
    return handleApiError(error);
  }
}

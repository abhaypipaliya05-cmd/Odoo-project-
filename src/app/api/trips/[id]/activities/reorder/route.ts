import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { reorderActivitiesSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = reorderActivitiesSchema.parse(body);

    const result = await ItineraryService.reorderActivities(
      params.id,
      authUser.id,
      validated.activityIds
    );

    return apiSuccess(result, 'Activities reordered successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

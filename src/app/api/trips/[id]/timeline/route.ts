import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const timeline = await ItineraryService.getTimeline(params.id, authUser?.id);
    return apiSuccess(timeline);
  } catch (error) {
    return handleApiError(error);
  }
}

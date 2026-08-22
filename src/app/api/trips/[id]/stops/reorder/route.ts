import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { reorderStopsSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = reorderStopsSchema.parse(body);

    const updatedStops = await ItineraryService.reorderStops(
      params.id,
      authUser.id,
      validated.stopIds
    );

    return apiSuccess(updatedStops, 'Stops reordered successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

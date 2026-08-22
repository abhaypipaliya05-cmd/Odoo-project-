import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryService } from '@/services/itinerary.service';
import { updateTripStopSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = updateTripStopSchema.parse(body);

    const updated = await ItineraryService.updateStop(
      params.id,
      params.stopId,
      authUser.id,
      validated
    );

    return apiSuccess(updated, 'Stop updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const result = await ItineraryService.deleteStop(
      params.id,
      params.stopId,
      authUser.id
    );

    return apiSuccess(result, 'Stop removed from trip');
  } catch (error) {
    return handleApiError(error);
  }
}

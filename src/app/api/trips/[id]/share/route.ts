import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PublicTripService } from '@/services/public-trip.service';
import { shareTripSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = shareTripSchema.parse(body);

    const result = await PublicTripService.setTripSharing(
      params.id,
      authUser.id,
      validated.visibility
    );

    return apiSuccess(result, 'Trip sharing settings updated');
  } catch (error) {
    return handleApiError(error);
  }
}

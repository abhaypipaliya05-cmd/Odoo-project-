import { NextRequest } from 'next/server';
import { PublicTripService } from '@/services/public-trip.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const publicTrip = await PublicTripService.getPublicTripBySlug(params.slug);
    return apiSuccess(publicTrip);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CityService } from '@/services/city.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const result = await CityService.removeSavedDestination(
      authUser.id,
      params.cityId
    );
    return apiSuccess(result, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}

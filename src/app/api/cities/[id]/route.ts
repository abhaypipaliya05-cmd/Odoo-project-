import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { CityService } from '@/services/city.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const city = await CityService.getCityById(params.id, authUser?.id);
    return apiSuccess(city);
  } catch (error) {
    return handleApiError(error);
  }
}

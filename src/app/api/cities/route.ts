import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { CityService } from '@/services/city.service';
import { citiesQuerySchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);

    const query = citiesQuerySchema.parse({
      q: searchParams.get('q') || undefined,
      country: searchParams.get('country') || undefined,
      region: searchParams.get('region') || undefined,
      costIndex: searchParams.get('costIndex') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    const cities = await CityService.getCities(query, authUser?.id);
    return apiSuccess(cities);
  } catch (error) {
    return handleApiError(error);
  }
}

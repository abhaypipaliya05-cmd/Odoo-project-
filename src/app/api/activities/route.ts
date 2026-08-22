import { NextRequest } from 'next/server';
import { CityService } from '@/services/city.service';
import { activitiesQuerySchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = activitiesQuerySchema.parse({
      cityId: searchParams.get('cityId') || undefined,
      category: searchParams.get('category') || undefined,
      maxCost: searchParams.get('maxCost') ? Number(searchParams.get('maxCost')) : undefined,
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    const activities = await CityService.getActivities(query);
    return apiSuccess(activities);
  } catch (error) {
    return handleApiError(error);
  }
}

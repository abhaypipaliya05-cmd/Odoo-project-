import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { CityService } from '@/services/city.service';
import { saveDestinationSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const saved = await CityService.getSavedDestinations(authUser.id);
    return apiSuccess(saved);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = saveDestinationSchema.parse(body);

    const result = await CityService.saveDestination(authUser.id, validated.cityId);
    return apiSuccess(result, result.message, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

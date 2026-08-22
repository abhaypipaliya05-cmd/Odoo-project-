import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { AiService } from '@/services/ai.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const recommendations = await AiService.getPersonalizedRecommendations(
      authUser?.id,
      body
    );

    return apiSuccess(recommendations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const recommendations = await AiService.getPersonalizedRecommendations(authUser?.id);
    return apiSuccess(recommendations);
  } catch (error) {
    return handleApiError(error);
  }
}

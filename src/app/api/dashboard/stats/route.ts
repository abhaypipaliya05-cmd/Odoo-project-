import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { DashboardService } from '@/services/dashboard.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const stats = await DashboardService.getDashboardStats(authUser.id);
    return apiSuccess(stats);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { BudgetService } from '@/services/budget.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    const budget = await BudgetService.calculateTripBudget(params.id, authUser?.id);
    return apiSuccess(budget);
  } catch (error) {
    return handleApiError(error);
  }
}

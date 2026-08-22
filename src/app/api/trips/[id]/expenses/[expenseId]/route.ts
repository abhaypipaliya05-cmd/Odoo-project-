import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { BudgetService } from '@/services/budget.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const result = await BudgetService.deleteExpense(
      params.id,
      params.expenseId,
      authUser.id
    );
    return apiSuccess(result, 'Expense removed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

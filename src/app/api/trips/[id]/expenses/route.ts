import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { BudgetService } from '@/services/budget.service';
import { createExpenseSchema } from '@/lib/validation';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth(req);
    const body = await req.json();
    const validated = createExpenseSchema.parse(body);

    const expense = await BudgetService.addExpense(params.id, authUser.id, validated);
    return apiSuccess(expense, 'Expense added successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

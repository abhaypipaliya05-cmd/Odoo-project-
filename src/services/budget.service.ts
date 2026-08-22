import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { BudgetBreakdown, CategoryExpenseTotal, ExpenseDetail } from '@/types';

export class BudgetService {
  /**
   * Calculate complete budget breakdown for a trip
   */
  static async calculateTripBudget(tripId: string, userId?: string): Promise<BudgetBreakdown> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            activities: {
              include: {
                activity: true,
              },
            },
          },
        },
        expenses: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (userId && trip.userId !== userId && trip.visibility !== 'PUBLIC') {
      throw new ForbiddenError('You do not have permission to view this trip budget');
    }

    // 1. Calculate Transport Total: stops transportCost + TRANSPORT expenses
    const stopsTransportCost = trip.stops.reduce((sum, stop) => sum + (stop.transportCost || 0), 0);
    const transportExpenses = trip.expenses
      .filter((e) => e.category === 'TRANSPORT')
      .reduce((sum, e) => sum + e.amount, 0);
    const transportTotal = stopsTransportCost + transportExpenses;

    // 2. Calculate Stay Total: stops accommodationCost + STAY expenses
    const stopsStayCost = trip.stops.reduce((sum, stop) => sum + (stop.accommodationCost || 0), 0);
    const stayExpenses = trip.expenses
      .filter((e) => e.category === 'STAY')
      .reduce((sum, e) => sum + e.amount, 0);
    const stayTotal = stopsStayCost + stayExpenses;

    // 3. Calculate Activities Total: scheduled activities cost + ACTIVITIES expenses
    let activitiesCost = 0;
    for (const stop of trip.stops) {
      for (const act of stop.activities) {
        if (act.actualCost > 0) {
          activitiesCost += act.actualCost;
        } else if (act.activity && act.activity.estimatedCost > 0) {
          activitiesCost += act.activity.estimatedCost;
        }
      }
    }
    const activitiesExpenses = trip.expenses
      .filter((e) => e.category === 'ACTIVITIES')
      .reduce((sum, e) => sum + e.amount, 0);
    const activitiesTotal = activitiesCost + activitiesExpenses;

    // 4. Calculate Meals Total: MEALS expenses
    const mealsTotal = trip.expenses
      .filter((e) => e.category === 'MEALS')
      .reduce((sum, e) => sum + e.amount, 0);

    // 5. Calculate Miscellaneous Total: MISCELLANEOUS expenses
    const miscTotal = trip.expenses
      .filter((e) => e.category === 'MISCELLANEOUS')
      .reduce((sum, e) => sum + e.amount, 0);

    // 6. Total Estimated Cost
    const totalEstimatedCost = transportTotal + stayTotal + activitiesTotal + mealsTotal + miscTotal;

    // 7. Calculate Duration in Days
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // 8. Daily Average Cost
    const averageDailyCost = parseFloat((totalEstimatedCost / durationDays).toFixed(2));

    // 9. Overbudget Calculation
    const totalBudget = trip.totalBudget || 0;
    const isOverBudget = totalBudget > 0 && totalEstimatedCost > totalBudget;
    const overBudgetAmount = isOverBudget ? parseFloat((totalEstimatedCost - totalBudget).toFixed(2)) : 0;
    const remainingBudget = totalBudget > 0 ? parseFloat(Math.max(0, totalBudget - totalEstimatedCost).toFixed(2)) : 0;

    // 10. Category Breakdown with percentages
    const categoryBreakdown: CategoryExpenseTotal[] = [
      {
        category: 'TRANSPORT',
        total: transportTotal,
        percentage: totalEstimatedCost > 0 ? parseFloat(((transportTotal / totalEstimatedCost) * 100).toFixed(1)) : 0,
      },
      {
        category: 'STAY',
        total: stayTotal,
        percentage: totalEstimatedCost > 0 ? parseFloat(((stayTotal / totalEstimatedCost) * 100).toFixed(1)) : 0,
      },
      {
        category: 'ACTIVITIES',
        total: activitiesTotal,
        percentage: totalEstimatedCost > 0 ? parseFloat(((activitiesTotal / totalEstimatedCost) * 100).toFixed(1)) : 0,
      },
      {
        category: 'MEALS',
        total: mealsTotal,
        percentage: totalEstimatedCost > 0 ? parseFloat(((mealsTotal / totalEstimatedCost) * 100).toFixed(1)) : 0,
      },
      {
        category: 'MISCELLANEOUS',
        total: miscTotal,
        percentage: totalEstimatedCost > 0 ? parseFloat(((miscTotal / totalEstimatedCost) * 100).toFixed(1)) : 0,
      },
    ];

    const expenseList: ExpenseDetail[] = trip.expenses.map((e) => ({
      id: e.id,
      tripId: e.tripId,
      tripStopId: e.tripStopId,
      category: e.category,
      title: e.title,
      amount: e.amount,
      currency: e.currency,
      date: e.date,
      notes: e.notes,
    }));

    return {
      totalBudget,
      currency: trip.currency,
      totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
      remainingBudget,
      isOverBudget,
      overBudgetAmount,
      durationDays,
      averageDailyCost,
      categories: {
        transport: parseFloat(transportTotal.toFixed(2)),
        stay: parseFloat(stayTotal.toFixed(2)),
        activities: parseFloat(activitiesTotal.toFixed(2)),
        meals: parseFloat(mealsTotal.toFixed(2)),
        miscellaneous: parseFloat(miscTotal.toFixed(2)),
      },
      categoryBreakdown,
      expenses: expenseList,
    };
  }

  /**
   * Add a custom expense to a trip
   */
  static async addExpense(
    tripId: string,
    userId: string,
    data: {
      category: 'TRANSPORT' | 'STAY' | 'ACTIVITIES' | 'MEALS' | 'MISCELLANEOUS';
      title: string;
      amount: number;
      currency?: string;
      date?: string;
      notes?: string | null;
      tripStopId?: string | null;
    }
  ) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    if (data.tripStopId) {
      const stop = await prisma.tripStop.findFirst({
        where: { id: data.tripStopId, tripId },
      });
      if (!stop) {
        throw new NotFoundError('Associated trip stop not found');
      }
    }

    const expense = await prisma.expense.create({
      data: {
        tripId,
        tripStopId: data.tripStopId || null,
        category: data.category,
        title: data.title,
        amount: data.amount,
        currency: data.currency || trip.currency || 'USD',
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes || null,
      },
    });

    return expense;
  }

  /**
   * Delete an expense
   */
  static async deleteExpense(tripId: string, expenseId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }
}

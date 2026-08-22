import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors';
import { BudgetService } from './budget.service';
import { TripDetail, TripSummary } from '@/types';

export class TripService {
  /**
   * Get all trips for the authenticated user
   */
  static async getUserTrips(
    userId: string,
    filter?: { status?: string; upcomingOnly?: boolean }
  ): Promise<TripSummary[]> {
    const now = new Date();
    const where: any = { userId };

    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.upcomingOnly) {
      where.endDate = { gte: now };
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        stops: {
          include: {
            city: {
              select: { name: true },
            },
            activities: true,
          },
        },
        expenses: true,
      },
    });

    return trips.map((trip) => {
      // Calculate quick total cost for list view
      const stopsTransport = trip.stops.reduce((sum, s) => sum + (s.transportCost || 0), 0);
      const stopsStay = trip.stops.reduce((sum, s) => sum + (s.accommodationCost || 0), 0);
      const actsCost = trip.stops.reduce(
        (sum, s) => sum + s.activities.reduce((aSum, a) => aSum + (a.actualCost || 0), 0),
        0
      );
      const expensesCost = trip.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalEstimatedCost = stopsTransport + stopsStay + actsCost + expensesCost;

      const cities = Array.from(new Set(trip.stops.map((s) => s.city.name)));

      return {
        id: trip.id,
        userId: trip.userId,
        title: trip.title,
        description: trip.description,
        coverImage: trip.coverImage,
        startDate: trip.startDate,
        endDate: trip.endDate,
        totalBudget: trip.totalBudget,
        currency: trip.currency,
        status: trip.status,
        visibility: trip.visibility,
        shareSlug: trip.shareSlug,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        destinationsCount: trip.stops.length,
        cities,
        totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
      };
    });
  }

  /**
   * Get single trip with full details, stops, activities, and budget
   */
  static async getTripById(tripId: string, userId?: string): Promise<TripDetail> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: [{ scheduledDate: 'asc' }, { orderIndex: 'asc' }],
              include: {
                activity: true,
              },
            },
            expenses: true,
          },
        },
        expenses: true,
      },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (userId && trip.userId !== userId && trip.visibility !== 'PUBLIC') {
      throw new ForbiddenError('You do not have permission to view this trip');
    }

    const budgetSummary = await BudgetService.calculateTripBudget(tripId, userId);

    return {
      id: trip.id,
      userId: trip.userId,
      title: trip.title,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      status: trip.status,
      visibility: trip.visibility,
      shareSlug: trip.shareSlug,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      user: trip.user,
      stops: trip.stops.map((stop) => ({
        id: stop.id,
        tripId: stop.tripId,
        cityId: stop.cityId,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        orderIndex: stop.orderIndex,
        accommodationName: stop.accommodationName,
        accommodationCost: stop.accommodationCost,
        transportType: stop.transportType,
        transportCost: stop.transportCost,
        notes: stop.notes,
        city: stop.city,
        activities: stop.activities.map((act) => ({
          id: act.id,
          tripStopId: act.tripStopId,
          activityId: act.activityId,
          customTitle: act.customTitle,
          customDescription: act.customDescription,
          category: act.category,
          scheduledDate: act.scheduledDate,
          startTime: act.startTime,
          durationMinutes: act.durationMinutes,
          actualCost: act.actualCost,
          status: act.status,
          notes: act.notes,
          orderIndex: act.orderIndex,
          activity: act.activity
            ? {
                ...act.activity,
                cityName: stop.city.name,
                countryName: stop.city.country,
              }
            : null,
        })),
      })),
      expenses: trip.expenses.map((e) => ({
        id: e.id,
        tripId: e.tripId,
        tripStopId: e.tripStopId,
        category: e.category,
        title: e.title,
        amount: e.amount,
        currency: e.currency,
        date: e.date,
        notes: e.notes,
      })),
      budgetSummary,
    };
  }

  /**
   * Create a new trip
   */
  static async createTrip(
    userId: string,
    data: {
      title: string;
      description?: string | null;
      coverImage?: string | null;
      startDate: string;
      endDate: string;
      totalBudget?: number;
      currency?: string;
      visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
      status?: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    }
  ) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      throw new ConflictError('Trip start date must not be after end date');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        coverImage: data.coverImage || null,
        startDate,
        endDate,
        totalBudget: data.totalBudget ?? 0,
        currency: data.currency || user?.currency || 'USD',
        visibility: data.visibility || 'PRIVATE',
        status: data.status || 'DRAFT',
      },
    });

    return trip;
  }

  /**
   * Update an existing trip
   */
  static async updateTrip(
    tripId: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      coverImage?: string | null;
      startDate?: string;
      endDate?: string;
      totalBudget?: number;
      currency?: string;
      visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
      status?: 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    }
  ) {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: true,
      },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found');
    }

    if (existingTrip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const newStart = data.startDate ? new Date(data.startDate) : existingTrip.startDate;
    const newEnd = data.endDate ? new Date(data.endDate) : existingTrip.endDate;

    if (newStart > newEnd) {
      throw new ConflictError('Trip start date must not be after end date');
    }

    // Check if modifying trip dates violates existing stops
    for (const stop of existingTrip.stops) {
      if (stop.arrivalDate < newStart || stop.departureDate > newEnd) {
        throw new ConflictError(
          `Cannot resize trip dates: Stop in city (${stop.cityId}) is scheduled from ${stop.arrivalDate.toISOString().slice(0, 10)} to ${stop.departureDate.toISOString().slice(0, 10)}, which falls outside the new trip range (${newStart.toISOString().slice(0, 10)} to ${newEnd.toISOString().slice(0, 10)}). Please adjust stops first.`
        );
      }
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.startDate !== undefined && { startDate: newStart }),
        ...(data.endDate !== undefined && { endDate: newEnd }),
        ...(data.totalBudget !== undefined && { totalBudget: data.totalBudget }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return updated;
  }

  /**
   * Delete a trip and all its stops, activities, expenses
   */
  static async deleteTrip(tripId: string, userId: string) {
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found');
    }

    if (existingTrip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return { message: 'Trip deleted successfully' };
  }
}

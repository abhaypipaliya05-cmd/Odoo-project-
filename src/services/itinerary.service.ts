import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors';
import { TripTimeline, TimelineDay } from '@/types';

export class ItineraryService {
  /**
   * Add a new stop/city to a trip
   */
  static async addStopToTrip(
    tripId: string,
    userId: string,
    data: {
      cityId: string;
      arrivalDate: string;
      departureDate: string;
      orderIndex?: number;
      accommodationName?: string | null;
      accommodationCost?: number;
      transportType?: string | null;
      transportCost?: number;
      notes?: string | null;
    }
  ) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: true },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const city = await prisma.city.findUnique({
      where: { id: data.cityId },
    });

    if (!city) {
      throw new NotFoundError('City not found');
    }

    const arrival = new Date(data.arrivalDate);
    const departure = new Date(data.departureDate);

    // Business Logic: Stop dates must be inside trip dates
    if (arrival < trip.startDate || departure > trip.endDate) {
      throw new ConflictError(
        `Stop dates (${arrival.toISOString().slice(0, 10)} to ${departure.toISOString().slice(0, 10)}) must be within the parent trip date range (${trip.startDate.toISOString().slice(0, 10)} to ${trip.endDate.toISOString().slice(0, 10)})`
      );
    }

    if (arrival > departure) {
      throw new ConflictError('Stop arrival date cannot be after departure date');
    }

    const orderIndex =
      data.orderIndex !== undefined ? data.orderIndex : trip.stops.length;

    const stop = await prisma.tripStop.create({
      data: {
        tripId,
        cityId: data.cityId,
        arrivalDate: arrival,
        departureDate: departure,
        orderIndex,
        accommodationName: data.accommodationName || null,
        accommodationCost: data.accommodationCost ?? 0,
        transportType: data.transportType || null,
        transportCost: data.transportCost ?? 0,
        notes: data.notes || null,
      },
      include: {
        city: true,
        activities: true,
      },
    });

    return stop;
  }

  /**
   * Update an existing stop
   */
  static async updateStop(
    tripId: string,
    stopId: string,
    userId: string,
    data: {
      arrivalDate?: string;
      departureDate?: string;
      orderIndex?: number;
      accommodationName?: string | null;
      accommodationCost?: number;
      transportType?: string | null;
      transportCost?: number;
      notes?: string | null;
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

    const existingStop = await prisma.tripStop.findFirst({
      where: { id: stopId, tripId },
      include: { activities: true },
    });

    if (!existingStop) {
      throw new NotFoundError('Trip stop not found');
    }

    const newArrival = data.arrivalDate ? new Date(data.arrivalDate) : existingStop.arrivalDate;
    const newDeparture = data.departureDate ? new Date(data.departureDate) : existingStop.departureDate;

    if (newArrival < trip.startDate || newDeparture > trip.endDate) {
      throw new ConflictError(
        `Stop dates must fall within parent trip dates (${trip.startDate.toISOString().slice(0, 10)} to ${trip.endDate.toISOString().slice(0, 10)})`
      );
    }

    if (newArrival > newDeparture) {
      throw new ConflictError('Stop arrival date cannot be after departure date');
    }

    // Check that existing scheduled activities remain valid
    for (const act of existingStop.activities) {
      if (act.scheduledDate < newArrival || act.scheduledDate > newDeparture) {
        throw new ConflictError(
          `Cannot update stop dates: Activity "${act.customTitle || 'Scheduled Activity'}" is set for ${act.scheduledDate.toISOString().slice(0, 10)}, which falls outside the new stop range (${newArrival.toISOString().slice(0, 10)} to ${newDeparture.toISOString().slice(0, 10)}). Please adjust activity dates first.`
        );
      }
    }

    const updated = await prisma.tripStop.update({
      where: { id: stopId },
      data: {
        ...(data.arrivalDate !== undefined && { arrivalDate: newArrival }),
        ...(data.departureDate !== undefined && { departureDate: newDeparture }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.accommodationName !== undefined && { accommodationName: data.accommodationName }),
        ...(data.accommodationCost !== undefined && { accommodationCost: data.accommodationCost }),
        ...(data.transportType !== undefined && { transportType: data.transportType }),
        ...(data.transportCost !== undefined && { transportCost: data.transportCost }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        city: true,
        activities: true,
      },
    });

    return updated;
  }

  /**
   * Delete a stop
   */
  static async deleteStop(tripId: string, stopId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const existingStop = await prisma.tripStop.findFirst({
      where: { id: stopId, tripId },
    });

    if (!existingStop) {
      throw new NotFoundError('Trip stop not found');
    }

    await prisma.tripStop.delete({
      where: { id: stopId },
    });

    return { message: 'Trip stop deleted successfully' };
  }

  /**
   * Reorder stops in a trip
   */
  static async reorderStops(tripId: string, userId: string, stopIds: string[]) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { stops: true },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const currentStopIds = new Set(trip.stops.map((s) => s.id));
    for (const id of stopIds) {
      if (!currentStopIds.has(id)) {
        throw new NotFoundError(`Stop ID ${id} does not belong to this trip`);
      }
    }

    await prisma.$transaction(
      stopIds.map((id, index) =>
        prisma.tripStop.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    const updatedStops = await prisma.tripStop.findMany({
      where: { tripId },
      orderBy: { orderIndex: 'asc' },
      include: { city: true, activities: true },
    });

    return updatedStops;
  }

  /**
   * Add activity to a stop
   */
  static async addActivityToStop(
    tripId: string,
    stopId: string,
    userId: string,
    data: {
      activityId?: string | null;
      customTitle?: string | null;
      customDescription?: string | null;
      category?: string;
      scheduledDate: string;
      startTime?: string | null;
      durationMinutes?: number;
      actualCost?: number;
      status?: string;
      notes?: string | null;
      orderIndex?: number;
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

    const stop = await prisma.tripStop.findFirst({
      where: { id: stopId, tripId },
      include: { activities: true },
    });

    if (!stop) {
      throw new NotFoundError('Trip stop not found');
    }

    const scheduled = new Date(data.scheduledDate);
    if (scheduled < stop.arrivalDate || scheduled > stop.departureDate) {
      throw new ConflictError(
        `Activity scheduled date (${scheduled.toISOString().slice(0, 10)}) must fall within the stop dates (${stop.arrivalDate.toISOString().slice(0, 10)} to ${stop.departureDate.toISOString().slice(0, 10)})`
      );
    }

    let defaultCost = data.actualCost ?? 0;
    let defaultCategory = data.category || 'SIGHTSEEING';
    let defaultTitle = data.customTitle || null;

    if (data.activityId) {
      const dbActivity = await prisma.activity.findUnique({
        where: { id: data.activityId },
      });
      if (dbActivity) {
        if (!defaultCost && dbActivity.estimatedCost) {
          defaultCost = dbActivity.estimatedCost;
        }
        if (!data.category) {
          defaultCategory = dbActivity.category;
        }
        if (!defaultTitle) {
          defaultTitle = dbActivity.title;
        }
      }
    }

    const orderIndex = data.orderIndex !== undefined ? data.orderIndex : stop.activities.length;

    const activity = await prisma.tripActivity.create({
      data: {
        tripStopId: stopId,
        activityId: data.activityId || null,
        customTitle: defaultTitle,
        customDescription: data.customDescription || null,
        category: defaultCategory,
        scheduledDate: scheduled,
        startTime: data.startTime || null,
        durationMinutes: data.durationMinutes ?? 60,
        actualCost: defaultCost,
        status: data.status || 'PLANNED',
        notes: data.notes || null,
        orderIndex,
      },
      include: {
        activity: true,
      },
    });

    return activity;
  }

  /**
   * Update scheduled activity
   */
  static async updateActivity(
    tripId: string,
    activityId: string,
    userId: string,
    data: {
      customTitle?: string | null;
      customDescription?: string | null;
      category?: string;
      scheduledDate?: string;
      startTime?: string | null;
      durationMinutes?: number;
      actualCost?: number;
      status?: string;
      notes?: string | null;
      orderIndex?: number;
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

    const activity = await prisma.tripActivity.findUnique({
      where: { id: activityId },
      include: { tripStop: true },
    });

    if (!activity || activity.tripStop.tripId !== tripId) {
      throw new NotFoundError('Scheduled activity not found in this trip');
    }

    if (data.scheduledDate) {
      const scheduled = new Date(data.scheduledDate);
      if (scheduled < activity.tripStop.arrivalDate || scheduled > activity.tripStop.departureDate) {
        throw new ConflictError(
          `Activity scheduled date must fall within the stop dates (${activity.tripStop.arrivalDate.toISOString().slice(0, 10)} to ${activity.tripStop.departureDate.toISOString().slice(0, 10)})`
        );
      }
    }

    const updated = await prisma.tripActivity.update({
      where: { id: activityId },
      data: {
        ...(data.customTitle !== undefined && { customTitle: data.customTitle }),
        ...(data.customDescription !== undefined && { customDescription: data.customDescription }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.scheduledDate !== undefined && { scheduledDate: new Date(data.scheduledDate) }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
      },
      include: {
        activity: true,
      },
    });

    return updated;
  }

  /**
   * Delete scheduled activity
   */
  static async deleteActivity(tripId: string, activityId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    const activity = await prisma.tripActivity.findUnique({
      where: { id: activityId },
      include: { tripStop: true },
    });

    if (!activity || activity.tripStop.tripId !== tripId) {
      throw new NotFoundError('Scheduled activity not found in this trip');
    }

    await prisma.tripActivity.delete({
      where: { id: activityId },
    });

    return { message: 'Activity deleted successfully' };
  }

  /**
   * Reorder activities
   */
  static async reorderActivities(tripId: string, userId: string, activityIds: string[]) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenError('You do not own this trip');
    }

    await prisma.$transaction(
      activityIds.map((id, index) =>
        prisma.tripActivity.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    return { message: 'Activities reordered successfully' };
  }

  /**
   * Get structured daily timeline for calendar/timeline view
   */
  static async getTimeline(tripId: string, userId?: string): Promise<TripTimeline> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: [{ scheduledDate: 'asc' }, { orderIndex: 'asc' }],
              include: { activity: true },
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
      throw new ForbiddenError('You do not have permission to view this trip timeline');
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const days: TimelineDay[] = [];

    const currentDate = new Date(startDate);
    let dayIndex = 1;
    let totalCost = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10);

      // Find the active stop for this day
      const activeStop = trip.stops.find((s) => {
        const sArr = new Date(s.arrivalDate).toISOString().slice(0, 10);
        const sDep = new Date(s.departureDate).toISOString().slice(0, 10);
        return dateStr >= sArr && dateStr <= sDep;
      });

      // Find activities scheduled on this day
      const dayActivities = activeStop
        ? activeStop.activities
            .filter((a) => new Date(a.scheduledDate).toISOString().slice(0, 10) === dateStr)
            .map((a) => {
              const cost = a.actualCost || a.activity?.estimatedCost || 0;
              return {
                id: a.id,
                title: a.customTitle || a.activity?.title || 'Activity',
                category: a.category,
                startTime: a.startTime,
                durationMinutes: a.durationMinutes,
                cost,
                status: a.status,
                orderIndex: a.orderIndex,
              };
            })
        : [];

      const actTotal = dayActivities.reduce((sum, a) => sum + a.cost, 0);

      // Is it arrival day for transport?
      const isArrivalDay =
        activeStop && new Date(activeStop.arrivalDate).toISOString().slice(0, 10) === dateStr;
      const transportCost = isArrivalDay ? activeStop.transportCost : 0;

      // Accommodation daily share
      let accDailyCost = 0;
      if (activeStop && activeStop.accommodationCost > 0) {
        const stopDays = Math.max(
          1,
          Math.ceil(
            (new Date(activeStop.departureDate).getTime() - new Date(activeStop.arrivalDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        );
        accDailyCost = parseFloat((activeStop.accommodationCost / stopDays).toFixed(2));
      }

      const dayTotalCost = actTotal + transportCost + accDailyCost;
      totalCost += dayTotalCost;

      days.push({
        dayIndex,
        date: dateStr,
        city: activeStop
          ? {
              id: activeStop.city.id,
              name: activeStop.city.name,
              country: activeStop.city.country,
              imageUrl: activeStop.city.imageUrl,
            }
          : null,
        stopId: activeStop?.id || null,
        accommodation: activeStop?.accommodationName
          ? {
              name: activeStop.accommodationName,
              cost: accDailyCost,
            }
          : null,
        transport: isArrivalDay && activeStop.transportType
          ? {
              type: activeStop.transportType,
              cost: activeStop.transportCost,
            }
          : null,
        activities: dayActivities,
        dayTotalCost: parseFloat(dayTotalCost.toFixed(2)),
      });

      // Advance one day
      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    return {
      tripId: trip.id,
      tripTitle: trip.title,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      durationDays: days.length,
      totalCost: parseFloat(totalCost.toFixed(2)),
      days,
    };
  }
}

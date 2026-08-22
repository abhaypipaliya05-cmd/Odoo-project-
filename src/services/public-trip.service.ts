import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import { PublicTripDetail, TripDetail } from '@/types';
import { TripService } from './trip.service';

export class PublicTripService {
  /**
   * Toggle public sharing visibility and generate secure share slug
   */
  static async setTripSharing(
    tripId: string,
    userId: string,
    visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
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

    let shareSlug = trip.shareSlug;

    if (visibility === 'PUBLIC' || visibility === 'UNLISTED') {
      if (!shareSlug) {
        // Generate secure 10-char random slug
        const randomPart = crypto.randomBytes(5).toString('hex');
        shareSlug = `trip-${randomPart}`;
      }
    } else {
      // If private, we can revoke access by setting visibility to PRIVATE
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        visibility,
        shareSlug,
      },
    });

    return {
      visibility: updated.visibility,
      shareSlug: updated.shareSlug,
      shareUrl: updated.shareSlug ? `/api/trips/share/${updated.shareSlug}` : null,
    };
  }

  /**
   * Get public sanitized trip itinerary by public share slug
   */
  static async getPublicTripBySlug(slug: string): Promise<PublicTripDetail> {
    const trip = await prisma.trip.findFirst({
      where: {
        shareSlug: slug,
        visibility: { in: ['PUBLIC', 'UNLISTED'] },
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: {
              select: {
                name: true,
                country: true,
                imageUrl: true,
                description: true,
              },
            },
            activities: {
              orderBy: [{ scheduledDate: 'asc' }, { orderIndex: 'asc' }],
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
      throw new NotFoundError('Public trip not found or is no longer shared');
    }

    // Calculate duration
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Calculate total cost
    const stopsTransport = trip.stops.reduce((sum, s) => sum + (s.transportCost || 0), 0);
    const stopsStay = trip.stops.reduce((sum, s) => sum + (s.accommodationCost || 0), 0);
    const actsCost = trip.stops.reduce(
      (sum, s) =>
        sum +
        s.activities.reduce(
          (aSum, a) => aSum + (a.actualCost || a.activity?.estimatedCost || 0),
          0
        ),
      0
    );
    const expensesCost = trip.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalEstimatedCost = stopsTransport + stopsStay + actsCost + expensesCost;

    return {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      shareSlug: trip.shareSlug!,
      creator: {
        name: trip.user.name,
        avatarUrl: trip.user.avatarUrl,
      },
      durationDays,
      totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
      stops: trip.stops.map((stop) => ({
        id: stop.id,
        city: stop.city,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        orderIndex: stop.orderIndex,
        transportType: stop.transportType,
        accommodationName: stop.accommodationName,
        activities: stop.activities.map((act) => ({
          id: act.id,
          title: act.customTitle || act.activity?.title || 'Activity',
          category: act.category,
          scheduledDate: act.scheduledDate,
          startTime: act.startTime,
          durationMinutes: act.durationMinutes,
          estimatedCost: act.actualCost || act.activity?.estimatedCost || 0,
        })),
      })),
    };
  }

  /**
   * Clone/Copy an existing trip into another user's account
   */
  static async cloneTrip(tripId: string, targetUserId: string): Promise<TripDetail> {
    const sourceTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            activities: true,
          },
        },
        expenses: true,
      },
    });

    if (!sourceTrip) {
      throw new NotFoundError('Source trip not found');
    }

    // Permission check: User can clone their own trips, or any public/unlisted trip
    if (
      sourceTrip.userId !== targetUserId &&
      sourceTrip.visibility === 'PRIVATE'
    ) {
      throw new ForbiddenError('Cannot copy a private trip that does not belong to you');
    }

    // Atomic creation inside transaction
    const clonedTrip = await prisma.$transaction(async (tx) => {
      // 1. Create Cloned Trip
      const newTrip = await tx.trip.create({
        data: {
          userId: targetUserId,
          title: `Copy of ${sourceTrip.title}`,
          description: sourceTrip.description,
          coverImage: sourceTrip.coverImage,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          totalBudget: sourceTrip.totalBudget,
          currency: sourceTrip.currency,
          status: 'DRAFT',
          visibility: 'PRIVATE',
          shareSlug: null, // Reset share slug
        },
      });

      // 2. Clone Stops and Activities
      for (const stop of sourceTrip.stops) {
        const newStop = await tx.tripStop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            orderIndex: stop.orderIndex,
            accommodationName: stop.accommodationName,
            accommodationCost: stop.accommodationCost,
            transportType: stop.transportType,
            transportCost: stop.transportCost,
            notes: stop.notes,
          },
        });

        for (const act of stop.activities) {
          await tx.tripActivity.create({
            data: {
              tripStopId: newStop.id,
              activityId: act.activityId,
              customTitle: act.customTitle,
              customDescription: act.customDescription,
              category: act.category,
              scheduledDate: act.scheduledDate,
              startTime: act.startTime,
              durationMinutes: act.durationMinutes,
              actualCost: act.actualCost,
              status: 'PLANNED',
              notes: act.notes,
              orderIndex: act.orderIndex,
            },
          });
        }
      }

      // 3. Clone Expenses
      for (const exp of sourceTrip.expenses) {
        await tx.expense.create({
          data: {
            tripId: newTrip.id,
            category: exp.category,
            title: exp.title,
            amount: exp.amount,
            currency: exp.currency,
            date: exp.date,
            notes: exp.notes,
          },
        });
      }

      return newTrip;
    });

    return TripService.getTripById(clonedTrip.id, targetUserId);
  }
}

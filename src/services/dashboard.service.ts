import { prisma } from '@/lib/prisma';
import { TripService } from './trip.service';
import { CityService } from './city.service';
import { DashboardStats } from '@/types';

export class DashboardService {
  /**
   * Aggregate central dashboard statistics for user
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date();

    const [allTrips, savedDestinations, recommendedCities] = await Promise.all([
      TripService.getUserTrips(userId),
      CityService.getSavedDestinations(userId),
      CityService.getCities({ limit: 6 }, userId),
    ]);

    const upcomingTrips = allTrips.filter((t) => new Date(t.endDate) >= now);
    const completedTrips = allTrips.filter(
      (t) => new Date(t.endDate) < now || t.status === 'COMPLETED'
    );

    const totalBudgetPlanned = allTrips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);

    return {
      totalTripsCount: allTrips.length,
      upcomingTripsCount: upcomingTrips.length,
      completedTripsCount: completedTrips.length,
      savedDestinationsCount: savedDestinations.length,
      totalBudgetPlanned: parseFloat(totalBudgetPlanned.toFixed(2)),
      upcomingTrips: upcomingTrips.slice(0, 5),
      recentTrips: allTrips.slice(0, 5),
      savedDestinations: savedDestinations.slice(0, 6),
      recommendedCities,
    };
  }
}

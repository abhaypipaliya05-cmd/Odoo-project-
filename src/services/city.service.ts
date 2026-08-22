import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { CitySummary, CityWithActivities, ActivitySummary } from '@/types';

export class CityService {
  /**
   * Search and filter cities
   */
  static async getCities(
    params: {
      q?: string;
      country?: string;
      region?: string;
      costIndex?: string;
      limit?: number;
    },
    userId?: string
  ): Promise<CitySummary[]> {
    const where: any = {};

    if (params.q) {
      where.OR = [
        { name: { contains: params.q } },
        { country: { contains: params.q } },
        { description: { contains: params.q } },
      ];
    }
    if (params.country) {
      where.country = { contains: params.country };
    }
    if (params.region) {
      where.region = { contains: params.region };
    }
    if (params.costIndex) {
      where.costIndex = params.costIndex;
    }

    const cities = await prisma.city.findMany({
      where,
      take: params.limit || 30,
      orderBy: { popularityScore: 'desc' },
      include: {
        savedByUsers: userId ? { where: { userId } } : false,
      },
    });

    return cities.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      description: c.description,
      imageUrl: c.imageUrl,
      costIndex: c.costIndex,
      averageDailyCost: c.averageDailyCost,
      popularityScore: c.popularityScore,
      latitude: c.latitude,
      longitude: c.longitude,
      isSaved: userId && (c as any).savedByUsers ? (c as any).savedByUsers.length > 0 : false,
    }));
  }

  /**
   * Get city details with its top activities
   */
  static async getCityById(cityId: string, userId?: string): Promise<CityWithActivities> {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        activities: {
          orderBy: { rating: 'desc' },
        },
        savedByUsers: userId ? { where: { userId } } : false,
      },
    });

    if (!city) {
      throw new NotFoundError('City not found');
    }

    const isSaved = userId && city.savedByUsers ? city.savedByUsers.length > 0 : false;

    return {
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      description: city.description,
      imageUrl: city.imageUrl,
      costIndex: city.costIndex,
      averageDailyCost: city.averageDailyCost,
      popularityScore: city.popularityScore,
      latitude: city.latitude,
      longitude: city.longitude,
      isSaved,
      activities: city.activities.map((a) => ({
        id: a.id,
        cityId: a.cityId,
        title: a.title,
        description: a.description,
        category: a.category,
        estimatedCost: a.estimatedCost,
        durationMinutes: a.durationMinutes,
        imageUrl: a.imageUrl,
        rating: a.rating,
        address: a.address,
        latitude: a.latitude,
        longitude: a.longitude,
        cityName: city.name,
        countryName: city.country,
      })),
    };
  }

  /**
   * Search and filter activities across cities
   */
  static async getActivities(params: {
    cityId?: string;
    category?: string;
    maxCost?: number;
    q?: string;
    limit?: number;
  }): Promise<ActivitySummary[]> {
    const where: any = {};

    if (params.cityId) {
      where.cityId = params.cityId;
    }
    if (params.category) {
      where.category = params.category;
    }
    if (params.maxCost !== undefined) {
      where.estimatedCost = { lte: params.maxCost };
    }
    if (params.q) {
      where.OR = [
        { title: { contains: params.q } },
        { description: { contains: params.q } },
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      take: params.limit || 50,
      orderBy: { rating: 'desc' },
      include: {
        city: {
          select: { name: true, country: true },
        },
      },
    });

    return activities.map((a) => ({
      id: a.id,
      cityId: a.cityId,
      title: a.title,
      description: a.description,
      category: a.category,
      estimatedCost: a.estimatedCost,
      durationMinutes: a.durationMinutes,
      imageUrl: a.imageUrl,
      rating: a.rating,
      address: a.address,
      latitude: a.latitude,
      longitude: a.longitude,
      cityName: a.city.name,
      countryName: a.city.country,
    }));
  }

  /**
   * Bookmark / save a destination
   */
  static async saveDestination(userId: string, cityId: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new NotFoundError('City not found');
    }

    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    if (existing) {
      return { message: 'City is already saved to your destinations', saved: true };
    }

    await prisma.savedDestination.create({
      data: {
        userId,
        cityId,
      },
    });

    return { message: 'City saved successfully', saved: true };
  }

  /**
   * Remove saved destination
   */
  static async removeSavedDestination(userId: string, cityId: string) {
    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    if (!existing) {
      return { message: 'City was not in your saved destinations', saved: false };
    }

    await prisma.savedDestination.delete({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    return { message: 'City removed from saved destinations', saved: false };
  }

  /**
   * Get user's saved destinations
   */
  static async getSavedDestinations(userId: string): Promise<CitySummary[]> {
    const saved = await prisma.savedDestination.findMany({
      where: { userId },
      include: {
        city: true,
      },
      orderBy: { savedAt: 'desc' },
    });

    return saved.map((s) => ({
      id: s.city.id,
      name: s.city.name,
      country: s.city.country,
      region: s.city.region,
      description: s.city.description,
      imageUrl: s.city.imageUrl,
      costIndex: s.city.costIndex,
      averageDailyCost: s.city.averageDailyCost,
      popularityScore: s.city.popularityScore,
      latitude: s.city.latitude,
      longitude: s.city.longitude,
      isSaved: true,
    }));
  }
}

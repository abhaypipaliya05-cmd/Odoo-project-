import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const aiRecommendationOutputSchema = z.object({
  recommendedCities: z.array(
    z.object({
      cityName: z.string(),
      country: z.string(),
      reason: z.string(),
      suggestedDurationDays: z.number(),
      estimatedDailyBudget: z.number(),
      highlightActivities: z.array(z.string()),
    })
  ),
  customTip: z.string(),
});

export type AiRecommendationOutput = z.infer<typeof aiRecommendationOutputSchema>;

export class AiService {
  /**
   * Generate personalized travel recommendations based on user history, saved destinations, and budget
   */
  static async getPersonalizedRecommendations(
    userId?: string,
    query?: {
      targetBudget?: number;
      preferredCategory?: string;
      preferredRegion?: string;
      vibe?: string;
    }
  ): Promise<AiRecommendationOutput> {
    // 1. Gather context from database
    const savedCities = userId
      ? await prisma.savedDestination.findMany({
          where: { userId },
          include: { city: true },
        })
      : [];

    const userTrips = userId
      ? await prisma.trip.findMany({
          where: { userId },
          include: { stops: { include: { city: true } } },
        })
      : [];

    const availableCities = await prisma.city.findMany({
      take: 10,
      orderBy: { popularityScore: 'desc' },
      include: { activities: { take: 3 } },
    });

    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';
    const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';

    // 2. If LLM is configured, attempt call
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const prompt = `You are GlobeTrotter AI. Generate personalized travel destination recommendations in valid JSON matching schema:
Available database cities: ${JSON.stringify(availableCities.map((c) => ({ name: c.name, country: c.country, costIndex: c.costIndex, activities: c.activities.map((a) => a.title) })))}
User's saved cities: ${savedCities.map((s) => s.city.name).join(', ') || 'None'}
User preferences: Budget: ${query?.targetBudget || 'Flexible'}, Category: ${query?.preferredCategory || 'General'}, Region: ${query?.preferredRegion || 'Any'}, Vibe: ${query?.vibe || 'Adventurous'}

Output only valid JSON with fields "recommendedCities" (array of { cityName, country, reason, suggestedDurationDays, estimatedDailyBudget, highlightActivities }) and "customTip".`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const content = json.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const validated = aiRecommendationOutputSchema.parse(parsed);
            return validated;
          }
        }
      } catch (err) {
        console.warn('[AI_SERVICE_FALLBACK]: LLM call failed or timed out. Falling back to deterministic recommendation engine.', err);
      }
    }

    // 3. Deterministic Intelligent Fallback Engine (explainable recommendations)
    const selected = availableCities.slice(0, 4);
    const recommendedCities = selected.map((city) => {
      const isSaved = savedCities.some((s) => s.cityId === city.id);
      const isVisited = userTrips.some((t) => t.stops.some((s) => s.cityId === city.id));

      let reason = `Popular destination with rich culture and a ${city.costIndex.toLowerCase()} cost profile.`;
      if (isSaved) {
        reason = `Matches your saved destination wishlist in ${city.country}.`;
      } else if (isVisited) {
        reason = `Great for a return visit or extension trip based on your previous journey.`;
      } else if (query?.targetBudget && query.targetBudget < 1000 && city.costIndex === 'BUDGET') {
        reason = `Perfect match for budget-conscious itineraries without compromising on world-class sights.`;
      }

      return {
        cityName: city.name,
        country: city.country,
        reason,
        suggestedDurationDays: city.costIndex === 'LUXURY' ? 4 : 5,
        estimatedDailyBudget: city.averageDailyCost,
        highlightActivities: city.activities.map((a) => a.title),
      };
    });

    return {
      recommendedCities,
      customTip:
        'GlobeTrotter Tip: Adding morning sightseeing and evening culinary tours optimizes your daily flow and keeps transportation costs lower!',
    };
  }
}

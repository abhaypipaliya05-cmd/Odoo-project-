export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  homeCity?: string;
  currency: string;
  language: string;
  role?: string;
  createdAt?: string;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  description: string;
  category: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'nightlife' | 'relaxation';
  estimatedCost: number;
  durationMinutes: number;
  rating: number;
  imageUrl: string;
  locationName: string;
}

export interface ItineraryItem {
  id: string;
  stopId: string;
  activityId?: string;
  customTitle: string;
  customCost: number;
  category: string;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  cityName: string;
  country: string;
  stopOrder: number;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  transportCost: number;
  accommodationCost: number;
  activities?: ItineraryItem[];
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  visibility: 'private' | 'public';
  shareToken?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  destinationCount?: number;
  destinations?: string[];
  stops?: TripStop[];
  estimatedCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  flagEmoji: string;
  coverImage: string;
  costIndex: number; // 1 to 4 ($ to $$$$)
  popularityScore: number;
  bestSeason: string;
  avgDailyCost: number;
  currency: string;
  description: string;
  highlights?: string[];
  isSaved?: boolean;
}

export interface DashboardStats {
  totalTrips: number;
  upcomingTrips: number;
  savedDestinationsCount: number;
  totalBudget: number;
  currency: string;
  recentTrips: Trip[];
  recommendedDestinations: Destination[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

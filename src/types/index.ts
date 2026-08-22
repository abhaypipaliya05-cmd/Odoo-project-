// GlobeTrotter - Shared TypeScript Types
// Single Source of Truth for Backend & Frontend

export type UserRole = 'USER' | 'ADMIN';

export type TripStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TripVisibility = 'PRIVATE' | 'PUBLIC' | 'UNLISTED';

export type CostIndex = 'BUDGET' | 'MODERATE' | 'LUXURY';

export type ActivityCategory =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'RELAXATION'
  | 'SHOPPING'
  | 'NIGHTLIFE';

export type ActivityStatus = 'PLANNED' | 'COMPLETED' | 'SKIPPED';

export type ExpenseCategory =
  | 'TRANSPORT'
  | 'STAY'
  | 'ACTIVITIES'
  | 'MEALS'
  | 'MISCELLANEOUS';

// User Models
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  homeCity: string | null;
  currency: string;
  language: string;
  role: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  currency: string;
  language: string;
}

// Destination & City Models
export interface CitySummary {
  id: string;
  name: string;
  country: string;
  region: string | null;
  description: string;
  imageUrl: string;
  costIndex: string;
  averageDailyCost: number;
  popularityScore: number;
  latitude: number | null;
  longitude: number | null;
}

export interface CityWithActivities extends CitySummary {
  activities: ActivitySummary[];
  isSaved?: boolean;
}

// Activity Models
export interface ActivitySummary {
  id: string;
  cityId: string;
  title: string;
  description: string;
  category: string;
  estimatedCost: number;
  durationMinutes: number;
  imageUrl: string | null;
  rating: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cityName?: string;
  countryName?: string;
}

// Trip Activity Models
export interface TripActivityDetail {
  id: string;
  tripStopId: string;
  activityId: string | null;
  customTitle: string | null;
  customDescription: string | null;
  category: string;
  scheduledDate: string | Date;
  startTime: string | null;
  durationMinutes: number;
  actualCost: number;
  status: string;
  notes: string | null;
  orderIndex: number;
  activity?: ActivitySummary | null;
}

// Trip Stop Models
export interface TripStopDetail {
  id: string;
  tripId: string;
  cityId: string;
  arrivalDate: string | Date;
  departureDate: string | Date;
  orderIndex: number;
  accommodationName: string | null;
  accommodationCost: number;
  transportType: string | null;
  transportCost: number;
  notes: string | null;
  city: CitySummary;
  activities: TripActivityDetail[];
  expenses?: ExpenseDetail[];
}

// Expense Models
export interface ExpenseDetail {
  id: string;
  tripId: string;
  tripStopId: string | null;
  category: string;
  title: string;
  amount: number;
  currency: string;
  date: string | Date;
  notes: string | null;
}

// Trip Models
export interface TripSummary {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | Date;
  endDate: string | Date;
  totalBudget: number;
  currency: string;
  status: string;
  visibility: string;
  shareSlug: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  destinationsCount?: number;
  cities?: string[];
  totalEstimatedCost?: number;
}

export interface TripDetail extends TripSummary {
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  stops: TripStopDetail[];
  expenses: ExpenseDetail[];
  budgetSummary?: BudgetBreakdown;
}

// Budget Breakdown Models
export interface CategoryExpenseTotal {
  category: ExpenseCategory;
  total: number;
  percentage: number;
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: string;
  totalEstimatedCost: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  durationDays: number;
  averageDailyCost: number;
  categories: {
    transport: number;
    stay: number;
    activities: number;
    meals: number;
    miscellaneous: number;
  };
  categoryBreakdown: CategoryExpenseTotal[];
  expenses: ExpenseDetail[];
}

// Timeline & Calendar Models
export interface TimelineActivityItem {
  id: string;
  title: string;
  category: string;
  startTime: string | null;
  durationMinutes: number;
  cost: number;
  status: string;
  orderIndex: number;
}

export interface TimelineDay {
  dayIndex: number;
  date: string;
  city: {
    id: string;
    name: string;
    country: string;
    imageUrl: string;
  } | null;
  stopId: string | null;
  accommodation: {
    name: string | null;
    cost: number;
  } | null;
  transport: {
    type: string | null;
    cost: number;
  } | null;
  activities: TimelineActivityItem[];
  dayTotalCost: number;
}

export interface TripTimeline {
  tripId: string;
  tripTitle: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalCost: number;
  days: TimelineDay[];
}

// Dashboard Statistics Models
export interface DashboardStats {
  totalTripsCount: number;
  upcomingTripsCount: number;
  completedTripsCount: number;
  savedDestinationsCount: number;
  totalBudgetPlanned: number;
  upcomingTrips: TripSummary[];
  recentTrips: TripSummary[];
  savedDestinations: CitySummary[];
  recommendedCities: CitySummary[];
}

// Public Trip View Models
export interface PublicTripDetail {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  startDate: string | Date;
  endDate: string | Date;
  totalBudget: number;
  currency: string;
  shareSlug: string;
  creator: {
    name: string;
    avatarUrl: string | null;
  };
  stops: {
    id: string;
    city: {
      name: string;
      country: string;
      imageUrl: string;
      description: string;
    };
    arrivalDate: string | Date;
    departureDate: string | Date;
    orderIndex: number;
    transportType: string | null;
    accommodationName: string | null;
    activities: {
      id: string;
      title: string;
      category: string;
      scheduledDate: string | Date;
      startTime: string | null;
      durationMinutes: number;
      estimatedCost: number;
    }[];
  }[];
  durationDays: number;
  totalEstimatedCost: number;
}

// API Response Models
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

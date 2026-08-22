import { z } from 'zod';

// Auth Validation Schemas
export const signupSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').nullable().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').nullable().optional(),
  homeCity: z.string().max(100).nullable().optional(),
  currency: z.string().length(3, 'Currency must be 3-letter code (e.g. USD, EUR, INR)').toUpperCase().optional(),
  language: z.string().min(2).max(10).optional(),
});

// Trip Validation Schemas
export const createTripSchema = z
  .object({
    title: z.string().trim().min(2, 'Trip title must be at least 2 characters long').max(100),
    description: z.string().max(1000).optional().nullable(),
    coverImage: z.string().url('Invalid cover image URL').optional().nullable(),
    startDate: z.string().datetime({ message: 'Invalid start date format (ISO 8601 expected)' }),
    endDate: z.string().datetime({ message: 'Invalid end date format (ISO 8601 expected)' }),
    totalBudget: z.number().nonnegative('Total budget cannot be negative').optional().default(0),
    currency: z.string().length(3).toUpperCase().optional().default('USD'),
    visibility: z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED']).optional().default('PRIVATE'),
    status: z.enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('DRAFT'),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'startDate must be on or before endDate',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    coverImage: z.string().url().optional().nullable(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    totalBudget: z.number().nonnegative().optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    visibility: z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED']).optional(),
    status: z.enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'startDate must be on or before endDate',
      path: ['endDate'],
    }
  );

// Trip Stop Validation Schemas
export const createTripStopSchema = z
  .object({
    cityId: z.string().min(1, 'City ID is required'),
    arrivalDate: z.string().datetime({ message: 'Invalid arrival date format' }),
    departureDate: z.string().datetime({ message: 'Invalid departure date format' }),
    orderIndex: z.number().int().nonnegative().optional().default(0),
    accommodationName: z.string().max(150).optional().nullable(),
    accommodationCost: z.number().nonnegative().optional().default(0),
    transportType: z.string().max(50).optional().nullable(),
    transportCost: z.number().nonnegative().optional().default(0),
    notes: z.string().max(500).optional().nullable(),
  })
  .refine((data) => new Date(data.arrivalDate) <= new Date(data.departureDate), {
    message: 'arrivalDate must be on or before departureDate',
    path: ['departureDate'],
  });

export const updateTripStopSchema = z
  .object({
    arrivalDate: z.string().datetime().optional(),
    departureDate: z.string().datetime().optional(),
    orderIndex: z.number().int().nonnegative().optional(),
    accommodationName: z.string().max(150).optional().nullable(),
    accommodationCost: z.number().nonnegative().optional(),
    transportType: z.string().max(50).optional().nullable(),
    transportCost: z.number().nonnegative().optional(),
    notes: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.arrivalDate && data.departureDate) {
        return new Date(data.arrivalDate) <= new Date(data.departureDate);
      }
      return true;
    },
    {
      message: 'arrivalDate must be on or before departureDate',
      path: ['departureDate'],
    }
  );

export const reorderStopsSchema = z.object({
  stopIds: z.array(z.string().min(1)).min(1, 'At least one stop ID required'),
});

// Trip Activity Validation Schemas
export const createTripActivitySchema = z.object({
  activityId: z.string().optional().nullable(),
  customTitle: z.string().max(150).optional().nullable(),
  customDescription: z.string().max(500).optional().nullable(),
  category: z
    .enum(['SIGHTSEEING', 'FOOD', 'ADVENTURE', 'CULTURE', 'RELAXATION', 'SHOPPING', 'NIGHTLIFE'])
    .optional()
    .default('SIGHTSEEING'),
  scheduledDate: z.string().datetime({ message: 'Invalid scheduled date format' }),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm expected)')
    .optional()
    .nullable(),
  durationMinutes: z.number().int().positive().optional().default(60),
  actualCost: z.number().nonnegative().optional().default(0),
  status: z.enum(['PLANNED', 'COMPLETED', 'SKIPPED']).optional().default('PLANNED'),
  notes: z.string().max(500).optional().nullable(),
  orderIndex: z.number().int().nonnegative().optional().default(0),
});

export const updateTripActivitySchema = z.object({
  customTitle: z.string().max(150).optional().nullable(),
  customDescription: z.string().max(500).optional().nullable(),
  category: z
    .enum(['SIGHTSEEING', 'FOOD', 'ADVENTURE', 'CULTURE', 'RELAXATION', 'SHOPPING', 'NIGHTLIFE'])
    .optional(),
  scheduledDate: z.string().datetime().optional(),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm expected)')
    .optional()
    .nullable(),
  durationMinutes: z.number().int().positive().optional(),
  actualCost: z.number().nonnegative().optional(),
  status: z.enum(['PLANNED', 'COMPLETED', 'SKIPPED']).optional(),
  notes: z.string().max(500).optional().nullable(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const reorderActivitiesSchema = z.object({
  activityIds: z.array(z.string().min(1)).min(1, 'At least one activity ID required'),
});

// Expense Validation Schemas
export const createExpenseSchema = z.object({
  category: z.enum(['TRANSPORT', 'STAY', 'ACTIVITIES', 'MEALS', 'MISCELLANEOUS']),
  title: z.string().trim().min(2).max(150),
  amount: z.number().positive('Expense amount must be positive'),
  currency: z.string().length(3).toUpperCase().optional().default('USD'),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional().nullable(),
  tripStopId: z.string().optional().nullable(),
});

// Sharing Validation Schema
export const shareTripSchema = z.object({
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']),
});

// City & Activity Discovery Query Schemas
export const citiesQuerySchema = z.object({
  q: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  costIndex: z.enum(['BUDGET', 'MODERATE', 'LUXURY']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(30),
});

export const activitiesQuerySchema = z.object({
  cityId: z.string().optional(),
  category: z
    .enum(['SIGHTSEEING', 'FOOD', 'ADVENTURE', 'CULTURE', 'RELAXATION', 'SHOPPING', 'NIGHTLIFE'])
    .optional(),
  maxCost: z.coerce.number().nonnegative().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

// Saved Destination Schema
export const saveDestinationSchema = z.object({
  cityId: z.string().min(1, 'City ID is required'),
});

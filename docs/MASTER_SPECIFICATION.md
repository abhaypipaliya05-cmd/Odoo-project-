# GlobeTrotter – Master Specification
## Empowering Personalized Travel Planning

---

## 1. Executive Overview & System Architecture

GlobeTrotter is a full-stack personalized travel planning platform designed to simplify complex multi-city itinerary building, activity management, automated budget calculation, timeline visualization, and public travel plan sharing.

### Tech Stack & Core Architecture
- **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons
- **Database & ORM**: PostgreSQL (Supabase-ready), Prisma ORM
- **Authentication**: JWT / Secure Session-based Auth & Supabase Auth compatible token handling
- **API Paradigm**: Next.js Route Handlers (`/api/*`) with strict validation (Zod), standard HTTP status codes, structured JSON responses, and centralized error handling.
- **State & Shared Types**: TypeScript strict mode interfaces shared between backend and frontend.

---

## 2. Team Boundaries & Responsibilities

| Member | Role | Core Responsibilities |
|---|---|---|
| **Yaksh** | **Tech Lead & Backend Architect** | Project foundation, Prisma schema, PostgreSQL/Supabase DB, Auth backend, RBAC/Authorization, Core APIs, Business logic (Itinerary, Budget, Calendar, Sharing), Shared Types, Validation, DB Seeding. |
| **Dhanvi** | **Frontend Lead & Git Owner** | Repository management, Dashboard UI, My Trips UI, Profile UI, Final integration. |
| **Deep** | **Frontend Developer (Discovery)** | City discovery UI, Activity discovery UI, Search & filtering interfaces. |
| **Dhruv** | **Frontend Developer (Itinerary & Budget)** | Itinerary Builder UI, Calendar & Timeline UI, Budget Visualization UI, Public Itinerary view UI. |

---

## 3. Database Schema Specification (Prisma / PostgreSQL)

### Data Models & Relationships

1. **User** (`users`)
   - `id`: String (UUID, PK)
   - `email`: String (Unique)
   - `passwordHash`: String
   - `name`: String
   - `avatarUrl`: String?
   - `bio`: String?
   - `homeCity`: String?
   - `currency`: String (Default: "USD")
   - `language`: String (Default: "en")
   - `role`: Enum `UserRole` (`USER`, `ADMIN`)
   - `createdAt`, `updatedAt`: DateTime
   - *Relations*: `trips`, `savedDestinations`, `reviews`, `sessions`

2. **Trip** (`trips`)
   - `id`: String (UUID, PK)
   - `userId`: String (FK -> User.id)
   - `title`: String
   - `description`: String?
   - `coverImage`: String?
   - `startDate`: DateTime
   - `endDate`: DateTime
   - `totalBudget`: Float (Default: 0.0)
   - `currency`: String (Default: "USD")
   - `status`: Enum `TripStatus` (`DRAFT`, `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
   - `visibility`: Enum `TripVisibility` (`PRIVATE`, `PUBLIC`, `UNLISTED`)
   - `shareSlug`: String? (Unique, for public sharing)
   - `createdAt`, `updatedAt`: DateTime
   - *Relations*: `user`, `stops`, `budgetExpenses`

3. **TripStop** (`trip_stops`)
   - `id`: String (UUID, PK)
   - `tripId`: String (FK -> Trip.id, cascade delete)
   - `cityId`: String (FK -> City.id)
   - `arrivalDate`: DateTime
   - `departureDate`: DateTime
   - `orderIndex`: Int (Ordering stops within the trip)
   - `accommodationName`: String?
   - `accommodationCost`: Float (Default: 0.0)
   - `transportType`: String? (e.g. "Flight", "Train", "Car", "Bus")
   - `transportCost`: Float (Default: 0.0)
   - `notes`: String?
   - *Relations*: `trip`, `city`, `activities`

4. **City** (`cities`)
   - `id`: String (UUID, PK)
   - `name`: String
   - `country`: String
   - `region`: String?
   - `description`: String
   - `imageUrl`: String
   - `costIndex`: Enum `CostIndex` (`BUDGET`, `MODERATE`, `LUXURY`)
   - `averageDailyCost`: Float
   - `popularityScore`: Float (Default: 0.0)
   - `latitude`: Float?
   - `longitude`: Float?
   - `createdAt`, `updatedAt`: DateTime
   - *Relations*: `activities`, `tripStops`, `savedByUsers`

5. **Activity** (`activities`)
   - `id`: String (UUID, PK)
   - `cityId`: String (FK -> City.id, cascade delete)
   - `title`: String
   - `description`: String
   - `category`: Enum `ActivityCategory` (`SIGHTSEEING`, `FOOD`, `ADVENTURE`, `CULTURE`, `RELAXATION`, `SHOPPING`, `NIGHTLIFE`)
   - `estimatedCost`: Float (Default: 0.0)
   - `durationMinutes`: Int (Default: 60)
   - `imageUrl`: String?
   - `rating`: Float (Default: 4.5)
   - `address`: String?
   - `latitude`: Float?
   - `longitude`: Float?
   - `createdAt`, `updatedAt`: DateTime
   - *Relations*: `city`, `tripActivities`

6. **TripActivity** (`trip_activities`)
   - `id`: String (UUID, PK)
   - `tripStopId`: String (FK -> TripStop.id, cascade delete)
   - `activityId`: String? (FK -> Activity.id, optional for custom user activities)
   - `customTitle`: String?
   - `customDescription`: String?
   - `category`: Enum `ActivityCategory` (Default: `SIGHTSEEING`)
   - `scheduledDate`: DateTime
   - `startTime`: String? (e.g., "09:30")
   - `durationMinutes`: Int (Default: 60)
   - `actualCost`: Float (Default: 0.0)
   - `status`: Enum `ActivityStatus` (`PLANNED`, `COMPLETED`, `SKIPPED`)
   - `notes`: String?
   - `orderIndex`: Int (Default: 0)
   - *Relations*: `tripStop`, `activity`

7. **Expense** (`expenses`)
   - `id`: String (UUID, PK)
   - `tripId`: String (FK -> Trip.id, cascade delete)
   - `category`: Enum `ExpenseCategory` (`TRANSPORT`, `STAY`, `ACTIVITIES`, `MEALS`, `MISCELLANEOUS`)
   - `title`: String
   - `amount`: Float
   - `currency`: String (Default: "USD")
   - `date`: DateTime
   - `notes`: String?
   - `tripStopId`: String? (FK -> TripStop.id, optional)
   - *Relations*: `trip`

8. **SavedDestination** (`saved_destinations`)
   - `id`: String (UUID, PK)
   - `userId`: String (FK -> User.id, cascade delete)
   - `cityId`: String (FK -> City.id, cascade delete)
   - `savedAt`: DateTime (Default: now())
   - *Relations*: `user`, `city`

---

## 4. Business Logic & Validation Rules

1. **Trip Dates**:
   - `startDate` <= `endDate`.
   - Modifying a trip date range validates that existing stops and activities remain within or adjusts gracefully.
2. **Trip Stop Dates**:
   - Stop `arrivalDate` >= `trip.startDate`.
   - Stop `departureDate` <= `trip.endDate`.
   - Stop `arrivalDate` <= Stop `departureDate`.
   - Multi-city stops are sorted chronologically and by `orderIndex`.
3. **Trip Activities**:
   - Activity `scheduledDate` must be between the parent stop's `arrivalDate` and `departureDate`.
4. **Automated Budget Calculation**:
   - **Transport Total**: Sum of `trip_stops.transportCost` + `expenses(TRANSPORT)`.
   - **Stay Total**: Sum of `trip_stops.accommodationCost` + `expenses(STAY)`.
   - **Activities Total**: Sum of `trip_activities.actualCost` (or estimated activity costs) + `expenses(ACTIVITIES)`.
   - **Meals Total**: Sum of `expenses(MEALS)`.
   - **Total Estimated / Actual Cost**: Sum of all category costs.
   - **Daily Average Cost**: `Total Cost / max(1, duration in days)`.
   - **Overbudget Alert**: If `Total Cost > trip.totalBudget`, returns `isOverBudget: true` and `overBudgetAmount: Total Cost - totalBudget`.
5. **Sharing & Privacy**:
   - Trips are `PRIVATE` by default.
   - Setting visibility to `PUBLIC` generates a secure unique `shareSlug`.
   - Public view endpoint `/api/trips/share/[slug]` returns sanitised trip itinerary without exposing private user emails or sensitive auth tokens.
   - Allows "Copy Trip" / Clone mechanism for authenticated users.

---

## 5. API Contracts & Endpoint Specification

### Authentication & Profile
- `POST /api/auth/signup` - Register user (`{ email, password, name }`)
- `POST /api/auth/login` - Authenticate user (`{ email, password }`), set HTTP-only cookie / return session token
- `POST /api/auth/logout` - Invalidate session / clear auth cookie
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/forgot-password` - Trigger password reset
- `GET /api/profile` - Fetch extended user profile & settings
- `PUT /api/profile` - Update user profile & preferences

### Trips & Dashboard
- `GET /api/trips` - List user's trips (supports filter: upcoming, past, status)
- `POST /api/trips` - Create new trip (`{ title, description, startDate, endDate, totalBudget, currency, coverImage }`)
- `GET /api/trips/[id]` - Get complete trip details with stops, activities, and budget summary
- `PUT /api/trips/[id]` - Update trip details & dates
- `DELETE /api/trips/[id]` - Delete trip (cascades)
- `POST /api/trips/[id]/clone` - Clone/copy a trip into current user's account
- `GET /api/dashboard/stats` - Central hub stats (upcoming trips, recent activity, budget summary, recommended cities)

### Itinerary & Trip Stops
- `POST /api/trips/[id]/stops` - Add stop to trip (`{ cityId, arrivalDate, departureDate, transportType, transportCost, accommodationName, accommodationCost }`)
- `PUT /api/trips/[id]/stops/[stopId]` - Update stop details & dates
- `DELETE /api/trips/[id]/stops/[stopId]` - Remove stop
- `PUT /api/trips/[id]/stops/reorder` - Reorder stops (`{ stopIds: string[] }`)

### Activities & Itinerary Items
- `POST /api/trips/[id]/stops/[stopId]/activities` - Add activity to stop (`{ activityId?, customTitle?, scheduledDate, startTime?, durationMinutes?, actualCost?, category? }`)
- `PUT /api/trips/[id]/activities/[activityId]` - Update scheduled activity
- `DELETE /api/trips/[id]/activities/[activityId]` - Remove scheduled activity
- `PUT /api/trips/[id]/activities/reorder` - Reorder activities within day/stop

### City & Activity Discovery
- `GET /api/cities` - List/search cities (query params: `q`, `country`, `costIndex`, `region`, `limit`)
- `GET /api/cities/[id]` - Get city details with top activities
- `GET /api/activities` - Search & filter activities (`cityId`, `category`, `maxCost`, `q`)
- `GET /api/saved-destinations` - Get user saved cities
- `POST /api/saved-destinations` - Save/bookmark city (`{ cityId }`)
- `DELETE /api/saved-destinations/[cityId]` - Remove bookmark

### Budget & Timeline
- `GET /api/trips/[id]/budget` - Detailed budget breakdown (category totals, daily breakdown, overbudget alert, expense items)
- `POST /api/trips/[id]/expenses` - Add custom expense item
- `DELETE /api/trips/[id]/expenses/[expenseId]` - Delete expense item
- `GET /api/trips/[id]/timeline` - Day-by-day structured timeline and calendar data

### Public Sharing
- `POST /api/trips/[id]/share` - Enable/disable public sharing, generates slug (`{ visibility: 'PUBLIC' | 'PRIVATE' }`)
- `GET /api/trips/share/[slug]` - Public read-only trip itinerary

---

## 6. Response Formats & Error Handling Standards

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "User friendly error message",
    "details": [ ... ]
  }
}
```

### Standard HTTP Status Codes
- `200 OK`: Successful retrieval/update
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation failure or malformed payload
- `401 Unauthorized`: Unauthenticated / missing valid token
- `403 Forbidden`: Authenticated user does not own or have permission to access resource
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Business logic violation (e.g. overlapping dates, duplicate share slugs)
- `500 Internal Server Error`: Unhandled server error (sanitized message)

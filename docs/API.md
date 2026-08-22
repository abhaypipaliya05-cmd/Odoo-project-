# GlobeTrotter API Documentation

This document serves as the technical integration contract between the Backend (Yaksh) and Frontend developers (Dhanvi, Deep, Dhruv).

---

## Base URL & Conventions
- **Base URL**: `/api`
- **Authentication**: All protected endpoints require either an `Authorization: Bearer <token>` header or the HTTP-only `gt_session_token` cookie.
- **Request Format**: `Content-Type: application/json`
- **Standard Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional feedback"
}
```
- **Standard Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "Human readable message",
    "details": [{ "field": "fieldName", "message": "error description" }]
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/signup`
- **Auth**: Public
- **Request Body**:
```json
{
  "name": "Alex Traveler",
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "alex@example.com",
      "name": "Alex Traveler",
      "role": "USER",
      "currency": "USD",
      "language": "en"
    },
    "token": "jwt-token-string"
  },
  "message": "User registered successfully"
}
```

### `POST /api/auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Success (200 OK)**: Returns user profile and session token. Also sets `gt_session_token` cookie.

### `POST /api/auth/logout`
- **Auth**: Public / Authenticated
- **Success (200 OK)**: Clears authentication session cookie.

### `GET /api/auth/me`
- **Auth**: Protected
- **Success (200 OK)**: Returns currently logged-in user profile.
- **Error (401)**: Unauthenticated.

### `POST /api/auth/forgot-password`
- **Auth**: Public
- **Request Body**: `{ "email": "alex@example.com" }`
- **Success (200 OK)**: Safe password reset initiation.

---

## 2. User Profile

### `GET /api/profile`
- **Auth**: Protected
- **Success (200 OK)**: Returns full profile including trip counts and saved destinations.

### `PUT /api/profile`
- **Auth**: Protected
- **Request Body**:
```json
{
  "name": "Alex T.",
  "bio": "Travel enthusiast",
  "homeCity": "San Francisco",
  "currency": "USD",
  "language": "en",
  "avatarUrl": "https://..."
}
```

---

## 3. Trips & Itineraries

### `GET /api/trips`
- **Auth**: Protected
- **Query Params**: `status` (DRAFT, PLANNED, IN_PROGRESS, COMPLETED, CANCELLED), `upcoming=true`
- **Success (200 OK)**: Returns array of trips with destination counts, cities, and calculated total estimated costs.

### `POST /api/trips`
- **Auth**: Protected
- **Request Body**:
```json
{
  "title": "Summer Euro Trip",
  "description": "Paris, Rome and Barcelona",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-07-15T00:00:00.000Z",
  "totalBudget": 2500,
  "currency": "USD",
  "visibility": "PRIVATE"
}
```

### `GET /api/trips/[id]`
- **Auth**: Protected (or Public if trip is shared)
- **Success (200 OK)**: Returns full trip graph: stops, cities, activities, expenses, and automated budget summary.

### `PUT /api/trips/[id]`
- **Auth**: Protected (Owner only)
- **Request Body**: Partial trip fields. Validates that updated dates do not orphan existing scheduled stops.

### `DELETE /api/trips/[id]`
- **Auth**: Protected (Owner only)
- **Success (200 OK)**: Cascades deletion across stops, activities, and expenses.

### `POST /api/trips/[id]/clone`
- **Auth**: Protected
- **Description**: Clones an existing public or owned trip into the current authenticated user's account with new UUIDs and private visibility.

---

## 4. Multi-City Stops

### `POST /api/trips/[id]/stops`
- **Auth**: Protected (Owner only)
- **Request Body**:
```json
{
  "cityId": "city-uuid",
  "arrivalDate": "2026-07-01T00:00:00.000Z",
  "departureDate": "2026-07-05T00:00:00.000Z",
  "transportType": "Flight",
  "transportCost": 220,
  "accommodationName": "Grand Hotel",
  "accommodationCost": 450,
  "notes": "Late check-in"
}
```

### `PUT /api/trips/[id]/stops/[stopId]`
- **Auth**: Protected (Owner only)

### `DELETE /api/trips/[id]/stops/[stopId]`
- **Auth**: Protected (Owner only)

### `PUT /api/trips/[id]/stops/reorder`
- **Auth**: Protected (Owner only)
- **Request Body**: `{ "stopIds": ["stop-uuid-1", "stop-uuid-2"] }`

---

## 5. Activity Scheduling

### `POST /api/trips/[id]/stops/[stopId]/activities`
- **Auth**: Protected (Owner only)
- **Request Body**:
```json
{
  "activityId": "optional-db-activity-id",
  "customTitle": "Louvre Guided Tour",
  "category": "CULTURE",
  "scheduledDate": "2026-07-02T00:00:00.000Z",
  "startTime": "09:30",
  "durationMinutes": 150,
  "actualCost": 45
}
```

### `PUT /api/trips/[id]/activities/[activityId]`
- **Auth**: Protected (Owner only)

### `DELETE /api/trips/[id]/activities/[activityId]`
- **Auth**: Protected (Owner only)

### `PUT /api/trips/[id]/activities/reorder`
- **Auth**: Protected (Owner only)
- **Request Body**: `{ "activityIds": ["act-1", "act-2"] }`

---

## 6. Budget & Financial Breakdown

### `GET /api/trips/[id]/budget`
- **Auth**: Protected / Public read if shared
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalBudget": 2500,
    "currency": "USD",
    "totalEstimatedCost": 2340,
    "remainingBudget": 160,
    "isOverBudget": false,
    "overBudgetAmount": 0,
    "durationDays": 15,
    "averageDailyCost": 156,
    "categories": {
      "transport": 650,
      "stay": 900,
      "activities": 380,
      "meals": 310,
      "miscellaneous": 100
    },
    "categoryBreakdown": [
      { "category": "TRANSPORT", "total": 650, "percentage": 27.8 },
      { "category": "STAY", "total": 900, "percentage": 38.5 },
      { "category": "ACTIVITIES", "total": 380, "percentage": 16.2 },
      { "category": "MEALS", "total": 310, "percentage": 13.2 },
      { "category": "MISCELLANEOUS", "total": 100, "percentage": 4.3 }
    ],
    "expenses": [ ... ]
  }
}
```

### `POST /api/trips/[id]/expenses`
- **Auth**: Protected (Owner only)
- **Request Body**:
```json
{
  "category": "MEALS",
  "title": "Tasting menu dinner",
  "amount": 85.50,
  "currency": "USD",
  "date": "2026-07-03T00:00:00.000Z"
}
```

### `DELETE /api/trips/[id]/expenses/[expenseId]`
- **Auth**: Protected (Owner only)

---

## 7. Timeline & Calendar

### `GET /api/trips/[id]/timeline`
- **Auth**: Protected / Public read if shared
- **Success (200 OK)**: Returns complete day-by-day structured itinerary timeline with active city, accommodation, transport, and scheduled activities.

---

## 8. Public Sharing

### `POST /api/trips/[id]/share`
- **Auth**: Protected (Owner only)
- **Request Body**: `{ "visibility": "PUBLIC" }` (or "PRIVATE")
- **Success (200 OK)**: Returns generated unique `shareSlug` and public URL.

### `GET /api/trips/share/[slug]`
- **Auth**: Public
- **Success (200 OK)**: Returns sanitized public itinerary view (excluding creator's email and passwordHash).

---

## 9. Discovery & Bookmarks

### `GET /api/cities`
- **Auth**: Public / Optional Auth (attaches `isSaved`)
- **Query Params**: `q`, `country`, `region`, `costIndex` (BUDGET, MODERATE, LUXURY), `limit`

### `GET /api/cities/[id]`
- **Auth**: Public / Optional Auth
- **Success (200 OK)**: Returns city details and all curated activities.

### `GET /api/activities`
- **Auth**: Public
- **Query Params**: `cityId`, `category`, `maxCost`, `q`, `limit`

### `GET /api/saved-destinations`
- **Auth**: Protected
- **Success (200 OK)**: Returns bookmarked cities.

### `POST /api/saved-destinations`
- **Auth**: Protected
- **Request Body**: `{ "cityId": "city-uuid" }`

### `DELETE /api/saved-destinations/[cityId]`
- **Auth**: Protected

---

## 10. Dashboard & AI Insights

### `GET /api/dashboard/stats`
- **Auth**: Protected
- **Success (200 OK)**: Aggregated stats: total trips, upcoming trips, completed trips, planned budget, saved destinations, and recommendations.

### `POST /api/ai/recommendations`
- **Auth**: Public / Protected
- **Request Body**: `{ "targetBudget": 1500, "preferredCategory": "FOOD", "vibe": "Cultural" }`
- **Success (200 OK)**: Validated AI/deterministic recommendations with explainable reasons.

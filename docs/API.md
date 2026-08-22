# GlobeTrotter API Documentation

Base URL: `/api`

All standard JSON responses adhere to the unified envelope format:

### Success Response:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

- `POST /api/auth/signup`
  - Body: `{ name, email, password }`
  - Returns: `{ user, token }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ user, token }`
- `POST /api/auth/logout`
  - Clears session cookies / tokens
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>` or session cookie
  - Returns: Current logged in user object
- `POST /api/auth/forgot-password`
  - Body: `{ email }`
  - Returns confirmation message

---

## 2. Dashboard Endpoints

- `GET /api/dashboard/stats`
  - Returns:
    ```json
    {
      "totalTrips": 3,
      "upcomingTrips": 2,
      "savedDestinationsCount": 5,
      "totalBudget": 4500,
      "currency": "USD",
      "recentTrips": [...],
      "recommendedDestinations": [...]
    }
    ```

---

## 3. Trips Endpoints

- `GET /api/trips`
  - Query params: `?status=all|upcoming|ongoing|completed&search=...`
  - Returns: Array of user trips with destination count and summary.
- `POST /api/trips`
  - Body: `{ title, description, startDate, endDate, budget, currency, coverImage }`
  - Returns: Newly created trip object.
- `GET /api/trips/:id`
  - Returns: Full trip details including stops, activities, and budget metrics.
- `PUT /api/trips/:id`
  - Body: Updated trip fields.
- `DELETE /api/trips/:id`
  - Deletes the trip and associated stops.
- `POST /api/trips/:id/clone`
  - Duplicates the trip to the current user's profile.
- `POST /api/trips/:id/share`
  - Generates or toggles a public share token.

---

## 4. Profile Endpoints

- `GET /api/profile`
  - Returns: User profile `{ id, name, email, avatar, bio, homeCity, currency, language }`
- `PUT /api/profile`
  - Body: `{ name, avatar, bio, homeCity, currency, language }`
  - Updates profile settings.

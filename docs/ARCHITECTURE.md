# GlobeTrotter System Architecture

## Architecture Overview

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management & Client API**: Standardized `lib/api.ts` client consuming backend REST endpoints
- **Data Models**: Relational schemas for Users, Trips, Stops, Activities, Expenses, and Wishlists

## Directory Structure
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Home / Dashboard)
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   ├── my-trips/
│   ├── trips/
│   │   ├── create/
│   │   └── [id]/
│   ├── profile/
│   ├── explore/
│   ├── saved/
│   └── api/ (Unified Next.js API Routes adhering to the standard response contract)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   └── TripFilterBar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Badge.tsx
├── lib/
│   ├── api.ts (Unified API client)
│   └── utils.ts
├── types/
│   └── index.ts (Shared TypeScript domain interfaces)
└── docs/
```

# GlobeTrotter – Empowering Personalized Travel Planning

GlobeTrotter is a modern, responsive, and intelligent personalized travel planning platform designed to simplify multi-city journeys, day-wise activity scheduling, automated budget estimation, global destination discovery, and community itinerary sharing.

---

## 🌟 Key Features (Frontend - Dhanvi Lead)

1. **Traveler Dashboard (`/`)**: Real-time KPI summary (total trips, upcoming departures, saved bucket list count, cumulative budget targets), quick actions, active trips carousel, and curated recommended destinations with daily cost indexes.
2. **My Trips Hub (`/my-trips`)**: Manage your trips in Grid or List view, filter by status (All, Upcoming, Active Now, Completed), instant search, and quick actions:
   - **View Itinerary**: Detailed day-by-day and multi-city timeline.
   - **Clone Trip**: Fork any itinerary into your account in 1 click.
   - **Share Trip**: Generate public read-only shareable links with clipboard copy.
   - **Delete Trip**: Remove cancelled or test itineraries.
3. **Create Trip Form (`/trips/create`)**: Validated trip initialization with date range pickers, budget target, currency selector, and preset cover photos.
4. **Itinerary View (`/trips/:id`)**: Comprehensive day-by-day timeline, city stop details, accommodation & transit breakdowns, and print-ready PDF mode.
5. **Explore Destinations (`/explore`)**: Searchable global city catalog with region filters, daily cost metrics, popularity rankings, and "+ Plan Trip" shortcuts.
6. **Saved Bucket List (`/saved`)**: Wishlist of saved destinations with 1-click trip planner integration.
7. **Public Itinerary Sharing (`/share/:token`)**: Read-only public preview allowing fellow travelers to explore and clone community trips.
8. **User Profile & Preferences (`/profile`)**: Manage avatar, name, bio, home city, preferred currency (USD, EUR, GBP, INR, JPY, CAD, AUD), and language.
9. **Authentication (`/login`, `/signup`, `/forgot-password`)**: Session management with 1-click **Demo Login** for instant hackathon evaluation.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Client Architecture**: Unified API Client (`lib/api.ts`) respecting the standard envelope contract:
  - Success: `{ "success": true, "data": {}, "message": "..." }`
  - Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Linting
```bash
npm run build
npm run start
```

---

## 🔗 Repository
GitHub: [abhaypipaliya05-cmd/Odoo-project-](https://github.com/abhaypipaliya05-cmd/Odoo-project-)

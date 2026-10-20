# Project Architecture & Technical Specification

## GeoFence — Smart Location & Geofencing System

---

## 1. Architectural Philosophy

GeoFence is structured around the principles of **Domain-Driven Design (DDD)** and **Clean Architecture**:

1. **Separation of Concerns**: Geolocation watching, distance calculations, event dispatching, and UI rendering are completely isolated from one another.
2. **21st.dev Component Compatibility**: Visual UI components never communicate directly with low-level browser APIs (`navigator.geolocation`). Instead, components interact exclusively through custom React hooks (`useLocation`, `useGeofences`, `useMonitoring`). This allows any visual component to be swapped for a component from **21st.dev** without altering application functionality.
3. **Repository Pattern for Persistence**: Data storage is abstracted behind repository interfaces (`IGeofenceRepository`, `IEventRepository`, `ISettingsRepository`). The application currently runs an optimized local storage adapter, with full capability to plug in IndexedDB or Google Cloud Firestore in the future without modifying UI logic.

---

## 2. Directory Structure

```
geofence-system/
├── public/                     # Static assets & icons
├── src/
│   ├── app/                    # Next.js App Router (All routes)
│   │   ├── layout.tsx          # Root HTML shell & fonts
│   │   ├── globals.css         # Theme tokens & custom scrollbars
│   │   ├── page.tsx            # / (Landing page)
│   │   ├── dashboard/page.tsx  # /dashboard (Main operations console)
│   │   ├── geofences/
│   │   │   ├── page.tsx        # /geofences (List & filters)
│   │   │   ├── new/page.tsx    # /geofences/new (Create geofence form)
│   │   │   └── [id]/page.tsx   # /geofences/[id] (Details & telemetry)
│   │   ├── history/page.tsx    # /history (Audit log & JSON export)
│   │   ├── analytics/page.tsx  # /analytics (Distribution & KPI metrics)
│   │   ├── settings/page.tsx   # /settings (Permissions & reset)
│   │   └── help/page.tsx       # /help (Docs & architectural guides)
│   │
│   ├── components/
│   │   ├── dashboard/          # DashboardCards, MapViewPlaceholder, Lists
│   │   ├── layout/             # AppShell, Sidebar, Topbar
│   │   └── ui/                 # Button, Card, Badge, StatusBadge, EmptyState
│   │
│   ├── hooks/                  # React state & orchestration hooks
│   │   ├── useLocation.ts      # HTML5 Geolocation state & permissions
│   │   ├── useGeofences.ts     # Geofence CRUD operations & counts
│   │   └── useMonitoring.ts    # Evaluation loop & event dispatching
│   │
│   ├── lib/
│   │   ├── geofence/           # Distance calculation & transition engine
│   │   │   ├── distanceCalculator.ts (Haversine Formula)
│   │   │   └── geofenceEngine.ts     (ENTER / EXIT transitions)
│   │   ├── location/           # GeolocationService wrapper & error mapping
│   │   ├── notifications/      # Web Notification & in-app queue
│   │   ├── storage/            # Repository interfaces & LocalStorage adapter
│   │   └── utils/              # Class merging utilities (cn)
│   │
│   └── types/                  # Strict TypeScript contracts
│       ├── analytics.ts
│       ├── events.ts
│       ├── geofence.ts
│       └── location.ts
│
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── README.md
├── SETUP.md
└── PROJECT_ARCHITECTURE.md
```

---

## 3. Data Flow Diagram

```
User Device Moves
       │
       ▼
[navigator.geolocation.watchPosition]
       │
       ▼
[LocationService] (Coordinates, Accuracy, Timestamp)
       │
       ▼
[useMonitoring Hook] ───────────────► Evaluates with [GeofenceEngine]
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                           distance <= radius         distance > radius
                           (Status: INSIDE)           (Status: OUTSIDE)
                                 │                           │
                                 └─────────────┬─────────────┘
                                               ▼
                                   State Transition Check
                           (OUTSIDE -> INSIDE: ENTER event)
                           (INSIDE -> OUTSIDE: EXIT event)
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                        [EventRepository]           [NotificationService]
                        (Appends to log)            (Triggers browser toast)
                                 │                           │
                                 └─────────────┬─────────────┘
                                               ▼
                                      [UI Layer Updates]
                             (Map, KPI Cards, History Table)
```

---

## 4. Phase Roadmap Overview (Phases 1 - 24)

| Phase | Milestone | Status |
| :--- | :--- | :---: |
| **Phase 1** | Project Initialization, App Shell, All Routes, Types, Services | **COMPLETED** |
| **Phase 2** | Application Shell and Routing Fine-Tuning | Ready |
| **Phase 3** | Initial UI Components Refinement & Polish | Ready |
| **Phase 4** | Google Maps JavaScript API Integration | Upcoming |
| **Phase 5** | Browser Location Integration & Watchers | Upcoming |
| **Phase 6** | Location Status & Accuracy Indicators | Upcoming |
| **Phase 7** | Interactive Geofence Creation on Map | Upcoming |
| **Phase 8** | High-Precision Distance Calculation | Upcoming |
| **Phase 9** | ENTER / EXIT Event Detection & Debouncing | Upcoming |
| **Phase 10** | Dual Notification System (Browser + In-App) | Upcoming |
| **Phase 11** | Local Persistence (IndexedDB Adapter) | Upcoming |
| **Phase 12** | Advanced Geofence Management & Presets | Upcoming |
| **Phase 13** | Event History Filtering & Data Export | Upcoming |
| **Phase 14** | Dwell Time Detection Engine | Upcoming |
| **Phase 15** | Geospatial Analytics & Visual Charts | Upcoming |
| **Phase 16** | Demo / Simulation Mode | Upcoming |
| **Phase 17** | Development Debug Panel | Upcoming |
| **Phase 18** | Multi-Device Responsive Optimization | Upcoming |
| **Phase 19** | Accessibility (WCAG 2.1, ARIA) Audit | Upcoming |
| **Phase 20** | Automated & Scenario Testing Suite | Upcoming |
| **Phase 21** | Performance Optimization & Memoization | Upcoming |
| **Phase 22** | Security & Privacy Review | Upcoming |
| **Phase 23** | Production Build & Asset Optimization | Upcoming |
| **Phase 24** | Vercel Deployment & Live Verification | Upcoming |

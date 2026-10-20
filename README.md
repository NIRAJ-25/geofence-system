# GeoFence Sentinel — Smart Location & Security Geofencing System

> **A production-grade, academic web application for real-time browser geolocation, virtual perimeter monitoring, automated hardware camera/microphone lockdown, hyper-local incident & traffic news advisories, and categorized local amenities discovery.**

---

## 📌 Executive Overview

**GeoFence Sentinel** is an advanced geospatial intelligence and location-based security platform. Beyond standard boundary tracking, it solves two critical modern challenges and delivers structured locality awareness:

1. **Automated Hardware Security Enforcement (Camera & Microphone Auto-Disable)**:
   - Designed for secure environments such as **museums, examination halls, confidential R&D centers, and defense facilities**.
   - Users can safely carry their smartphones, but the application **automatically revokes and disables camera and microphone hardware** whenever they enter the perimeter, eliminating unauthorized photography and audio surveillance without needing physical phone confiscation.
   - Hardware capabilities are automatically restored upon exiting the security zone.

2. **Hyper-Local Incident & Traffic Advisory Engine**:
   - Detects entry into active road incident, hazard, or bottleneck perimeters (e.g., vehicle accidents, oil spills, construction, waterlogging).
   - Instantly provides localized news alerts, estimated delay impact (e.g. `+35 min delay`), and **actionable alternate detour routes** to bypass routine hurdles.

3. **Mannerly Local Amenities & POI Directory**:
   - Structured, categorized local service intelligence for any active geofence or user vicinity:
     - 🏥 **Hospitals**: Multi-specialty trauma centers, walk-in clinics, 24/7 emergency
     - ☕ **Cafes**: Specialty roasteries, espresso bars, bakery lounges
     - 🏨 **Hotels**: 5-star luxury suites, business transit inns
     - ⛽ **Gas Stations & EV**: Premium fuels, 250kW Tesla/CCS EV Superchargers
     - 🛍️ **Malls**: Multi-level gallerias, shopping centers, designer plazas
     - 🎬 **Theatres**: Laser IMAX multiplexes, indie playhouses
     - 🏪 **Stores**: Supermarkets, 24/7 pharmacies, electronics stores, academic bookstores

---

## 🌟 Core Features

- **Automated Hardware Security Guard**: Interacts with browser `navigator.mediaDevices` to terminate and lock active audio/video feeds upon entering restricted security zones.
- **Hyper-Local Incident Advisories**: Dynamic banners displaying headline, severity, and detour guidance.
- **Categorized POI Directory**: Mannerly tabbed interface with live proximity distances (`~85m away`), ratings, open hours, and map pins.
- **Real-Time Browser Geolocation**: High-accuracy `watchPosition` GPS tracking with accuracy rings.
- **Spherical Haversine Distance Engine**: Mathematical distance calculation between user coordinates and boundary centers.
- **Anti-Jitter Debounce & State Transitions**: Clean `ENTER`, `EXIT`, and `DWELL` event detection without GPS noise fluctuation.
- **Live Google Maps JavaScript API**: Real-world satellite and vector maps, interactive geofence circles, custom markers, and click-to-pick coordinates.
- **Full Route Ecosystem**:
  - `/` — Modern landing page
  - `/dashboard` — Live command console with hardware guard, incident alerts, Google Map, and amenities directory
  - `/amenities` — Dedicated locality amenities explorer
  - `/geofences` — Boundary management with search, filter, and quick toggles
  - `/geofences/new` — Parametric zone creator with Security, Incident, Amenity, and Standard profiles
  - `/geofences/[id]` — Detailed zone inspector with radar canvas and real-time distance
  - `/history` — Audit trail with security action stamps and JSON export
  - `/analytics` — Spatial intelligence with transition ratios and zone statistics
  - `/settings` — Diagnostic panel, hardware permissions, and honest browser limitation disclaimers
  - `/help` — Documentation, algorithmic details, and architectural specifications

---

## 🏗️ System Architecture

```
                                 [ User Smartphone / Browser GPS ]
                                                 │
                                                 ▼
                                    [ Real-Time Geofence Engine ]
                                  (Continuous Haversine Proximity)
                                                 │
        ┌────────────────────────────────────────┼────────────────────────────────────────┐
        ▼                                        ▼                                        ▼
[ SECURITY ZONE ]                        [ INCIDENT ZONE ]                        [ AMENITY ZONE ]
(Museums, Exam Halls)                   (Accident / Traffic Area)                 (Commercial District)
        │                                        │                                        │
        ▼                                        ▼                                        ▼
[ Hardware Security Guard ]              [ Hyper-Local News Alert ]               [ Locality POI Catalog ]
• Auto-terminates active camera          • Incident headline & severity           • 🏥 Hospitals
• Auto-mutes active microphone           • Delay estimate (+35 min)               • ☕ Cafes
• Blocks media capture requests          • Alternate detour recommendation        • 🏨 Hotels
• Displays "Hardware Restricted"         • Emergency news summary                 • ⛽ Gas & EV Charging
• Restores hardware on EXIT                                                       • 🛍️ Malls
                                                                                  • 🎬 Theatres
                                                                                  • 🏪 Stores
```

---

## 🚀 Running the Project

```bash
cd /Users/nirajkumarsingh/.gemini/antigravity-ide/scratch/geofence-system

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Visit:
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Local Amenities**: [http://localhost:3000/amenities](http://localhost:3000/amenities)

---

## 🧪 Quick Presentation Demonstration Guide

1. **Test Camera/Mic Lockdown**:
   - In the **Hardware Policy & Security Guard** widget on the dashboard, click **"Test Camera & Mic Access"**. Notice the active feed.
   - In the **Simulation Controller**, click **"Step INSIDE"** on *National Art & History Museum*.
   - **Result**: The camera/mic stream is instantly terminated, the badge flashes **`🔴 HARDWARE RESTRICTED`**, and camera access is blocked by policy!
   - Click **"Step OUTSIDE"** to restore hardware access.

2. **Test Traffic Incident & Alternate Detour**:
   - In the **Simulation Controller**, click **"Step INSIDE"** on *Grand Expressway Junction*.
   - **Result**: A high-priority amber advisory appears with the 3-vehicle accident headline, a +35 min delay warning, and the recommended alternate route detour!

3. **Explore Mannerly Local Amenities**:
   - Scroll to the **Hyper-Local Amenities Directory** to filter between Hospitals, Cafes, Hotels, Gas Stations, Malls, Theatres, and Stores with distance, ratings, and contact info.

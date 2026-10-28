# AEROVATA by TASPORA — Autonomous Drone Delivery Command Center

> **Live BVLOS Drone Fleet Management, Airspace UTM Deconfliction & Telemetry Platform**

![Aerovata Command Center](https://img.shields.io/badge/Platform-AEROVATA-00f0ff?style=for-the-badge&logo=drone)
![Version](https://img.shields.io/badge/Version-1.0.0-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-6.16-cyan?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)

A complete, professional aerospace command center application built for **AEROVATA by TASPORA**, enabling live operations dispatchers to monitor autonomous delivery drones, track real-time routes on high-resolution 2D and 3D geospatial maps, switch to first-person drone gimbal cameras, detect airspace conflicts, and execute intelligent route replanning around restricted airspace.

---

## Key Features

- **Central Geospatial Map Workspace:**
  - High-resolution tactical satellite imagery (Esri World Imagery) and dark aerospace vector basemaps.
  - **2D View:** Top-down tactical routing with smooth panning, zooming, and waypoint markers.
  - **3D View:** Extruded 58° pitch perspective displaying 3D flight paths, corridor altitude ceilings, and terrain.
  - **POV Cockpit View:** Forward-facing synthetic gimbal camera with dynamic landscape motion and full aerospace HUD (artificial horizon, pitch ladder, heading tape, airspeed tape, altitude tape, target lock, and optical zoom).
  - Multi-tier layer controls: Toggle Flight Paths, Geofence Buffers, Sector 4 Restricted Zones, and Waypoints.
- **Synchronized Fleet Monitor:**
  - Real-time aircraft cards showing battery percentage bars, altitude, Lat/Lon GPS readouts, signal strength, and mission status.
  - Filter pills (*All, Active, Delivering, Charging, Alert*) and search input.
  - System status summary (*Total Aircraft, Active Missions, Alerts, System Health*).
- **Interactive Drone Detail Panel:**
  - **Drone Vitals:** Battery voltage, ground speed, heading, RTK GPS fix quality (18 satellites), signal RSSI, motor temperatures, payload weight, and Smart RTB reserve calculation.
  - **Delivery Details:** Mission ID, barcode, cargo description, priority level, pickup hub, destination address, and ETA confidence.
  - **Flight Plan & Waypoints:** Interactive chronological timeline with clickable waypoints.
  - **Mission Controls:** Pause/Resume, Recalculate Route, Return-to-Base, Mark Delivered, and POV camera jump.
- **Aerospace Innovations:**
  - **Smart Return-to-Base (RTB) Prediction:** Energy burn calculation with certified 20% safety reserve buffer.
  - **Airspace Separation Radar:** Trajectory conflict detection between active aircraft with avoidance advisories.
  - **Smart Route Replanning Modal:** Automated detour generation around Sector 4 Restricted Zone with distance/delay comparison.
  - **Mission Flight Replay:** Historical mission scrubber with 1x, 2x, and 5x playback speed.
  - **Audible Radar Beeps:** Web Audio API telemetry audio pulses.

---

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite 5
- **Styling:** Tailwind CSS v4 + Custom Aerospace HUD Design System
- **Mapping & Geospatial:** MapLibre GL JS + GeoJSON
- **Icons:** Lucide React
- **Audio & FX:** Web Audio API + Canvas Confetti

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18, 20, or higher)
- npm, pnpm, or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/aerovata.git

# 2. Navigate to project root
cd aerovata

# 3. Install dependencies
npm install

# 4. Copy environment configuration (optional)
cp .env.example .env.local

# 5. Start the local development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## Building for Production

```bash
# Build optimized production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - 1 Click)

1. Push this repository to your GitHub account (see instructions below).
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
3. Click **"Add New"** > **"Project"** and select your `aerovata` repository.
4. Vercel automatically detects Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**. Your live public URL (e.g. `https://aerovata.vercel.app`) will be available in seconds!

> *Note:* `vercel.json` is already included in this repository to handle client-side routing automatically.

---

### Option 2: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign in.
2. Click **"Add new site"** > **"Import an existing project"** and connect GitHub.
3. Select your `aerovata` repository.
4. Settings:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**.

> *Note:* `public/_redirects` is already included to ensure deep routes resolve to `index.html`.

---

### Option 3: Deploy to GitHub Pages

1. In `vite.config.ts`, set the base path if using project pages:
   ```ts
   export default defineConfig({
     base: '/aerovata/',
     // ...
   })
   ```
2. In GitHub, go to your repository **Settings** > **Pages** > **Build and deployment** > Source: **GitHub Actions** > Select **Static HTML** or **Vite**.

---

## Project Structure

```
aerovata/
├── public/
│   └── _redirects              # SPA rewrite rule for Netlify/Cloudflare
├── src/
│   ├── components/             # Reusable UI & Aerospace modules
│   │   ├── Header.tsx          # Top navigation & UTC clock
│   │   ├── FleetSidebar.tsx    # Aircraft monitor list & summary cards
│   │   ├── MapWorkspace.tsx    # MapLibre GL 2D/3D map & overlays
│   │   ├── DronePOVCamera.tsx  # First-person gimbal camera & HUD
│   │   ├── DroneDetailPanel.tsx# 4-section detail drawer below map
│   │   ├── BottomOverviewPanel.tsx # Flight log & battery meters
│   │   ├── RightSidebar.tsx    # Alerts & airspace separation radar
│   │   ├── RouteReplanModal.tsx# Detour preview & approval modal
│   │   ├── MissionReplayModal.tsx # Historical flight scrubber
│   │   ├── FleetView.tsx       # Aircraft registry table
│   │   ├── MissionsView.tsx    # Cargo/medical delivery manifests
│   │   ├── AirspaceView.tsx    # UTM compliance & sensor array
│   │   ├── AnalyticsView.tsx   # Fleet utilization & efficiency
│   │   ├── AboutModal.tsx      # Enterprise architecture overview
│   │   └── SettingsModal.tsx   # Separation & reserve margin settings
│   ├── data/
│   │   └── mockFleet.ts        # Aircraft, waypoints, geofences data
│   ├── services/
│   │   └── telemetryEngine.ts  # Simulation physics, RTB solver & radar
│   ├── types/
│   │   └── fleet.ts            # TypeScript interfaces
│   ├── App.tsx                 # Master state & simulation orchestrator
│   ├── main.tsx                # Application entrypoint
│   └── index.css               # Styling & aerospace radar effects
├── .env.example                # Template environment variables
├── .gitignore                  # Git exclusions
├── index.html                  # HTML entry with metadata & favicon
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment configuration
└── vite.config.ts              # Vite configuration
```

---

## License

Proprietary © TASPORA Aerospace Technologies. All Rights Reserved.

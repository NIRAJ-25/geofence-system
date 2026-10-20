import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Compass,
  Shield,
  Layers,
  HelpCircle,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function HelpPage() {
  return (
    <AppShell title="Documentation & Architecture">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            System Documentation & Guides
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive reference on geospatial algorithms, browser limits, and architecture.
          </p>
        </div>

        {/* 1. Core Principles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">How Web Geofencing Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              A <strong>geofence</strong> is a virtual geographic boundary defined by a center latitude,
              longitude, and radius in meters.
            </p>
            <p>
              When location monitoring is active, the browser emits geographic position fixes via{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-800">
                navigator.geolocation.watchPosition()
              </code>
              . The system calculates the great-circle distance between the user and the center of each
              active geofence using the <strong>Haversine Formula</strong>:
            </p>
            <div className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-indigo-300">
              d = 2 * R * arcsin(√[sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)])
            </div>
            <p>
              If <code className="font-mono">distance &le; radius</code>, the user is classified as{' '}
              <span className="font-bold text-emerald-600">INSIDE</span>. If{' '}
              <code className="font-mono">distance &gt; radius</code>, the user is classified as{' '}
              <span className="font-bold text-slate-500">OUTSIDE</span>. Transitions between these states
              trigger <span className="font-bold">ENTER</span> and <span className="font-bold">EXIT</span> events.
            </p>
          </CardContent>
        </Card>

        {/* 2. OpenStreetMap & Leaflet Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold">
                OpenStreetMap &amp; Leaflet Integration (Zero API Keys)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              The application uses <strong>Leaflet</strong> with open-source <strong>OpenStreetMap</strong> raster tiles and <strong>Overpass API</strong> for nearby place discovery. No Google Cloud credentials, credit cards, or API quotas are required:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                <strong>Map Rendering:</strong> Interactive client-side canvas powered by Leaflet and standard OpenStreetMap tiles (<code className="font-mono">https://tile.openstreetmap.org/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.png</code>).
              </li>
              <li>
                <strong>Nearby Discovery:</strong> High-resiliency Overpass API and Nominatim querying live OpenStreetMap nodes and ways directly centered on user GPS coordinates.
              </li>
              <li>
                <strong>Zero Configuration:</strong> Runs immediately out-of-the-box without configuring any third-party API keys or paid tiers.
              </li>
              <li>
                <strong>Telemetry &amp; Privacy:</strong> Direct browser Geolocation API with accuracy indicators and strict radius filtering using the Haversine formula.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Browser Limitations vs Native Android */}
        <Card className="border-amber-200 dark:border-amber-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base font-semibold text-amber-800 dark:text-amber-200">
                Browser Limitations vs Native Mobile Apps
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Unlike native Android (<code className="font-mono">GeofencingClient</code>) or iOS (
              <code className="font-mono">CLCircularRegion</code>), web browsers do not offer persistent
              background geofence hardware callbacks when the web page is closed.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Web applications require an active browser tab or progressive service worker.</li>
              <li>Location updates pause when the mobile device terminates browser process execution.</li>
              <li>GPS accuracy varies between WiFi triangulation (~50-200m) and cellular/satellite GPS (~5-15m).</li>
            </ul>
          </CardContent>
        </Card>

        {/* 4. 21st.dev Component Swappability */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base font-semibold">
                Architecture & 21st.dev Compatibility
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              To ensure the UI can later be redesigned using components from <strong>21st.dev</strong>, all
              business logic is decoupled into services and hooks:
            </p>
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-mono text-[11px] space-y-1">
                <div>UI Visual Layer (Card, Button, Map Canvas)</div>
                <div className="text-slate-400">↳ Hooks: useMonitoring, useGeofences, useLocation</div>
                <div className="text-slate-400">  ↳ Core Services: LocationService, GeofenceEngine</div>
                <div className="text-slate-400">    ↳ Repository: IGeofenceRepository, IEventRepository</div>
                <div className="text-slate-400">      ↳ Storage: LocalStorage / IndexedDB / Firebase</div>
              </div>
            </div>
            <p>
              You can replace visual UI components with 21st.dev templates without rewriting the location or
              geofencing engine!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

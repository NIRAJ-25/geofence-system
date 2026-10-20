'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { RecentEventsPreview } from '@/components/dashboard/RecentEventsPreview';
import { ActiveGeofenceList } from '@/components/dashboard/ActiveGeofenceList';
import { SimulationControl } from '@/components/dashboard/SimulationControl';
import { DebugPanel } from '@/components/dashboard/DebugPanel';
import { HardwareSecurityWidget } from '@/components/security/HardwareSecurityWidget';
import { IncidentAlertBanner } from '@/components/incidents/IncidentAlertBanner';
import { LocalAmenitiesDirectory } from '@/components/amenities/LocalAmenitiesDirectory';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useGeofences } from '@/hooks/useGeofences';
import { AmenityItem } from '@/types/amenity';
import { AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const [realPlaces, setRealPlaces] = React.useState<AmenityItem[]>([]);
  const {
    location,
    status,
    permission,
    activeCount,
    todayEventCount,
    recentEvents,
    error,
    requestCurrentLocation,
    simulateLocation,
    resetSimulation
  } = useMonitoring();

  const { geofences, totalCount, toggleGeofence } = useGeofences();

  // Active incident fences where user is currently inside
  const activeIncidentFences = geofences.filter(
    (g) => g.enabled && g.zoneType === 'INCIDENT' && g.status === 'INSIDE'
  );

  // Active amenity fences where user is currently inside
  const activeAmenityFences = geofences.filter(
    (g) => g.enabled && g.zoneType === 'AMENITY' && g.status === 'INSIDE'
  );

  return (
    <AppShell title="Live Command Dashboard">
      {/* Location Error or Permission Alert if active */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <span className="font-semibold">{error.type}: </span>
            {error.message}
          </div>
        </div>
      )}

      {/* 4 Dashboard Metric Cards */}
      <DashboardCards
        activeCount={activeCount}
        totalCount={totalCount}
        status={status}
        todayEventsCount={todayEventCount}
        location={location}
      />

      {/* Hyper-Local Traffic & Accident Alert Banner (shown when inside an incident zone) */}
      <IncidentAlertBanner activeIncidentFences={activeIncidentFences} />

      {/* Commercial Hub / Amenity Zone Welcome Alert (shown when inside an amenity zone) */}
      {activeAmenityFences.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 via-sky-50 to-indigo-50 p-4 text-xs dark:border-indigo-900/60 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">
                📍 You have entered {activeAmenityFences[0].name}!
              </span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                {realPlaces.length} points of interest detected: hotels, cafes, hospitals, gas/EV hubs, malls, theatres, and specialty variety stores.
              </p>
            </div>
          </div>
          <Link href="/amenities">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0">
              Browse Directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Hardware Camera & Microphone Security Guard Widget */}
      <HardwareSecurityWidget />

      {/* Presentation / Simulation Mode Controller */}
      <SimulationControl
        geofences={geofences}
        currentLocation={location}
        onSimulateLocation={simulateLocation}
        onResetLocation={resetSimulation}
      />

      {/* Live OpenStreetMap Interactive Canvas with Real Place Pins */}
      <LeafletMapView
        location={location}
        geofences={geofences}
        amenities={realPlaces}
        onRequestLocation={requestCurrentLocation}
        locationError={error}
        locationPermission={permission}
      />

      {/* Structured Hyper-Local Amenities & Services Directory */}
      <LocalAmenitiesDirectory
        location={location}
        onPlacesChange={setRealPlaces}
        onLocateOnMap={(lat, lng) => {
          simulateLocation({
            latitude: lat,
            longitude: lng,
            accuracy: 10,
            timestamp: Date.now()
          });
        }}
      />

      {/* Two-column layout for Recent Events and Active Geofences */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActiveGeofenceList geofences={geofences} onToggle={toggleGeofence} />
        <RecentEventsPreview events={recentEvents} />
      </div>

      {/* Development Telemetry Debug Panel */}
      <DebugPanel
        location={location}
        status={status}
        permission={permission}
        geofences={geofences}
        lastEvent={recentEvents[0] || null}
        placesReturned={realPlaces.length}
        placesDisplayed={realPlaces.length}
        searchRadius={1000}
      />
    </AppShell>
  );
}

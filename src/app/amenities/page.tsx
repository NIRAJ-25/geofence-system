'use client';

import React, { useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LocalAmenitiesDirectory } from '@/components/amenities/LocalAmenitiesDirectory';
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useGeofences } from '@/hooks/useGeofences';
import { MASTER_AMENITIES } from '@/lib/amenities/amenityService';
import { AmenityItem } from '@/types/amenity';
import { AmenityDetailModal } from '@/components/amenities/AmenityDetailModal';
import {
  HeartHandshake,
  Compass,
  MapPin,
  Building2,
  Hospital,
  Store,
  Sparkles,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AmenitiesPage() {
  const { location, error, permission, requestCurrentLocation, simulateLocation } = useMonitoring();
  const { geofences } = useGeofences();
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityItem | null>(null);
  const [realPlaces, setRealPlaces] = useState<AmenityItem[]>([]);

  const handleLocateOnMap = useCallback((lat: number, lng: number) => {
    simulateLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 8,
      timestamp: Date.now()
    });
    // Smoothly scroll to map
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }, [simulateLocation]);

  return (
    <AppShell title="Civic Amenities & Variety Stores Directory">
      <div className="space-y-6">
        {/* Header with Title and Quick Focal Points */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-100 p-1.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Neighborhood Amenities & Variety Stores
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time establishments detected around your exact GPS coordinates with live status and visitor etiquette codes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={requestCurrentLocation}
              className="text-xs h-8"
            >
              <Compass className="h-3.5 w-3.5 mr-1 text-indigo-600" />
              Center on My GPS
            </Button>
          </div>
        </div>

        {/* Civic Manners Charter Banner */}
        <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 via-sky-50 to-indigo-50 p-4 sm:p-5 dark:border-indigo-900/60 dark:bg-linear-to-r dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shrink-0 mt-0.5 shadow-sm">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Civic Manners & Visitor Etiquette Charter
              </h3>
              <p className="mt-1 text-xs text-indigo-900/80 dark:text-slate-300 leading-relaxed">
                Our directory couples geospatial awareness with courteous community conduct. Whether silencing mobile phones during live theatre performances, observing quiet visiting hours in hospital trauma centers, or respecting queue lines in busy variety markets, each establishment includes house guidelines to keep interactions civil and seamless.
              </p>
            </div>
          </div>
        </div>

        {/* Live OpenStreetMap Interactive Canvas with Real Place Markers */}
        <LeafletMapView
          location={location}
          geofences={geofences}
          amenities={realPlaces}
          onRequestLocation={requestCurrentLocation}
          onSelectAmenity={setSelectedAmenity}
          heightClass="h-[380px]"
          showAmenitiesToggle={true}
          locationError={error}
          locationPermission={permission}
        />

        {/* Categorized & Mannered Amenities Directory */}
        <LocalAmenitiesDirectory
          location={location}
          onPlacesChange={setRealPlaces}
          onLocateOnMap={handleLocateOnMap}
        />
      </div>

      {/* Selected Amenity Dossier Modal (triggered via map pin click) */}
      <AmenityDetailModal
        amenity={selectedAmenity}
        onClose={() => setSelectedAmenity(null)}
        onLocateOnMap={handleLocateOnMap}
      />
    </AppShell>
  );
}

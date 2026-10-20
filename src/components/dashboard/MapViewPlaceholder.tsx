'use client';

import React from 'react';
import { MapPin, Crosshair, Layers, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LocationCoordinates } from '@/types/location';
import { Geofence } from '@/types/geofence';

interface MapViewPlaceholderProps {
  location: LocationCoordinates | null;
  geofences: Geofence[];
  onRequestLocation: () => void;
}

export function MapViewPlaceholder({
  location,
  geofences,
  onRequestLocation
}: MapViewPlaceholderProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Live Geospatial Canvas</CardTitle>
          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            Phase 1 Engine Canvas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRequestLocation} className="text-xs h-8">
            <Crosshair className="h-3.5 w-3.5 mr-1 text-indigo-600" />
            Center Location
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Map layers">
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative flex h-[420px] w-full flex-col items-center justify-center overflow-hidden bg-slate-900 text-slate-100">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#6366f1 1px, #0f172a 1px)`,
              backgroundSize: `32px 32px`,
              backgroundPosition: `0 0, 16px 16px`
            }}
          />

          {/* Radar sweep ring simulation */}
          <div className="absolute h-96 w-96 rounded-full border border-indigo-500/20 animate-pulse pointer-events-none" />
          <div className="absolute h-64 w-64 rounded-full border border-indigo-400/30 pointer-events-none" />
          <div className="absolute h-32 w-32 rounded-full border border-indigo-300/40 pointer-events-none" />

          {/* Interactive center marker */}
          <div className="relative z-10 flex flex-col items-center text-center p-6 backdrop-blur-xs rounded-2xl bg-slate-900/60 border border-slate-700/60 max-w-md shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30 border border-indigo-400 text-indigo-400 mb-3 animate-bounce">
              <Compass className="h-6 w-6" />
            </div>

            <h4 className="text-base font-bold text-white mb-1">
              Interactive Geofence Map
            </h4>
            <p className="text-xs text-slate-300 mb-4">
              {location
                ? `Current GPS Fix: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (±${Math.round(location.accuracy)}m)`
                : 'Click "Start Monitor" to acquire browser GPS coordinates or "Center Location".'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 border border-slate-700">
                <span className="font-semibold text-emerald-400">{geofences.length}</span> Geofences
                Configured
              </div>
              <div className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 border border-slate-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>OpenStreetMap + Leaflet</span>
              </div>
            </div>
          </div>

          {/* Floating map controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 rounded-lg bg-slate-800/90 p-1 border border-slate-700">
            <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-700 text-slate-200">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-700 text-slate-200">
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>

          {/* Coordinates overlay pill */}
          <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-slate-800/90 px-3 py-1.5 text-[11px] font-mono text-slate-300 border border-slate-700">
            {location ? (
              <span>
                LAT: {location.latitude.toFixed(4)} | LON: {location.longitude.toFixed(4)}
              </span>
            ) : (
              <span>Awaiting real-time GPS coordinate fix...</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

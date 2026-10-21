'use client';

import React from 'react';
import { RotateCcw, Footprints, ShieldAlert, AlertTriangle, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Geofence } from '@/types/geofence';
import { LocationCoordinates } from '@/types/location';

interface SimulationControlProps {
  geofences: Geofence[];
  currentLocation: LocationCoordinates | null;
  onSimulateLocation: (coords: LocationCoordinates) => void;
  onResetLocation: () => void;
}

export function SimulationControl({
  geofences,
  currentLocation,
  onSimulateLocation,
  onResetLocation
}: SimulationControlProps) {
  // Simulate teleporting inside a geofence
  const handleTeleportInside = (fence: Geofence) => {
    onSimulateLocation({
      latitude: fence.latitude,
      longitude: fence.longitude,
      accuracy: 6,
      timestamp: Date.now()
    });
  };

  // Simulate stepping just outside a geofence (radius + 80m away)
  const handleTeleportOutside = (fence: Geofence) => {
    const latOffset = (fence.radius + 80) / 111000;
    onSimulateLocation({
      latitude: fence.latitude + latOffset,
      longitude: fence.longitude,
      accuracy: 10,
      timestamp: Date.now()
    });
  };

  const getZoneIcon = (zoneType?: Geofence['zoneType']) => {
    switch (zoneType) {
      case 'SECURITY':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
      case 'INCIDENT':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case 'AMENITY':
        return <ShoppingBag className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  const getZoneActionLabel = (zoneType?: Geofence['zoneType']) => {
    switch (zoneType) {
      case 'SECURITY':
        return 'Auto-Disables Camera/Mic';
      case 'INCIDENT':
        return 'Delivers Accident Alert';
      case 'AMENITY':
        return 'Loads Nearby Services';
      default:
        return 'Standard Geofence';
    }
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <CardTitle className="text-sm font-bold tracking-tight text-indigo-900 dark:text-indigo-200 uppercase">
              Live Showcase & Simulation Controller
            </CardTitle>
          </div>
          <span className="rounded bg-indigo-200/70 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
            Presentation Ready
          </span>
        </div>
        <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
          Simulate stepping inside specific real-world zones to immediately test Camera/Mic disablement, accident traffic advisories, and local amenities discovery!
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick action buttons for each active geofence */}
        {geofences.length === 0 ? (
          <div className="rounded-xl border border-dashed border-indigo-200/80 bg-white/60 p-4 text-center text-xs text-indigo-900/70 dark:border-indigo-900/60 dark:bg-slate-900/40 dark:text-indigo-300/70">
            No geofences created yet. Create a boundary using &quot;Add Fence&quot; to test zone detection and policy triggers.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {geofences.map((fence) => (
              <div
                key={fence.id}
                className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white p-3.5 dark:border-indigo-900/80 dark:bg-slate-900 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white truncate">
                      {getZoneIcon(fence.zoneType)}
                      <span className="truncate">{fence.name}</span>
                    </div>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: fence.color }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {getZoneActionLabel(fence.zoneType)}
                    </span>
                    <span className="text-[10px] text-slate-400">R: {fence.radius}m</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">
                    {fence.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleTeleportInside(fence)}
                    className="flex-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer transition-all shadow-xs text-center"
                  >
                    Step INSIDE
                  </button>
                  <button
                    onClick={() => handleTeleportOutside(fence)}
                    className="flex-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-all text-center"
                  >
                    Step OUTSIDE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reset control & simulated coordinates */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-indigo-100 pt-3 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Footprints className="h-4 w-4 text-indigo-600" />
            <span>
              Simulated Location:{' '}
              {currentLocation
                ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
                : 'Not simulated (Real GPS)'}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onResetLocation}
            className="text-xs h-7 gap-1 border-indigo-200 dark:border-indigo-800"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Default Fix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { LocationCoordinates, MonitoringStatus, LocationPermissionState } from '@/types/location';
import { Geofence } from '@/types/geofence';
import { GeofenceEvent } from '@/types/events';
import { calculateHaversineDistance } from '@/lib/geofence/distanceCalculator';

interface DebugPanelProps {
  location: LocationCoordinates | null;
  status: MonitoringStatus;
  permission: LocationPermissionState;
  geofences: Geofence[];
  lastEvent: GeofenceEvent | null;
  searchRadius?: number;
  placesReturned?: number;
  placesDisplayed?: number;
}

export function DebugPanel({
  location,
  status,
  permission,
  geofences,
  lastEvent,
  searchRadius = 1000,
  placesReturned = 0,
  placesDisplayed = 0
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute nearest geofence and distance
  let nearestFence: Geofence | null = null;
  let nearestDistance: number | null = null;

  if (location && geofences.length > 0) {
    geofences.forEach((fence) => {
      const dist = calculateHaversineDistance(
        location.latitude,
        location.longitude,
        fence.latitude,
        fence.longitude
      );
      if (nearestDistance === null || dist < nearestDistance) {
        nearestDistance = dist;
        nearestFence = fence;
      }
    });
  }

  const isInsideNearest =
    nearestFence && nearestDistance !== null
      ? nearestDistance <= (nearestFence as Geofence).radius
      : false;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 cursor-pointer select-none border-b border-slate-800 hover:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-white tracking-wide">
            DEBUG TELEMETRY CONSOLE
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            Dev Mode
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'No Fix'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded telemetry metrics */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-950/95">
          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Latitude</span>
            <span className="font-bold text-white text-xs">
              {location ? location.latitude.toFixed(6) : 'N/A'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Longitude</span>
            <span className="font-bold text-white text-xs">
              {location ? location.longitude.toFixed(6) : 'N/A'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">GPS Accuracy</span>
            <span className="font-bold text-indigo-400 text-xs">
              {location ? `~${Math.round(location.accuracy)}m` : 'N/A'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Watcher State</span>
            <span className="font-bold text-emerald-400 text-xs">{status}</span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Permission</span>
            <span className="font-bold text-white text-xs">{permission}</span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Nearest Fence</span>
            <span className="font-bold text-white text-xs truncate block">
              {nearestFence ? (nearestFence as Geofence).name : 'None'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Distance to Center</span>
            <span className="font-bold text-amber-400 text-xs">
              {nearestDistance !== null ? `${Math.round(nearestDistance)}m` : 'N/A'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Perimeter Status</span>
            <span
              className={`font-bold text-xs ${
                isInsideNearest ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {nearestFence ? (isInsideNearest ? 'INSIDE' : 'OUTSIDE') : 'UNKNOWN'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Last Event</span>
            <span className="font-bold text-white text-xs">
              {lastEvent ? `${lastEvent.eventType} (${lastEvent.geofenceName})` : 'None'}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Active Fences</span>
            <span className="font-bold text-white text-xs">
              {geofences.filter((g) => g.enabled).length} of {geofences.length}
            </span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Search Radius</span>
            <span className="font-bold text-amber-400 text-xs">{searchRadius}m</span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Places Returned</span>
            <span className="font-bold text-white text-xs">{placesReturned}</span>
          </div>

          <div className="rounded bg-slate-900/60 p-2 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Places Displayed</span>
            <span className="font-bold text-emerald-400 text-xs">{placesDisplayed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

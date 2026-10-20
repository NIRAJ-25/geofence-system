'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { useGeofences } from '@/hooks/useGeofences';
import { useLocation } from '@/hooks/useLocation';
import { CreateGeofenceInput, Geofence, ZoneType } from '@/types/geofence';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Check,
  ShieldAlert,
  AlertTriangle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const RADIUS_PRESETS = [50, 100, 200, 500, 1000];
const COLOR_PRESETS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export default function NewGeofencePage() {
  const router = useRouter();
  const { addGeofence, geofences } = useGeofences();
  const { location, error: locError, permission: locPermission, requestCurrentLocation } = useLocation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(() => location?.latitude ?? 0);
  const [longitude, setLongitude] = useState<number>(() => location?.longitude ?? 0);
  const [radius, setRadius] = useState(150);
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [zoneType, setZoneType] = useState<ZoneType>('SECURITY');

  // Automatically sync to real user GPS coordinates once acquired
  React.useEffect(() => {
    if (location && latitude === 0 && longitude === 0) {
      setLatitude(parseFloat(location.latitude.toFixed(6)));
      setLongitude(parseFloat(location.longitude.toFixed(6)));
    }
  }, [location, latitude, longitude]);

  // Security policies
  const [disableCamera, setDisableCamera] = useState(true);
  const [disableMicrophone, setDisableMicrophone] = useState(true);
  const [securityLabel, setSecurityLabel] = useState('Restricted Recording Perimeter');

  // Incident parameters
  const [incidentHeadline, setIncidentHeadline] = useState('Traffic Congestion & Roadwork Ahead');
  const [incidentSeverity, setIncidentSeverity] = useState<'CRITICAL' | 'MODERATE' | 'ADVISORY'>('MODERATE');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [alternateRoute, setAlternateRoute] = useState('Divert via Outer Ring Road to save 15 minutes.');

  const [enterNotification, setEnterNotification] = useState(true);
  const [exitNotification, setExitNotification] = useState(true);
  const [dwellEnabled, setDwellEnabled] = useState(false);
  const [dwellDuration, setDwellDuration] = useState(15);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUseCurrentLocation = async () => {
    const coords = await requestCurrentLocation();
    if (coords) {
      setLatitude(parseFloat(coords.latitude.toFixed(6)));
      setLongitude(parseFloat(coords.longitude.toFixed(6)));
    }
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setLatitude(parseFloat(lat.toFixed(6)));
    setLongitude(parseFloat(lng.toFixed(6)));
  }, []);

  const handleZoneTypeChange = (type: ZoneType) => {
    setZoneType(type);
    if (type === 'SECURITY') {
      setColor('#ef4444');
      if (!name) setName('Restricted Security Zone');
    } else if (type === 'INCIDENT') {
      setColor('#f59e0b');
      if (!name) setName('Traffic & Incident Corridor');
    } else if (type === 'AMENITY') {
      setColor('#3b82f6');
      if (!name) setName('Commercial & Amenities District');
    } else {
      setColor('#10b981');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Geofence name is required.');
      return;
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90.');
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180.');
      return;
    }

    if (isNaN(radius) || radius < 10 || radius > 50000) {
      setError('Radius must be between 10m and 50,000m (50km).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGeofenceInput = {
        name: name.trim(),
        description: description.trim(),
        latitude,
        longitude,
        radius,
        color,
        enabled: true,
        enterNotification,
        exitNotification,
        dwellEnabled,
        dwellDuration,
        zoneType,
        securityPolicies:
          zoneType === 'SECURITY'
            ? {
                disableCamera,
                disableMicrophone,
                zoneLabel: securityLabel
              }
            : undefined,
        incidentDetails:
          zoneType === 'INCIDENT'
            ? {
                headline: incidentHeadline,
                severity: incidentSeverity,
                delayMinutes,
                alternateRoute,
                newsSummary: description.trim()
              }
            : undefined
      };

      await addGeofence(payload);
      router.push('/geofences');
    } catch {
      setError('Failed to create geofence. Please verify your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview geofence object for live map feedback
  const previewFence: Geofence = useMemo(
    () => ({
      id: 'preview',
      name: name || 'New Perimeter',
      latitude,
      longitude,
      radius,
      color,
      enabled: true,
      createdAt: 'preview',
      updatedAt: 'preview',
      enterNotification: true,
      exitNotification: true,
      dwellEnabled: false,
      dwellDuration: 15,
      status: 'UNKNOWN',
      zoneType
    }),
    [name, latitude, longitude, radius, color, zoneType]
  );

  const mapGeofences = useMemo(
    () => [...geofences, previewFence],
    [geofences, previewFence]
  );

  return (
    <AppShell title="Create Geofence">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/geofences"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Geofences
          </Link>
        </div>

        {/* Interactive Map Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Interactive Map Selector (Click anywhere on the map to set zone center)
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
          </div>
          <LeafletMapView
            location={location}
            geofences={mapGeofences}
            selectedGeofenceId="preview"
            onSelectCoordinates={handleMapClick}
            onRequestLocation={requestCurrentLocation}
            heightClass="h-[320px]"
            locationError={locError}
            locationPermission={locPermission}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Geofence Parameters & Intelligence Profile</CardTitle>
              <p className="text-xs text-slate-500">
                Configure zone objective, hardware restriction policies, or traffic advisories.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* 1. Zone Profile Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Select Zone Purpose & Behavior *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Security */}
                  <div
                    onClick={() => handleZoneTypeChange('SECURITY')}
                    className={`rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                      zoneType === 'SECURITY'
                        ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldAlert className="h-5 w-5 text-rose-600" />
                      <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                        Restricted Security
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-disables Camera & Microphone inside zone (Museums, Exam Centers, Confidential Labs).
                    </p>
                  </div>

                  {/* Incident */}
                  <div
                    onClick={() => handleZoneTypeChange('INCIDENT')}
                    className={`rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                      zoneType === 'INCIDENT'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        Incident & Traffic
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Delivers accident alerts, traffic delays, and alternate detour recommendations.
                    </p>
                  </div>

                  {/* Amenities */}
                  <div
                    onClick={() => handleZoneTypeChange('AMENITY')}
                    className={`rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                      zoneType === 'AMENITY'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      <span className="font-bold text-xs text-blue-900 dark:text-blue-200">
                        Amenities & Services
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Contextualizes local hospitals, cafes, hotels, gas stations, malls, theatres, and stores.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Security Specific Settings */}
              {zoneType === 'SECURITY' && (
                <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/60 dark:bg-rose-950/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <span>Hardware Lockdown Policy Rules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-rose-200 dark:border-rose-900 dark:bg-slate-900">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Auto-Disable Camera</span>
                        <span className="text-[11px] text-slate-500">Kills video tracks upon boundary entry</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={disableCamera}
                        onChange={(e) => setDisableCamera(e.target.checked)}
                        className="h-4 w-4 accent-rose-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-rose-200 dark:border-rose-900 dark:bg-slate-900">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">Auto-Disable Microphone</span>
                        <span className="text-[11px] text-slate-500">Mutes audio recording upon boundary entry</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={disableMicrophone}
                        onChange={(e) => setDisableMicrophone(e.target.checked)}
                        className="h-4 w-4 accent-rose-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 3. Incident Specific Settings */}
              {zoneType === 'INCIDENT' && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Incident & Traffic Advisory Config</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Incident Headline
                      </label>
                      <input
                        type="text"
                        value={incidentHeadline}
                        onChange={(e) => setIncidentHeadline(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          Severity Level
                        </label>
                        <select
                          value={incidentSeverity}
                          onChange={(e) => setIncidentSeverity(e.target.value as any)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                          <option value="CRITICAL">Critical (High Delay / Roadblock)</option>
                          <option value="MODERATE">Moderate (Slowdown)</option>
                          <option value="ADVISORY">Advisory (Caution)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                          Expected Delay (Minutes)
                        </label>
                        <input
                          type="number"
                          value={delayMinutes}
                          onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Recommended Alternate Route / Detour Guidance
                      </label>
                      <input
                        type="text"
                        value={alternateRoute}
                        onChange={(e) => setAlternateRoute(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Geofence Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Museum, Highway 4 Interchange"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Local News Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detailed zone context, restriction notes, or incident information..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Center Coordinates
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseCurrentLocation}
                    className="text-xs h-7 gap-1"
                  >
                    <Navigation className="h-3 w-3 text-indigo-600" />
                    Use My GPS Location
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Latitude (-90 to 90)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Longitude (-180 to 180)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Radius Configuration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Radius: <span className="font-bold text-indigo-600">{radius} meters</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {RADIUS_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setRadius(p)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                        radius === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {p >= 1000 ? `${p / 1000}km` : `${p}m`}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="10"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Color Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Boundary Map Color
                </label>
                <div className="flex items-center gap-3">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="h-7 w-7 rounded-full flex items-center justify-center transition-transform cursor-pointer hover:scale-110"
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    >
                      {color === c && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-slate-100 p-5 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/geofences')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Zone...' : 'Create Geofence Zone'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}

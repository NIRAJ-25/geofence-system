'use client';

import React, { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { LocalAmenitiesDirectory } from '@/components/amenities/LocalAmenitiesDirectory';
import { useLocation } from '@/hooks/useLocation';
import { geofenceRepository, eventRepository } from '@/lib/storage/localStorageAdapter';
import { calculateHaversineDistance } from '@/lib/geofence/distanceCalculator';
import { Geofence } from '@/types/geofence';
import { GeofenceEvent } from '@/types/events';
import {
  ArrowLeft,
  MapPin,
  Target,
  Compass,
  Clock,
  Trash2,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function GeofenceDetailPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const { location, error: locError, permission: locPermission, requestCurrentLocation } = useLocation();

  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const found = await geofenceRepository.getById(id);
        setGeofence(found);
        if (found) {
          const allEvents = await eventRepository.getAll({ geofenceId: found.id });
          setEvents(allEvents);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <AppShell title="Geofence Details">
        <LoadingState message="Loading geofence details..." />
      </AppShell>
    );
  }

  if (!geofence) {
    return (
      <AppShell title="Not Found">
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">Geofence not found.</p>
          <Link href="/geofences">
            <Button size="sm">Back to Geofences</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Calculate real-time distance from user location
  const currentDistance = location
    ? calculateHaversineDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      )
    : null;

  const isUserInside = currentDistance !== null && currentDistance <= geofence.radius;
  const lastEvent = events[0] || null;

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${geofence.name}?`)) {
      await geofenceRepository.delete(geofence.id);
      router.push('/geofences');
    }
  };

  return (
    <AppShell title={geofence.name}>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/geofences"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Geofences
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Zone
            </Button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Live Status
              </span>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={isUserInside ? 'INSIDE' : 'OUTSIDE'} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isUserInside ? 'User is currently within perimeter' : 'User is outside perimeter'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Radius Boundary
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {geofence.radius}m
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Area: ~{Math.round((Math.PI * Math.pow(geofence.radius, 2)) / 1000)} km²
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Current Distance
              </span>
              <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {currentDistance !== null ? `${Math.round(currentDistance)}m` : 'Awaiting GPS'}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                From user coordinates to center
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Last Event
              </span>
              <div className="mt-2 flex items-center gap-2">
                {lastEvent ? (
                  <>
                    <StatusBadge status={lastEvent.eventType} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {new Date(lastEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">None yet</span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {events.length} total events recorded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live OpenStreetMap Representation with Focused Geofence Circle */}
        <LeafletMapView
          location={location}
          geofences={useMemo(() => (geofence ? [geofence] : []), [geofence])}
          selectedGeofenceId={geofence.id}
          onRequestLocation={requestCurrentLocation}
          heightClass="h-[380px]"
          locationError={locError}
          locationPermission={locPermission}
        />

        {/* Configuration Specs & History Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Zone Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Geofence ID:</span>
                <span className="font-mono">{geofence.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">ENTER Notification:</span>
                <span className="font-semibold">{geofence.enterNotification ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">EXIT Notification:</span>
                <span className="font-semibold">{geofence.exitNotification ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dwell Detection:</span>
                <span>{geofence.dwellEnabled ? `${geofence.dwellDuration} mins` : 'Disabled'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Created:</span>
                <span>{new Date(geofence.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Event History for this Zone</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No events recorded specifically for this geofence yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {events.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={ev.eventType} />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {ev.eventType} event at perimeter
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Dist: {Math.round(ev.distanceFromCenter)}m • GPS Acc: ~{Math.round(ev.accuracy)}m
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400">
                        {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real Nearby Places Centered on this Specific Geofence Perimeter */}
        <LocalAmenitiesDirectory
          overrideCenter={{ latitude: geofence.latitude, longitude: geofence.longitude }}
        />
      </div>
    </AppShell>
  );
}

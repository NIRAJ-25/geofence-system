'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { useGeofences } from './useGeofences';
import { geofenceEngine } from '@/lib/geofence/geofenceEngine';
import { eventRepository, geofenceRepository } from '@/lib/storage/localStorageAdapter';
import { notificationService } from '@/lib/notifications/notificationService';
import { GeofenceEvent } from '@/types/events';
import { MonitoringStatus, LocationCoordinates } from '@/types/location';

export function useMonitoring() {
  const {
    currentLocation,
    realLocation,
    simulatedLocation,
    isWatching,
    error,
    permission,
    startWatching,
    stopWatching,
    requestCurrentLocation,
    simulateLocation,
    resetSimulation
  } = useLocation();

  const { geofences, activeCount } = useGeofences();
  const [recentEvents, setRecentEvents] = useState<GeofenceEvent[]>([]);
  const [todayEventCount, setTodayEventCount] = useState<number>(0);
  const [status, setStatus] = useState<MonitoringStatus>('IDLE');

  // Single source of truth for location
  const effectiveLocation = currentLocation;

  // Load initial events
  const refreshEvents = useCallback(async () => {
    const list = await eventRepository.getRecent(10);
    setRecentEvents(list);

    const all = await eventRepository.getAll();
    const today = new Date().toDateString();
    const todayCount = all.filter((ev) => new Date(ev.timestamp).toDateString() === today).length;
    setTodayEventCount(todayCount);
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  // Sync monitoring status
  useEffect(() => {
    if (simulatedLocation) {
      setStatus('SIMULATION');
    } else if (error) {
      setStatus('ERROR');
    } else if (isWatching) {
      setStatus('ACTIVE');
    } else {
      setStatus('IDLE');
    }
  }, [isWatching, error, simulatedLocation]);

  // Evaluate geofences when effective location updates
  useEffect(() => {
    if (!effectiveLocation || geofences.length === 0) return;

    const results = geofenceEngine.evaluate(effectiveLocation, geofences);

    results.forEach(async (res) => {
      // If status changed, update in repo
      if (res.currentStatus !== res.previousStatus) {
        await geofenceRepository.updateStatus(res.geofenceId, res.currentStatus);
      }

      // If an event was generated
      if (res.eventGenerated) {
        await eventRepository.add(res.eventGenerated);
        setRecentEvents((prev) => [res.eventGenerated!, ...prev.slice(0, 9)]);
        setTodayEventCount((prev) => prev + 1);

        // Notify
        const title =
          res.eventGenerated.eventType === 'ENTER'
            ? `Entered ${res.geofenceName}`
            : `Exited ${res.geofenceName}`;
        const body = `Perimeter transition recorded at ${new Date(
          res.eventGenerated.timestamp
        ).toLocaleTimeString()} (Distance: ${Math.round(res.distanceFromCenter)}m)`;
        notificationService.notify(title, body, res.eventGenerated.eventType);
      }
    });
  }, [effectiveLocation, geofences]);

  const toggleMonitoring = useCallback(() => {
    if (isWatching) {
      stopWatching();
    } else {
      startWatching();
    }
  }, [isWatching, startWatching, stopWatching]);

  return {
    location: effectiveLocation,
    realLocation,
    simulatedLocation,
    status,
    permission,
    isWatching,
    activeCount,
    todayEventCount,
    recentEvents,
    error,
    toggleMonitoring,
    requestCurrentLocation,
    simulateLocation,
    resetSimulation,
    refreshEvents
  };
}

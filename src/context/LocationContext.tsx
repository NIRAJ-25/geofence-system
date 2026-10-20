'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LocationCoordinates,
  LocationErrorState,
  LocationPermissionState,
  MonitoringStatus
} from '@/types/location';
import { locationService } from '@/lib/location/locationService';

export interface LocationContextType {
  currentLocation: LocationCoordinates | null;
  location: LocationCoordinates | null; // Alias for backwards compatibility
  realLocation: LocationCoordinates | null;
  previousValidLocation: LocationCoordinates | null;
  simulatedLocation: LocationCoordinates | null;
  error: LocationErrorState | null;
  permission: LocationPermissionState;
  isWatching: boolean;
  isAcquiring: boolean;
  isStale: boolean;
  lastUpdateTimestamp: number | null;
  status: MonitoringStatus;
  requestCurrentLocation: () => Promise<LocationCoordinates | null>;
  startWatching: () => void;
  stopWatching: () => void;
  simulateLocation: (coords: LocationCoordinates) => void;
  resetSimulation: () => void;
  setLocation: (coords: LocationCoordinates | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [realLocation, setRealLocation] = useState<LocationCoordinates | null>(null);
  const [previousValidLocation, setPreviousValidLocation] = useState<LocationCoordinates | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<LocationCoordinates | null>(null);
  const [error, setError] = useState<LocationErrorState | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>('prompt');
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(true);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number | null>(null);

  const STALE_TIMEOUT_MS = 35000; // 35 seconds without GPS fix = stale
  const staleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Single source of truth for location
  const currentLocation: LocationCoordinates | null = useMemo(() => {
    return simulatedLocation || realLocation || previousValidLocation;
  }, [simulatedLocation, realLocation, previousValidLocation]);

  // Derive status
  const status: MonitoringStatus = useMemo(() => {
    if (simulatedLocation) return 'SIMULATION';
    if (error && !realLocation && !previousValidLocation) return 'ERROR';
    if (isAcquiring && !realLocation) return 'ACQUIRING';
    if (isStale) return 'STALE';
    if (isWatching && realLocation) return 'ACTIVE';
    return 'IDLE';
  }, [simulatedLocation, error, realLocation, previousValidLocation, isAcquiring, isStale, isWatching]);

  // Reset or re-arm staleness timer whenever realLocation updates
  const handleLocationUpdate = useCallback((coords: LocationCoordinates) => {
    setRealLocation(coords);
    setPreviousValidLocation(coords);
    setLastUpdateTimestamp(coords.timestamp || Date.now());
    setIsAcquiring(false);
    setIsStale(false);
    setError(null);
    setPermission('granted');

    if (staleTimerRef.current) {
      clearTimeout(staleTimerRef.current);
    }
    staleTimerRef.current = setTimeout(() => {
      setIsStale(true);
    }, STALE_TIMEOUT_MS);
  }, []);

  // Check initial permission
  useEffect(() => {
    if (typeof window === 'undefined' || !('permissions' in navigator)) return;

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((permStatus) => {
        setPermission(permStatus.state as LocationPermissionState);
        permStatus.onchange = () => {
          setPermission(permStatus.state as LocationPermissionState);
        };
      })
      .catch(() => {
        setPermission('prompt');
      });

    return () => {
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
    };
  }, []);

  const requestCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    setIsAcquiring(true);
    setError(null);
    try {
      const coords = await locationService.getCurrentPosition({ enableHighAccuracy: true });
      handleLocationUpdate(coords);
      return coords;
    } catch (err: unknown) {
      const errState = err as LocationErrorState;
      setError(errState);
      setIsAcquiring(false);
      if (errState.type === 'PERMISSION_DENIED') {
        setPermission('denied');
      }
      return null;
    }
  }, [handleLocationUpdate]);

  const startWatching = useCallback(() => {
    setError(null);
    const watchId = locationService.startWatching(
      (coords) => {
        handleLocationUpdate(coords);
      },
      (err) => {
        setError(err);
        setIsAcquiring(false);
        if (err.type === 'PERMISSION_DENIED') {
          setPermission('denied');
        }
      },
      { enableHighAccuracy: true }
    );

    if (watchId !== null) {
      setIsWatching(true);
    }
  }, [handleLocationUpdate]);

  const stopWatching = useCallback(() => {
    locationService.stopWatching();
    setIsWatching(false);
    if (staleTimerRef.current) {
      clearTimeout(staleTimerRef.current);
    }
  }, []);

  const simulateLocation = useCallback((coords: LocationCoordinates) => {
    setSimulatedLocation(coords);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulatedLocation(null);
  }, []);

  const setLocation = useCallback((coords: LocationCoordinates | null) => {
    setSimulatedLocation(coords);
  }, []);

  // Automatically request GPS fix and begin watching on mount
  useEffect(() => {
    let isMounted = true;
    const initTimer = setTimeout(() => {
      if (isMounted) {
        requestCurrentLocation().finally(() => {
          if (isMounted) {
            startWatching();
          }
        });
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      locationService.stopWatching();
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
      }
    };
  }, [requestCurrentLocation, startWatching]);

  const value = useMemo<LocationContextType>(() => ({
    currentLocation,
    location: currentLocation,
    realLocation,
    previousValidLocation,
    simulatedLocation,
    error,
    permission,
    isWatching,
    isAcquiring,
    isStale,
    lastUpdateTimestamp,
    status,
    requestCurrentLocation,
    startWatching,
    stopWatching,
    simulateLocation,
    resetSimulation,
    setLocation
  }), [
    currentLocation,
    realLocation,
    previousValidLocation,
    simulatedLocation,
    error,
    permission,
    isWatching,
    isAcquiring,
    isStale,
    lastUpdateTimestamp,
    status,
    requestCurrentLocation,
    startWatching,
    stopWatching,
    simulateLocation,
    resetSimulation,
    setLocation
  ]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

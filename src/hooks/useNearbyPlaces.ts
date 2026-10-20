'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { overpassPlacesService, PlacesSearchResponse } from '@/lib/places/overpassPlacesService';
import { AmenityCategory, AmenityItem } from '@/types/amenity';
import { isValidCoordinate, calculateHaversineDistance } from '@/lib/geofence/distanceCalculator';

export interface UseNearbyPlacesOptions {
  initialRadiusMeters?: number;
  initialCategory?: AmenityCategory;
  overrideCenter?: { latitude: number; longitude: number } | null;
}

export function useNearbyPlaces(options?: UseNearbyPlacesOptions) {
  const { currentLocation, error: locError, permission, isAcquiring } = useLocation();

  const [radiusMeters, setRadiusMeters] = useState<number>(options?.initialRadiusMeters ?? 1000);
  const [category, setCategory] = useState<AmenityCategory>(options?.initialCategory ?? 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'RATING' | 'NAME'>('DISTANCE');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMetadata, setSearchMetadata] = useState<PlacesSearchResponse | null>(null);

  // Master accumulated repository of unique places for the current region
  const masterPlacesMapRef = useRef<Map<string, AmenityItem>>(new Map());
  const fetchedCategoriesRef = useRef<Set<AmenityCategory>>(new Set());
  const lastRegionRef = useRef<{ lat: number; lng: number; radius: number } | null>(null);

  // Version counter to trigger re-renders when master pool updates
  const [poolVersion, setPoolVersion] = useState<number>(0);

  // Effective center coordinates: overrideCenter or currentLocation
  const centerLat = options?.overrideCenter?.latitude ?? currentLocation?.latitude ?? null;
  const centerLng = options?.overrideCenter?.longitude ?? currentLocation?.longitude ?? null;
  const gpsAccuracy = currentLocation?.accuracy ?? 0;

  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Reset master repository if the user's location shifted (>35m) or radius changed
  useEffect(() => {
    if (centerLat === null || centerLng === null || !isValidCoordinate(centerLat, centerLng)) {
      return;
    }

    if (lastRegionRef.current) {
      const dist = calculateHaversineDistance(
        lastRegionRef.current.lat,
        lastRegionRef.current.lng,
        centerLat,
        centerLng
      );
      if (dist > 35 || lastRegionRef.current.radius !== radiusMeters) {
        masterPlacesMapRef.current.clear();
        fetchedCategoriesRef.current.clear();
        lastRegionRef.current = { lat: centerLat, lng: centerLng, radius: radiusMeters };
        setPoolVersion((v) => v + 1);
      }
    } else {
      lastRegionRef.current = { lat: centerLat, lng: centerLng, radius: radiusMeters };
    }
  }, [centerLat, centerLng, radiusMeters]);

  // Fetch places from the API for a specific category or ALL
  const fetchCategoryPlaces = useCallback(
    async (targetCategory: AmenityCategory, force = false) => {
      if (centerLat === null || centerLng === null || !isValidCoordinate(centerLat, centerLng)) {
        if (permission === 'denied' || locError?.type === 'PERMISSION_DENIED') {
          setError('Location permission denied. Please allow location access in your browser to view nearby places.');
        } else if (isAcquiring) {
          setError('Acquiring satellite / network GPS fix...');
        } else {
          setError('Waiting for user GPS location fix...');
        }
        return;
      }

      // Avoid duplicate API requests if category already fetched for this region
      if (!force && fetchedCategoriesRef.current.has(targetCategory)) {
        return;
      }

      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      activeAbortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);

      try {
        const response = await overpassPlacesService.searchNearbyPlaces({
          latitude: centerLat,
          longitude: centerLng,
          radiusMeters,
          category: targetCategory,
          searchQuery: '',
          openOnly: false,
          minRating: 0,
          sortBy: 'DISTANCE',
          signal: abortController.signal
        });

        // Merge all discovered places into the master repository
        for (const place of response.places) {
          masterPlacesMapRef.current.set(place.id, place);
        }

        fetchedCategoriesRef.current.add(targetCategory);
        setSearchMetadata(response);
        setPoolVersion((v) => v + 1);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const msg = err instanceof Error ? err.message : 'Nearby places could not be loaded.';
        setError(msg);
      } finally {
        if (activeAbortControllerRef.current === abortController) {
          setIsLoading(false);
        }
      }
    },
    [centerLat, centerLng, radiusMeters, permission, locError, isAcquiring]
  );

  // Automatically trigger fetch when category, center, or radius changes
  useEffect(() => {
    if (centerLat === null || centerLng === null || !isValidCoordinate(centerLat, centerLng)) {
      return;
    }

    // If target category hasn't been queried yet, fetch it
    if (!fetchedCategoriesRef.current.has(category)) {
      const timer = setTimeout(() => {
        fetchCategoryPlaces(category);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [category, centerLat, centerLng, radiusMeters, fetchCategoryPlaces]);

  // Derive visible places: Apply category filter, search text, open-now, and sorting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayedPlaces = useMemo(() => {
    const allPlaces = Array.from(masterPlacesMapRef.current.values());

    // 1. Category rule: When All Places is selected, do not apply a category restriction!
    // selectedCategory === "ALL" ? allPlaces : filterPlacesByCategory(allPlaces, selectedCategory)
    let result =
      category === 'ALL'
        ? allPlaces
        : allPlaces.filter((p) => p.categories?.includes(category) || p.category === category);

    // 2. Search keyword filter across name, subCategory, address, and tags
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Open Now filter
    if (openOnly) {
      result = result.filter((p) => p.isOpen);
    }

    // 4. Minimum Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 5. Numeric unrounded distance sorting or name/rating sorting
    if (sortBy === 'DISTANCE') {
      result.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    } else if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'RATING') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [poolVersion, category, searchQuery, openOnly, minRating, sortBy]);

  const refetch = useCallback(() => {
    overpassPlacesService.clearCache();
    masterPlacesMapRef.current.clear();
    fetchedCategoriesRef.current.clear();
    setPoolVersion((v) => v + 1);
    return fetchCategoryPlaces(category, true);
  }, [fetchCategoryPlaces, category]);

  return {
    places: displayedPlaces,
    allPlacesCount: masterPlacesMapRef.current.size,
    isLoading,
    error,
    searchMetadata,
    centerLatitude: centerLat,
    centerLongitude: centerLng,
    gpsAccuracy,
    radiusMeters,
    setRadiusMeters,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    openOnly,
    setOpenOnly,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    refetch
  };
}

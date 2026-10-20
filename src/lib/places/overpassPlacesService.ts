import { calculateHaversineDistance, isValidCoordinate } from '@/lib/geofence/distanceCalculator';
import { AmenityCategory, AmenityItem, StoreVarietyType } from '@/types/amenity';

export interface PlacesSearchParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number; // e.g. 500, 1000, 2000, 5000
  category?: AmenityCategory;
  storeVariety?: StoreVarietyType;
  searchQuery?: string;
  openOnly?: boolean;
  minRating?: number;
  sortBy?: 'DISTANCE' | 'RATING' | 'NAME';
  signal?: AbortSignal;
}

export interface PlacesSearchResponse {
  places: AmenityItem[];
  searchRadius: number;
  returnedCount: number;
  displayedCount: number;
  centerLatitude: number;
  centerLongitude: number;
  fromCache: boolean;
  provider?: string;
  requestId?: number;
}

export class OverpassPlacesService {
  private cache: Map<string, { timestamp: number; data: PlacesSearchResponse }> = new Map();
  private lastEvaluatedCenter: { lat: number; lng: number } | null = null;
  private currentAbortController: AbortController | null = null;
  private activeRequestId: number = 0;
  private readonly SIGNIFICANT_MOVEMENT_THRESHOLD_METERS = 25; // 25m movement threshold
  private readonly CACHE_TTL_MS = 60000; // 60 seconds TTL

  /**
   * Searches for actual nearby establishments using OpenStreetMap and Overpass API.
   * Cancels prior in-flight requests and avoids race conditions from out-of-order network responses.
   */
  public async searchNearbyPlaces(params: PlacesSearchParams): Promise<PlacesSearchResponse> {
    const {
      latitude,
      longitude,
      radiusMeters = 1000,
      category = 'ALL',
      searchQuery,
      openOnly = false,
      sortBy = 'DISTANCE',
      signal
    } = params;

    // Validate coordinates strictly
    if (!isValidCoordinate(latitude, longitude) || (latitude === 0 && longitude === 0)) {
      throw new Error('Valid user GPS coordinates are required for Places search.');
    }

    const thisRequestId = ++this.activeRequestId;

    // Cancel previous in-flight HTTP request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    const abortController = new AbortController();
    this.currentAbortController = abortController;

    // Combine external signal with internal abort controller if provided
    if (signal) {
      signal.addEventListener('abort', () => abortController.abort(), { once: true });
    }

    // Cache key incorporates location rounded to ~100m, radius, category, query, openOnly, sortBy
    const cacheKey = JSON.stringify({
      lat: latitude.toFixed(3),
      lng: longitude.toFixed(3),
      r: radiusMeters,
      c: category,
      q: searchQuery?.trim().toLowerCase() || '',
      o: openOnly,
      sb: sortBy
    });

    // Check movement threshold and in-memory cache
    const isNearbyLastCenter =
      this.lastEvaluatedCenter &&
      calculateHaversineDistance(
        this.lastEvaluatedCenter.lat,
        this.lastEvaluatedCenter.lng,
        latitude,
        longitude
      ) < this.SIGNIFICANT_MOVEMENT_THRESHOLD_METERS;

    const cached = this.cache.get(cacheKey);
    if (isNearbyLastCenter && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return { ...cached.data, fromCache: true, requestId: thisRequestId };
    }

    // Query our OpenStreetMap API Route
    const queryParams = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radiusMeters.toString(),
      category: category,
      query: searchQuery || '',
      openOnly: openOnly ? 'true' : 'false',
      sortBy: sortBy
    });

    try {
      const response = await fetch(`/api/places/nearby?${queryParams.toString()}`, {
        headers: {
          Accept: 'application/json'
        },
        signal: abortController.signal
      });

      if (!response.ok) {
        let errMsg = 'Nearby places could not be loaded.';
        try {
          const errorJson = await response.json();
          errMsg = errorJson.error || errMsg;
        } catch {
          errMsg = `Places request failed with status ${response.status}`;
        }
        throw new Error(errMsg);
      }

      const data: PlacesSearchResponse = await response.json();

      // Check if another request has been started while this one was in flight
      if (thisRequestId !== this.activeRequestId) {
        throw new DOMException('Outdated request superseded by newer search.', 'AbortError');
      }

      const enrichedResponse: PlacesSearchResponse = {
        ...data,
        requestId: thisRequestId
      };

      // Cache the response
      this.cache.set(cacheKey, { timestamp: Date.now(), data: enrichedResponse });
      this.lastEvaluatedCenter = { lat: latitude, lng: longitude };

      return enrichedResponse;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      throw err;
    } finally {
      if (this.currentAbortController === abortController) {
        this.currentAbortController = null;
      }
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.lastEvaluatedCenter = null;
  }
}

export const overpassPlacesService = new OverpassPlacesService();
export const googlePlacesService = overpassPlacesService;

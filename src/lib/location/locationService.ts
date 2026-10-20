import { LocationCoordinates, LocationErrorState, LocationWatchOptions } from '@/types/location';
import { calculateHaversineDistance, isValidCoordinate } from '@/lib/geofence/distanceCalculator';

export type LocationUpdateCallback = (location: LocationCoordinates) => void;
export type LocationErrorCallback = (error: LocationErrorState) => void;

export class LocationService {
  private watchId: number | null = null;
  private isWatching: boolean = false;
  private lastCoords: LocationCoordinates | null = null;
  private readonly JITTER_THRESHOLD_METERS = 1.0; // Ignore sub-meter jitter when standing still
  private readonly FORCE_REFRESH_INTERVAL_MS = 5000; // Force update every 5s even if stationary

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  public static isSecureContext(): boolean {
    if (typeof window === 'undefined') return true;
    if (window.isSecureContext !== undefined) return window.isSecureContext;
    return (
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }

  /**
   * Acquires the current location with an intelligent fallback strategy.
   * Attempts high accuracy first; if that times out, falls back to standard accuracy to avoid indefinite stalls.
   */
  public async getCurrentPosition(options?: LocationWatchOptions): Promise<LocationCoordinates> {
    if (!LocationService.isSupported()) {
      throw {
        message: 'Browser does not support the Geolocation API.',
        type: 'UNSUPPORTED'
      } as LocationErrorState;
    }

    if (!LocationService.isSecureContext()) {
      throw {
        message: 'Geolocation requires a secure HTTPS context or localhost.',
        type: 'UNSUPPORTED'
      } as LocationErrorState;
    }

    const tryGetPosition = (enableHighAccuracy: boolean, timeoutMs: number, maxAgeMs: number) => {
      return new Promise<LocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

            // Strict sanity check
            if (!isValidCoordinate(latitude, longitude) || (latitude === 0 && longitude === 0)) {
              return reject({
                code: 2,
                message: 'Invalid GPS coordinates received from device sensors.',
                type: 'POSITION_UNAVAILABLE'
              } as LocationErrorState);
            }

            const coords: LocationCoordinates = {
              latitude,
              longitude,
              accuracy: typeof accuracy === 'number' && accuracy > 0 ? accuracy : 15,
              altitude,
              altitudeAccuracy,
              heading,
              speed,
              timestamp: position.timestamp || Date.now()
            };

            this.lastCoords = coords;
            resolve(coords);
          },
          (error) => {
            reject(this.mapGeolocationError(error));
          },
          {
            enableHighAccuracy,
            timeout: timeoutMs,
            maximumAge: maxAgeMs
          }
        );
      });
    };

    try {
      // Primary attempt: High accuracy with 8s timeout
      return await tryGetPosition(
        options?.enableHighAccuracy ?? true,
        options?.timeout ?? 8000,
        options?.maximumAge ?? 10000
      );
    } catch (err: unknown) {
      const locationError = err as LocationErrorState;
      // If primary attempt timed out and high accuracy was requested, attempt fast standard-accuracy fallback
      if (locationError.type === 'TIMEOUT' && (options?.enableHighAccuracy ?? true)) {
        try {
          return await tryGetPosition(false, 6000, 30000);
        } catch {
          throw locationError;
        }
      }
      throw locationError;
    }
  }

  /**
   * Starts continuous location tracking with debouncing and jitter filtering.
   * Guarantees that only ONE active watchPosition exists at any time.
   */
  public startWatching(
    onUpdate: LocationUpdateCallback,
    onError: LocationErrorCallback,
    options?: LocationWatchOptions
  ): number | null {
    if (!LocationService.isSupported()) {
      onError({
        message: 'Browser does not support Geolocation API.',
        type: 'UNSUPPORTED'
      });
      return null;
    }

    if (!LocationService.isSecureContext()) {
      onError({
        message: 'Geolocation requires a secure HTTPS context or localhost.',
        type: 'UNSUPPORTED'
      });
      return null;
    }

    // Stop any existing watcher before starting a new one
    this.stopWatching();

    this.isWatching = true;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

        // Strict coordinates validation
        if (!isValidCoordinate(latitude, longitude) || (latitude === 0 && longitude === 0)) {
          return;
        }

        // Reject ridiculous readings (e.g. accuracy > 50,000m)
        if (typeof accuracy === 'number' && accuracy > 50000) {
          return;
        }

        const newCoords: LocationCoordinates = {
          latitude,
          longitude,
          accuracy: typeof accuracy === 'number' && accuracy > 0 ? accuracy : 15,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
          timestamp: position.timestamp || Date.now()
        };

        // Anti-Jitter Filtering
        if (this.lastCoords) {
          try {
            const distanceDelta = calculateHaversineDistance(
              this.lastCoords.latitude,
              this.lastCoords.longitude,
              newCoords.latitude,
              newCoords.longitude
            );
            const timeDelta = newCoords.timestamp - this.lastCoords.timestamp;

            // If stationary and heartbeat interval has not elapsed, ignore jitter
            if (distanceDelta < this.JITTER_THRESHOLD_METERS && timeDelta < this.FORCE_REFRESH_INTERVAL_MS) {
              return;
            }
          } catch {
            // Ignore distance calculation errors and proceed
          }
        }

        this.lastCoords = newCoords;
        onUpdate(newCoords);
      },
      (error) => {
        onError(this.mapGeolocationError(error));
      },
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 15000,
        maximumAge: options?.maximumAge ?? 5000
      }
    );

    return this.watchId;
  }

  public stopWatching(): void {
    if (this.watchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  public getWatchingStatus(): boolean {
    return this.isWatching;
  }

  public getLastCoordinates(): LocationCoordinates | null {
    return this.lastCoords;
  }

  private mapGeolocationError(error: GeolocationPositionError): LocationErrorState {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: error.code,
          message: 'Location access was denied. Please enable location permissions in your browser settings.',
          type: 'PERMISSION_DENIED'
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: error.code,
          message: 'Location signal is unavailable. Ensure device GPS / location services are active.',
          type: 'POSITION_UNAVAILABLE'
        };
      case error.TIMEOUT:
        return {
          code: error.code,
          message: 'GPS location fix timed out. Acquiring satellite / network fix...',
          type: 'TIMEOUT'
        };
      default:
        return {
          code: error.code,
          message: error.message || 'An unknown geolocation error occurred.',
          type: 'UNKNOWN'
        };
    }
  }
}

export const locationService = new LocationService();

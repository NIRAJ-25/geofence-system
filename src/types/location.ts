export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type MonitoringStatus = 'ACTIVE' | 'IDLE' | 'ACQUIRING' | 'STALE' | 'ERROR' | 'SIMULATION';

export interface LocationErrorState {
  code?: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'UNKNOWN';
}

export interface LocationWatchOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

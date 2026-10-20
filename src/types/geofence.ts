export type GeofenceStatus = 'INSIDE' | 'OUTSIDE' | 'UNKNOWN';

export type ZoneType = 'SECURITY' | 'INCIDENT' | 'AMENITY' | 'STANDARD';

export interface IncidentDetails {
  headline: string;
  severity: 'CRITICAL' | 'MODERATE' | 'ADVISORY';
  delayMinutes?: number;
  alternateRoute?: string;
  newsSummary?: string;
}

export interface SecurityPolicies {
  disableCamera: boolean;
  disableMicrophone: boolean;
  zoneLabel?: string;
  enforceLockdownMessage?: string;
}

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  enabled: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  color: string; // Hex color for map rendering
  enterNotification: boolean;
  exitNotification: boolean;
  dwellEnabled: boolean;
  dwellDuration: number; // in minutes (e.g. 5, 10, 15, 30, 60)
  status: GeofenceStatus;
  zoneType?: ZoneType;
  incidentDetails?: IncidentDetails;
  securityPolicies?: SecurityPolicies;
  amenityHighlights?: string[];
}

export type CreateGeofenceInput = Omit<Geofence, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

export type UpdateGeofenceInput = Partial<CreateGeofenceInput>;

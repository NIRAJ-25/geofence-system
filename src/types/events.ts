import { ZoneType } from './geofence';

export type GeofenceEventType = 'ENTER' | 'EXIT' | 'DWELL';

export interface GeofenceEvent {
  id: string;
  geofenceId: string;
  geofenceName: string;
  eventType: GeofenceEventType;
  timestamp: string; // ISO date string
  latitude: number;
  longitude: number;
  distanceFromCenter: number; // in meters
  accuracy: number; // in meters
  dwellDurationMinutes?: number;
  zoneType?: ZoneType;
  securityAction?: string; // e.g. "Hardware Camera & Mic Disabled"
  incidentAlertDelivered?: string; // e.g. "Traffic Detour Recommended via Ring Road"
}

export interface EventFilter {
  search?: string;
  geofenceId?: string;
  eventType?: GeofenceEventType | 'ALL';
  zoneType?: ZoneType | 'ALL';
  startDate?: string;
  endDate?: string;
}

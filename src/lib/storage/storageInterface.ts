import { Geofence, CreateGeofenceInput, UpdateGeofenceInput } from '@/types/geofence';
import { GeofenceEvent, EventFilter } from '@/types/events';

export interface IGeofenceRepository {
  getAll(): Promise<Geofence[]>;
  getById(id: string): Promise<Geofence | null>;
  create(input: CreateGeofenceInput): Promise<Geofence>;
  update(id: string, input: UpdateGeofenceInput): Promise<Geofence | null>;
  delete(id: string): Promise<boolean>;
  toggleEnabled(id: string, enabled: boolean): Promise<Geofence | null>;
  updateStatus(id: string, status: Geofence['status']): Promise<void>;
  clearAll(): Promise<void>;
}

export interface IEventRepository {
  getAll(filter?: EventFilter): Promise<GeofenceEvent[]>;
  getRecent(limit?: number): Promise<GeofenceEvent[]>;
  add(event: GeofenceEvent): Promise<GeofenceEvent>;
  clearHistory(): Promise<void>;
}

export interface AppSettings {
  defaultRadius: number;
  enterNotificationDefault: boolean;
  exitNotificationDefault: boolean;
  dwellNotificationDefault: boolean;
  defaultDwellDuration: number;
  highAccuracyLocation: boolean;
  demoMode: boolean;
}

export interface ISettingsRepository {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  resetDefaults(): Promise<AppSettings>;
}

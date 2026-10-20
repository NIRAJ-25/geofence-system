import { Geofence, CreateGeofenceInput, UpdateGeofenceInput } from '@/types/geofence';
import { GeofenceEvent, EventFilter } from '@/types/events';
import { IGeofenceRepository, IEventRepository, ISettingsRepository, AppSettings } from './storageInterface';

const GEOFENCES_KEY = 'geofence_app_geofences_v1';
const EVENTS_KEY = 'geofence_app_events_v1';
const SETTINGS_KEY = 'geofence_app_settings_v1';

const INITIAL_SEEDS: Geofence[] = [
  {
    id: 'geo-1',
    name: 'National Art & History Museum',
    description: 'High-security cultural gallery. Cameras, video capture, and microphone recording are strictly restricted inside.',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 120,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    color: '#ef4444', // Red (Security)
    enterNotification: true,
    exitNotification: true,
    dwellEnabled: true,
    dwellDuration: 15,
    status: 'OUTSIDE',
    zoneType: 'SECURITY',
    securityPolicies: {
      disableCamera: true,
      disableMicrophone: true,
      zoneLabel: 'Restricted Museum Photography & Audio Zone'
    }
  },
  {
    id: 'geo-2',
    name: 'Grand Expressway Junction',
    description: 'Major traffic bottleneck with active traffic incident and alternate route advisories.',
    latitude: 37.7770,
    longitude: -122.4170,
    radius: 220,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    color: '#f59e0b', // Amber (Incident)
    enterNotification: true,
    exitNotification: true,
    dwellEnabled: false,
    dwellDuration: 10,
    status: 'OUTSIDE',
    zoneType: 'INCIDENT',
    incidentDetails: {
      headline: 'Major 3-Vehicle Collision & Gridlock on Highway Connector',
      severity: 'CRITICAL',
      delayMinutes: 35,
      alternateRoute: 'Divert via Lincoln Parkway / South Loop Arterial to save 25 minutes.',
      newsSummary: 'Traffic authority reports heavy lane obstruction. Emergency personnel clearing debris. Alternate route strongly recommended.'
    }
  },
  {
    id: 'geo-3',
    name: 'Downtown Commercial & Amenities Hub',
    description: 'Central hub with hospitals, cafes, 5-star hotels, EV gas stations, shopping malls, theatres, and specialty stores.',
    latitude: 37.7738,
    longitude: -122.4210,
    radius: 280,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    color: '#3b82f6', // Blue (Amenities)
    enterNotification: true,
    exitNotification: true,
    dwellEnabled: true,
    dwellDuration: 20,
    status: 'OUTSIDE',
    zoneType: 'AMENITY',
    amenityHighlights: ['St. Jude Hospital', 'Apex City Galleria', 'Shell Ultra Gas & EV', 'Blue Bottle Coffee', 'Grand Imperial Hotel']
  },
  {
    id: 'geo-4',
    name: 'University Examination Complex',
    description: 'Academic Hall. Zero camera or microphone recording permitted to prevent examination malpractice.',
    latitude: 37.7725,
    longitude: -122.4180,
    radius: 100,
    enabled: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    color: '#dc2626', // Red (Security)
    enterNotification: true,
    exitNotification: true,
    dwellEnabled: false,
    dwellDuration: 10,
    status: 'OUTSIDE',
    zoneType: 'SECURITY',
    securityPolicies: {
      disableCamera: true,
      disableMicrophone: true,
      zoneLabel: 'Exam Center Anti-Malpractice Perimeter'
    }
  }
];

const INITIAL_EVENTS: GeofenceEvent[] = [
  {
    id: 'ev-1',
    geofenceId: 'geo-1',
    geofenceName: 'University Innovation Lab',
    eventType: 'ENTER',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    latitude: 37.77485,
    longitude: -122.41935,
    distanceFromCenter: 24,
    accuracy: 12
  },
  {
    id: 'ev-2',
    geofenceId: 'geo-1',
    geofenceName: 'University Innovation Lab',
    eventType: 'DWELL',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    latitude: 37.77490,
    longitude: -122.41940,
    distanceFromCenter: 15,
    accuracy: 8,
    dwellDurationMinutes: 15
  },
  {
    id: 'ev-3',
    geofenceId: 'geo-1',
    geofenceName: 'University Innovation Lab',
    eventType: 'EXIT',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    latitude: 37.7770,
    longitude: -122.4180,
    distanceFromCenter: 180,
    accuracy: 15
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  defaultRadius: 100,
  enterNotificationDefault: true,
  exitNotificationDefault: true,
  dwellNotificationDefault: false,
  defaultDwellDuration: 15,
  highAccuracyLocation: true,
  demoMode: false
};

export class LocalStorageGeofenceRepository implements IGeofenceRepository {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public async getAll(): Promise<Geofence[]> {
    if (!this.isClient()) return INITIAL_SEEDS;
    try {
      const data = localStorage.getItem(GEOFENCES_KEY);
      if (!data) {
        localStorage.setItem(GEOFENCES_KEY, JSON.stringify(INITIAL_SEEDS));
        return INITIAL_SEEDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SEEDS;
    }
  }

  public async getById(id: string): Promise<Geofence | null> {
    const list = await this.getAll();
    return list.find((g) => g.id === id) || null;
  }

  public async create(input: CreateGeofenceInput): Promise<Geofence> {
    const list = await this.getAll();
    const newGeofence: Geofence = {
      ...input,
      id: `geo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'UNKNOWN'
    };
    list.unshift(newGeofence);
    if (this.isClient()) {
      localStorage.setItem(GEOFENCES_KEY, JSON.stringify(list));
    }
    return newGeofence;
  }

  public async update(id: string, input: UpdateGeofenceInput): Promise<Geofence | null> {
    const list = await this.getAll();
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...input,
      updatedAt: new Date().toISOString()
    };

    if (this.isClient()) {
      localStorage.setItem(GEOFENCES_KEY, JSON.stringify(list));
    }
    return list[index];
  }

  public async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((g) => g.id !== id);
    if (this.isClient()) {
      localStorage.setItem(GEOFENCES_KEY, JSON.stringify(filtered));
    }
    return true;
  }

  public async toggleEnabled(id: string, enabled: boolean): Promise<Geofence | null> {
    return this.update(id, { enabled });
  }

  public async updateStatus(id: string, status: Geofence['status']): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex((g) => g.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (this.isClient()) {
        localStorage.setItem(GEOFENCES_KEY, JSON.stringify(list));
      }
    }
  }

  public async clearAll(): Promise<void> {
    if (this.isClient()) {
      localStorage.setItem(GEOFENCES_KEY, JSON.stringify([]));
    }
  }
}

export class LocalStorageEventRepository implements IEventRepository {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public async getAll(filter?: EventFilter): Promise<GeofenceEvent[]> {
    let events: GeofenceEvent[] = [];
    if (!this.isClient()) {
      events = INITIAL_EVENTS;
    } else {
      try {
        const data = localStorage.getItem(EVENTS_KEY);
        if (!data) {
          localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
          events = INITIAL_EVENTS;
        } else {
          events = JSON.parse(data);
        }
      } catch {
        events = INITIAL_EVENTS;
      }
    }

    if (!filter) return events;

    return events.filter((ev) => {
      if (filter.geofenceId && ev.geofenceId !== filter.geofenceId) return false;
      if (filter.eventType && filter.eventType !== 'ALL' && ev.eventType !== filter.eventType) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!ev.geofenceName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  public async getRecent(limit: number = 5): Promise<GeofenceEvent[]> {
    const events = await this.getAll();
    return events.slice(0, limit);
  }

  public async add(event: GeofenceEvent): Promise<GeofenceEvent> {
    const events = await this.getAll();
    events.unshift(event);
    if (this.isClient()) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, 500))); // Keep max 500
    }
    return event;
  }

  public async clearHistory(): Promise<void> {
    if (this.isClient()) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify([]));
    }
  }
}

export class LocalStorageSettingsRepository implements ISettingsRepository {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public async getSettings(): Promise<AppSettings> {
    if (!this.isClient()) return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    if (this.isClient()) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
    return updated;
  }

  public async resetDefaults(): Promise<AppSettings> {
    if (this.isClient()) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
    return DEFAULT_SETTINGS;
  }
}

export const geofenceRepository = new LocalStorageGeofenceRepository();
export const eventRepository = new LocalStorageEventRepository();
export const settingsRepository = new LocalStorageSettingsRepository();

import { Geofence, CreateGeofenceInput, UpdateGeofenceInput } from '@/types/geofence';
import { GeofenceEvent, EventFilter } from '@/types/events';
import { IGeofenceRepository, IEventRepository, ISettingsRepository, AppSettings } from './storageInterface';

const GEOFENCES_KEY = 'geofence_app_geofences_v1';
const EVENTS_KEY = 'geofence_app_events_v1';
const SETTINGS_KEY = 'geofence_app_settings_v1';

const LEGACY_DEMO_GEOFENCE_IDS = new Set(['geo-1', 'geo-2', 'geo-3', 'geo-4']);
const LEGACY_DEMO_EVENT_IDS = new Set(['ev-1', 'ev-2', 'ev-3']);

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
    if (!this.isClient()) return [];
    try {
      const data = localStorage.getItem(GEOFENCES_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Purge any legacy demo geofences (geo-1, geo-2, geo-3, geo-4)
      const clean = parsed.filter(
        (g) => g && typeof g.id === 'string' && !LEGACY_DEMO_GEOFENCE_IDS.has(g.id)
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(GEOFENCES_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
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
      return [];
    }
    try {
      const data = localStorage.getItem(EVENTS_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      // Purge any legacy demo events
      const clean = parsed.filter(
        (ev) =>
          ev &&
          typeof ev.id === 'string' &&
          !LEGACY_DEMO_EVENT_IDS.has(ev.id) &&
          !LEGACY_DEMO_GEOFENCE_IDS.has(ev.geofenceId)
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(clean));
      }
      events = clean;
    } catch {
      events = [];
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

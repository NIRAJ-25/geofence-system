'use client';

import { useEffect } from 'react';

/**
 * AuthSessionCleaner removes obsolete authentication session keys and mock accounts
 * from localStorage and sessionStorage. This ensures that any visitor's browser that previously
 * had an auto-seeded demo user (such as admin@geofence.io) has those records safely purged.
 */
export function AuthSessionCleaner() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Clear obsolete auth keys
        localStorage.removeItem('geofence_auth_session_v1');
        localStorage.removeItem('geofence_registered_users_v1');
        sessionStorage.removeItem('geofence_auth_session_v1');
        sessionStorage.removeItem('geofence_registered_users_v1');

        // Clear potential auth cookies if any existed
        document.cookie = 'geofence_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'geofence_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

        // Purge legacy demo geofences (geo-1, geo-2, geo-3, geo-4) from previous visits
        const rawGeofences = localStorage.getItem('geofence_app_geofences_v1');
        if (rawGeofences) {
          try {
            const parsed = JSON.parse(rawGeofences);
            if (Array.isArray(parsed)) {
              const demoIds = new Set(['geo-1', 'geo-2', 'geo-3', 'geo-4']);
              const cleaned = parsed.filter((g) => g && !demoIds.has(g.id));
              if (cleaned.length !== parsed.length) {
                localStorage.setItem('geofence_app_geofences_v1', JSON.stringify(cleaned));
              }
            }
          } catch {
            localStorage.removeItem('geofence_app_geofences_v1');
          }
        }

        // Purge legacy demo events from previous visits
        const rawEvents = localStorage.getItem('geofence_app_events_v1');
        if (rawEvents) {
          try {
            const parsedEvents = JSON.parse(rawEvents);
            if (Array.isArray(parsedEvents)) {
              const demoEventIds = new Set(['ev-1', 'ev-2', 'ev-3']);
              const demoGeoIds = new Set(['geo-1', 'geo-2', 'geo-3', 'geo-4']);
              const cleanedEvents = parsedEvents.filter(
                (ev) => ev && !demoEventIds.has(ev.id) && !demoGeoIds.has(ev.geofenceId)
              );
              if (cleanedEvents.length !== parsedEvents.length) {
                localStorage.setItem('geofence_app_events_v1', JSON.stringify(cleanedEvents));
              }
            }
          } catch {
            localStorage.removeItem('geofence_app_events_v1');
          }
        }
      }
    } catch {
      // Ignore storage access errors in restricted iframe environments
    }
  }, []);

  return null;
}

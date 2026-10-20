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
      }
    } catch {
      // Ignore storage access errors in restricted iframe environments
    }
  }, []);

  return null;
}

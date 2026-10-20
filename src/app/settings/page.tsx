'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/hooks/useLocation';
import { notificationService, NotificationPermissionStatus } from '@/lib/notifications/notificationService';
import { settingsRepository, geofenceRepository, eventRepository } from '@/lib/storage/localStorageAdapter';
import { AppSettings } from '@/lib/storage/storageInterface';
import {
  ShieldAlert,
  Bell,
  MapPin,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { permission: locPermission, requestCurrentLocation } = useLocation();
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionStatus>('default');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    setNotifPermission(notificationService.getPermission());
    settingsRepository.getSettings().then(setSettings);
  }, []);

  const handleRequestNotif = async () => {
    const res = await notificationService.requestPermission();
    setNotifPermission(res);
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    await settingsRepository.updateSettings(settings);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleResetApp = async () => {
    if (confirm('RESET ENTIRE APP: This will wipe all geofences, history, and custom settings. Continue?')) {
      await geofenceRepository.clearAll();
      await eventRepository.clearHistory();
      await settingsRepository.resetDefaults();
      window.location.reload();
    }
  };

  return (
    <AppShell title="System Settings">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Diagnostics</h2>
          <p className="text-xs text-slate-500">
            Configure system defaults, hardware permissions, and inspect telemetry.
          </p>
        </div>

        {savedMessage && (
          <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully!
          </div>
        )}

        {/* 1. Permissions Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Browser Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Geolocation Permission */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Geolocation Permission
                  </div>
                  <div className="text-xs text-slate-500">
                    Required for GPS coordinates & Haversine distance calculations
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {locPermission}
                </span>
                {locPermission !== 'granted' && (
                  <Button size="sm" onClick={requestCurrentLocation} className="text-xs h-7">
                    Request GPS
                  </Button>
                )}
              </div>
            </div>

            {/* Notification Permission */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Browser Notifications
                  </div>
                  <div className="text-xs text-slate-500">
                    Fires system toast when crossing virtual geofence boundaries
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {notifPermission}
                </span>
                {notifPermission !== 'granted' && (
                  <Button size="sm" onClick={handleRequestNotif} className="text-xs h-7">
                    Enable Notifications
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Geofence System Defaults */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Geofence Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Radius (meters)
                </label>
                <input
                  type="number"
                  value={settings.defaultRadius}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultRadius: parseInt(e.target.value, 10) || 100 })
                  }
                  className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between max-w-md pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enable High Accuracy GPS Watcher
                </span>
                <input
                  type="checkbox"
                  checked={settings.highAccuracyLocation}
                  onChange={(e) =>
                    setSettings({ ...settings, highAccuracyLocation: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 p-4 dark:border-slate-800">
              <Button size="sm" onClick={handleSaveSettings}>
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 3. Honest Browser Technical Limitations Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <h4 className="font-bold text-sm">Honest Technical Limitation Disclaimer</h4>
              <p>
                A standard web browser application <strong>does NOT</strong> possess the background geofencing
                capabilities of native operating system applications (such as Android LocationManager or iOS CoreLocation).
              </p>
              <p>
                Location monitoring in this web system runs actively while the application tab is open and when the
                browser permits execution. Do not expect continuous background tracking when the device is locked
                or when the browser application is completely terminated.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Local Data & Reset Operations */}
        <Card className="border-rose-200 dark:border-rose-950">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-rose-600">
              Danger Zone & Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">
              All geofences and logs are persisted locally in your browser storage. You can purge them at any time.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetApp}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Wipe Local Data & Reset Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

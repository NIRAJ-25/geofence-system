'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { eventRepository, geofenceRepository } from '@/lib/storage/localStorageAdapter';
import { GeofenceEvent } from '@/types/events';
import { Geofence } from '@/types/geofence';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  useEffect(() => {
    async function load() {
      const evs = await eventRepository.getAll();
      const gfs = await geofenceRepository.getAll();
      setEvents(evs);
      setGeofences(gfs);
    }
    load();
  }, []);

  const totalEvents = events.length;
  const enterCount = events.filter((e) => e.eventType === 'ENTER').length;
  const exitCount = events.filter((e) => e.eventType === 'EXIT').length;
  const dwellCount = events.filter((e) => e.eventType === 'DWELL').length;

  const todayStr = new Date().toDateString();
  const todayEvents = events.filter((e) => new Date(e.timestamp).toDateString() === todayStr).length;

  // Calculate most triggered geofence
  const frequencyMap: Record<string, { name: string; count: number }> = {};
  events.forEach((e) => {
    if (!frequencyMap[e.geofenceId]) {
      frequencyMap[e.geofenceId] = { name: e.geofenceName, count: 0 };
    }
    frequencyMap[e.geofenceId].count++;
  });

  const sortedGeofences = Object.values(frequencyMap).sort((a, b) => b.count - a.count);
  const mostTriggered = sortedGeofences[0] || null;

  // Average GPS accuracy across events
  const avgAccuracy =
    events.length > 0
      ? Math.round(events.reduce((acc, curr) => acc + curr.accuracy, 0) / events.length)
      : null;

  return (
    <AppShell title="Geospatial Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spatial Intelligence</h2>
          <p className="text-xs text-slate-500">
            Real-time aggregate activity metrics and perimeter transition telemetry.
          </p>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Fences
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {geofences.length}
                </span>
                <span className="text-xs font-medium text-emerald-600">
                  {geofences.filter((g) => g.enabled).length} active
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Total zones configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Events
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {totalEvents}
                </span>
                <span className="text-xs font-medium text-slate-500">all time</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Cross-perimeter logs</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Today&apos;s Activity
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {todayEvents}
                </span>
                <span className="text-xs font-medium text-amber-500">events today</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Recorded since 00:00</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Avg GPS Accuracy
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {avgAccuracy !== null ? `~${avgAccuracy}m` : 'N/A'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Calculated across fixes</p>
            </CardContent>
          </Card>
        </div>

        {/* Transition Distribution & Most Triggered Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Transition Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalEvents === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No events to calculate distribution.
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <ArrowUpRight className="h-4 w-4" /> ENTER Events
                      </span>
                      <span>
                        {enterCount} ({Math.round((enterCount / totalEvents) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${(enterCount / totalEvents) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-amber-600">
                        <ArrowDownRight className="h-4 w-4" /> EXIT Events
                      </span>
                      <span>
                        {exitCount} ({Math.round((exitCount / totalEvents) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${(exitCount / totalEvents) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="flex items-center gap-1.5 text-indigo-600">
                        <Clock className="h-4 w-4" /> DWELL Events
                      </span>
                      <span>
                        {dwellCount} ({Math.round((dwellCount / totalEvents) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${(dwellCount / totalEvents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trigger Frequency Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Events by Geofence</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedGeofences.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No activity recorded across any zones.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedGeofences.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.count} events
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

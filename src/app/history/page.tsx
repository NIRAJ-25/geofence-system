'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { eventRepository, geofenceRepository } from '@/lib/storage/localStorageAdapter';
import { GeofenceEvent, GeofenceEventType } from '@/types/events';
import { Geofence } from '@/types/geofence';
import { Search, Trash2, History as HistoryIcon, Download } from 'lucide-react';

export default function HistoryPage() {
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [geofenceFilter, setGeofenceFilter] = useState<string>('ALL');

  const loadData = useCallback(async () => {
    const evs = await eventRepository.getAll();
    const gfs = await geofenceRepository.getAll();
    setEvents(evs);
    setGeofences(gfs);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all recorded event history? This cannot be undone.')) {
      await eventRepository.clearHistory();
      setEvents([]);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `geofence_events_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filtered = events.filter((ev) => {
    if (typeFilter !== 'ALL' && ev.eventType !== typeFilter) return false;
    if (geofenceFilter !== 'ALL' && ev.geofenceId !== geofenceFilter) return false;
    if (search && !ev.geofenceName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell title="Event History & Audits">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Boundary Transitions</h2>
            <p className="text-xs text-slate-500">
              Audit log of all ENTER, EXIT, and DWELL events detected across configured zones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              disabled={events.length === 0}
              className="text-xs h-8 gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              disabled={events.length === 0}
              className="text-xs h-8 gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by geofence name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Event Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="ALL">All Event Types</option>
              <option value="ENTER">ENTER Only</option>
              <option value="EXIT">EXIT Only</option>
              <option value="DWELL">DWELL Only</option>
            </select>

            {/* Geofence filter */}
            <select
              value={geofenceFilter}
              onChange={(e) => setGeofenceFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="ALL">All Geofences</option>
              {geofences.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No event records found"
            description="As you move across geofence perimeters, real-time trigger records will be logged here."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Event</th>
                    <th className="px-5 py-3 font-semibold">Geofence</th>
                    <th className="px-5 py-3 font-semibold">Time & Date</th>
                    <th className="px-5 py-3 font-semibold">GPS Distance</th>
                    <th className="px-5 py-3 font-semibold">Coordinates</th>
                    <th className="px-5 py-3 font-semibold">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((ev) => (
                    <tr
                      key={ev.id}
                      className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-900/30"
                    >
                      <td className="px-5 py-3.5">
                        <StatusBadge status={ev.eventType} />
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {ev.geofenceName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {new Date(ev.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {Math.round(ev.distanceFromCenter)}m
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">
                        {ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        ~{Math.round(ev.accuracy)}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

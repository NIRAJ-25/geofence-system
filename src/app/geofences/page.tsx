'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGeofences } from '@/hooks/useGeofences';
import { Plus, Search, Filter, Trash2, ExternalLink, MapPin } from 'lucide-react';

export default function GeofencesPage() {
  const { geofences, toggleGeofence, deleteGeofence } = useGeofences();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');

  const filtered = geofences.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE') return g.enabled;
    if (filterStatus === 'DISABLED') return !g.enabled;
    return true;
  });

  return (
    <AppShell title="Geofence Management">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Boundaries</h2>
          <p className="text-xs text-slate-500">
            Define, calibrate, and manage your virtual perimeter zones.
          </p>
        </div>
        <Link href="/geofences/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Geofence
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search geofences by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {(['ALL', 'ACTIVE', 'DISABLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  filterStatus === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No geofences found"
          description={
            search
              ? 'Try modifying your search or filter criteria.'
              : 'Create your first virtual boundary to monitor movement.'
          }
          actionLabel="Create Geofence"
          onAction={() => (window.location.href = '/geofences/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fence) => (
            <Card key={fence.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900"
                        style={{ backgroundColor: fence.color }}
                      />
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {fence.name}
                      </h3>
                    </div>
                    <StatusBadge status={fence.status} />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {fence.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Radius:</span>
                      <span className="font-semibold">{fence.radius} meters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coordinates:</span>
                      <span className="font-mono text-[11px]">
                        {fence.latitude.toFixed(4)}, {fence.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dwell Detection:</span>
                      <span>{fence.dwellEnabled ? `${fence.dwellDuration} mins` : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGeofence(fence.id, !fence.enabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        fence.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={fence.enabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          fence.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-500">
                      {fence.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (confirm(`Delete geofence "${fence.name}"?`)) {
                          deleteGeofence(fence.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete geofence"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/geofences/${fence.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="View details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

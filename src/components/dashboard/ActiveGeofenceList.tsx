import React from 'react';
import Link from 'next/link';
import { MapPin, Plus, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Geofence } from '@/types/geofence';

interface ActiveGeofenceListProps {
  geofences: Geofence[];
  onToggle: (id: string, enabled: boolean) => void;
}

export function ActiveGeofenceList({ geofences, onToggle }: ActiveGeofenceListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Active Geofences</CardTitle>
        </div>
        <Link href="/geofences/new">
          <Button size="sm" variant="outline" className="text-xs h-8">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Fence
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {geofences.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No geofences created yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {geofences.map((fence) => (
              <div key={fence.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                    style={{ backgroundColor: fence.color }}
                  />
                  <div>
                    <Link
                      href={`/geofences/${fence.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {fence.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Radius: {fence.radius}m • {fence.dwellEnabled ? `Dwell ${fence.dwellDuration}m` : 'Enter/Exit'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={fence.status} />
                  <button
                    onClick={() => onToggle(fence.id, !fence.enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      fence.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={fence.enabled}
                    aria-label={`Toggle ${fence.name}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        fence.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
          <Link
            href="/geofences"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Manage All Geofences <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

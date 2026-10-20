import React from 'react';
import { Shield, Activity, BellRing, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { MonitoringStatus, LocationCoordinates } from '@/types/location';

interface DashboardCardsProps {
  activeCount: number;
  totalCount: number;
  status: MonitoringStatus;
  todayEventsCount: number;
  location: LocationCoordinates | null;
}

export function DashboardCards({
  activeCount,
  totalCount,
  status,
  todayEventsCount,
  location
}: DashboardCardsProps) {
  const accuracyText = location
    ? `~${Math.round(location.accuracy)}m`
    : 'Awaiting Fix';

  const accuracySubtext = location
    ? location.accuracy < 20
      ? 'High precision GPS'
      : 'Network / Cell tower fix'
    : 'Click Start Monitor to lock GPS';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Active Geofences */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Active Geofences
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {activeCount}
            </span>
            <span className="text-sm font-medium text-slate-500">
              of {totalCount} total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {totalCount - activeCount} disabled boundaries
          </p>
        </CardContent>
      </Card>

      {/* 2. Monitoring Status */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Monitoring Status
            </span>
            <div
              className={`rounded-lg p-2 ${
                status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold tracking-tight ${
                status === 'ACTIVE'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {status === 'ACTIVE' ? 'Watching browser position' : 'Monitoring paused'}
          </p>
        </CardContent>
      </Card>

      {/* 3. Today's Events */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Today&apos;s Events
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <BellRing className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {todayEventsCount}
            </span>
            <span className="text-sm font-medium text-slate-500">recorded</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Boundary transitions today
          </p>
        </CardContent>
      </Card>

      {/* 4. Location Accuracy */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Location Accuracy
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {accuracyText}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {accuracySubtext}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

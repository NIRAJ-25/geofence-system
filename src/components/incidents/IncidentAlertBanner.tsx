'use client';

import React from 'react';
import { AlertTriangle, Clock, Compass, Navigation, ArrowRight, ShieldAlert } from 'lucide-react';
import { Geofence } from '@/types/geofence';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface IncidentAlertBannerProps {
  activeIncidentFences: Geofence[];
}

export function IncidentAlertBanner({ activeIncidentFences }: IncidentAlertBannerProps) {
  if (activeIncidentFences.length === 0) return null;

  return (
    <div className="space-y-3">
      {activeIncidentFences.map((fence) => {
        const details = fence.incidentDetails;
        if (!details) return null;

        return (
          <div
            key={fence.id}
            className="rounded-xl border-2 border-amber-500 bg-amber-50/90 p-4 text-amber-950 shadow-lg dark:border-amber-600 dark:bg-amber-950/80 dark:text-amber-100 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3 dark:border-amber-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white shadow-sm animate-pulse">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Hyper-Local Traffic & Hazard Advisory
                    </span>
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {details.severity}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-white">
                    {details.headline}
                  </h3>
                </div>
              </div>

              {details.delayMinutes && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-200/80 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                  <Clock className="h-4 w-4" />
                  <span>+{details.delayMinutes} min delay</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-amber-900 dark:text-amber-300 block">
                  Incident Situation:
                </span>
                <p className="text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                  {details.newsSummary || fence.description}
                </p>
              </div>

              {details.alternateRoute && (
                <div className="rounded-lg border border-amber-300 bg-white/80 p-2.5 dark:border-amber-800 dark:bg-slate-900/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Recommended Alternate Detour Route</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {details.alternateRoute}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

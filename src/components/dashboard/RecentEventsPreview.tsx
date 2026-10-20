import React from 'react';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GeofenceEvent } from '@/types/events';

interface RecentEventsPreviewProps {
  events: GeofenceEvent[];
}

export function RecentEventsPreview({ events }: RecentEventsPreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base font-semibold">Recent Event Activity</CardTitle>
        </div>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No events recorded yet. Start monitoring or move across a geofence.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={ev.eventType} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {ev.geofenceName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Dist: {Math.round(ev.distanceFromCenter)}m • Acc: ~{Math.round(ev.accuracy)}m
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

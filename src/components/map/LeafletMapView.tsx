'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MapPin, Loader2 } from 'lucide-react';
import type { LeafletMapViewProps } from './LeafletMapViewInner';

const LeafletMapViewInner = dynamic(
  () => import('./LeafletMapViewInner').then((mod) => mod.LeafletMapViewInner),
  {
    ssr: false,
    loading: () => (
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600 animate-pulse" />
            <CardTitle className="text-base font-semibold">OpenStreetMap Interactive Canvas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex h-[440px] w-full flex-col items-center justify-center bg-slate-950 text-slate-100">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">
              Loading OpenStreetMap & Leaflet engine...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }
);

export function LeafletMapView(props: LeafletMapViewProps) {
  return <LeafletMapViewInner {...props} />;
}

// Backwards compatibility alias
export const GoogleMapView = LeafletMapView;

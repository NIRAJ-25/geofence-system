'use client';

import React from 'react';
import { Menu, Navigation, ShieldCheck, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useMonitoring } from '@/hooks/useMonitoring';

interface TopbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export function Topbar({ onToggleSidebar, title = 'Dashboard' }: TopbarProps) {
  const { status, location, isWatching, toggleMonitoring } = useMonitoring();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Status metrics & controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Real-time accuracy pill */}
        {location && (
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:flex">
            <Navigation className="h-3 w-3 text-indigo-500" />
            <span>Acc: ~{Math.round(location.accuracy)}m</span>
          </div>
        )}

        {/* Monitoring status */}
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <Button
            size="sm"
            variant={isWatching ? 'outline' : 'primary'}
            onClick={toggleMonitoring}
            className="text-xs h-8"
          >
            <Activity className="h-3.5 w-3.5 mr-1" />
            {isWatching ? 'Pause Monitor' : 'Start Monitor'}
          </Button>
        </div>

        {/* Privacy badge */}
        <div className="hidden items-center gap-1 text-xs text-slate-500 sm:flex" title="Local storage mode active. No data sent to third parties.">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="hidden xl:inline">Local Privacy</span>
        </div>

        {/* In-app notification bell */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-slate-600 dark:text-slate-400">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
        </Button>
      </div>
    </header>
  );
}

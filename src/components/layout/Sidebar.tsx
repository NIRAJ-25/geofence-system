'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  Radio,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Geofences', href: '/geofences', icon: MapPin },
    { label: 'Create Geofence', href: '/geofences/new', icon: PlusCircle },
    { label: 'Local Amenities', href: '/amenities', icon: ShoppingBag },
    { label: 'History', href: '/history', icon: History },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Help & Docs', href: '/help', icon: HelpCircle }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold">GeoFence</span>
              <span className="block text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                Location Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom system status */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 space-y-3">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Browser Engine</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              HTML5 Geolocation + Haversine
            </p>
          </div>

          <div className="flex items-center justify-between px-1 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ExternalLink className="h-3 w-3" />
              Landing Page
            </Link>
            <span className="text-[10px] text-slate-400 font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

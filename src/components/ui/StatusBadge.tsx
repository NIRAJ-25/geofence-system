import React from 'react';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: 'ACTIVE' | 'IDLE' | 'ERROR' | 'INSIDE' | 'OUTSIDE' | 'UNKNOWN' | 'ENTER' | 'EXIT' | 'DWELL' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'ACTIVE':
    case 'INSIDE':
      return (
        <Badge variant="success" className="gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status}
        </Badge>
      );
    case 'OUTSIDE':
    case 'IDLE':
      return (
        <Badge variant="secondary" className="gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {status}
        </Badge>
      );
    case 'ERROR':
      return (
        <Badge variant="destructive" className="gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {status}
        </Badge>
      );
    case 'ENTER':
      return (
        <Badge variant="success" className="font-semibold">
          ENTER
        </Badge>
      );
    case 'EXIT':
      return (
        <Badge variant="warning" className="font-semibold">
          EXIT
        </Badge>
      );
    case 'DWELL':
      return (
        <Badge variant="default" className="font-semibold">
          DWELL
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

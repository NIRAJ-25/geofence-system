export interface GeofenceAnalyticsSummary {
  totalGeofences: number;
  activeGeofences: number;
  totalEvents: number;
  todayEvents: number;
  enterCount: number;
  exitCount: number;
  dwellCount: number;
  mostTriggeredGeofence: {
    name: string;
    count: number;
  } | null;
  averageAccuracy: number; // in meters
}

export interface ActivityTrendPoint {
  date: string;
  enterCount: number;
  exitCount: number;
  dwellCount: number;
}

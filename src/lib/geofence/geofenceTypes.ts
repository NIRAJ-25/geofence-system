export * from '@/types/geofence';
export * from '@/types/events';

export interface DistanceResult {
  distanceMeters: number;
  isInside: boolean;
}

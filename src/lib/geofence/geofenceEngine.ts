import { Geofence, GeofenceStatus } from '@/types/geofence';
import { GeofenceEvent } from '@/types/events';
import { LocationCoordinates } from '@/types/location';
import { isPointInsideGeofence } from './distanceCalculator';
import { hardwareGuardService } from '@/lib/hardware/hardwareGuardService';

export interface GeofenceEvaluationResult {
  geofenceId: string;
  geofenceName: string;
  previousStatus: GeofenceStatus;
  currentStatus: GeofenceStatus;
  distanceFromCenter: number;
  eventGenerated?: GeofenceEvent;
  zoneType?: Geofence['zoneType'];
  securityActionTriggered?: string;
  incidentAlertTriggered?: string;
}

export class GeofenceEngine {
  private boundaryToleranceMeters: number = 2.0;

  /**
   * Evaluates all active geofences against user coordinates.
   * Enforces hardware security locks and dispatches incident alerts on transitions.
   */
  public evaluate(
    location: LocationCoordinates,
    geofences: Geofence[]
  ): GeofenceEvaluationResult[] {
    const results: GeofenceEvaluationResult[] = [];
    const timestamp = new Date(location.timestamp).toISOString();

    for (const fence of geofences) {
      if (!fence.enabled) continue;

      const { isInside, distanceMeters } = isPointInsideGeofence(
        location.latitude,
        location.longitude,
        fence.latitude,
        fence.longitude,
        fence.radius,
        this.boundaryToleranceMeters
      );

      const currentStatus: GeofenceStatus = isInside ? 'INSIDE' : 'OUTSIDE';
      const previousStatus: GeofenceStatus = fence.status || 'UNKNOWN';

      let event: GeofenceEvent | undefined;
      let securityAction: string | undefined;
      let incidentAlert: string | undefined;

      // Transition detection
      if (previousStatus === 'OUTSIDE' && currentStatus === 'INSIDE') {
        // 1. Check Security Hardware Policies (Museums, Exam Halls)
        if (
          fence.zoneType === 'SECURITY' &&
          (fence.securityPolicies?.disableCamera || fence.securityPolicies?.disableMicrophone)
        ) {
          hardwareGuardService.enforceLock(
            fence.name,
            fence.securityPolicies.zoneLabel || 'Restricted recording perimeter'
          );
          securityAction = 'Hardware Camera & Microphone Disabled by Policy';
        }

        // 2. Check Incident / Traffic Advisories
        if (fence.zoneType === 'INCIDENT' && fence.incidentDetails) {
          incidentAlert = fence.incidentDetails.headline;
        }

        if (fence.enterNotification) {
          event = {
            id: `event-${Date.now()}-${fence.id}`,
            geofenceId: fence.id,
            geofenceName: fence.name,
            eventType: 'ENTER',
            timestamp,
            latitude: location.latitude,
            longitude: location.longitude,
            distanceFromCenter: distanceMeters,
            accuracy: location.accuracy,
            zoneType: fence.zoneType,
            securityAction,
            incidentAlertDelivered: incidentAlert
          };
        }
      } else if (previousStatus === 'INSIDE' && currentStatus === 'OUTSIDE') {
        // Release security locks upon exiting
        if (fence.zoneType === 'SECURITY') {
          hardwareGuardService.releaseLock();
          securityAction = 'Hardware Camera & Microphone Access Restored';
        }

        if (fence.exitNotification) {
          event = {
            id: `event-${Date.now()}-${fence.id}`,
            geofenceId: fence.id,
            geofenceName: fence.name,
            eventType: 'EXIT',
            timestamp,
            latitude: location.latitude,
            longitude: location.longitude,
            distanceFromCenter: distanceMeters,
            accuracy: location.accuracy,
            zoneType: fence.zoneType,
            securityAction
          };
        }
      }

      results.push({
        geofenceId: fence.id,
        geofenceName: fence.name,
        previousStatus,
        currentStatus,
        distanceFromCenter: distanceMeters,
        eventGenerated: event,
        zoneType: fence.zoneType,
        securityActionTriggered: securityAction,
        incidentAlertTriggered: incidentAlert
      });
    }

    return results;
  }
}

export const geofenceEngine = new GeofenceEngine();

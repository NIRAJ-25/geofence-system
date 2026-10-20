export interface HardwareGuardState {
  isCameraLocked: boolean;
  isMicrophoneLocked: boolean;
  activeRestrictedZone: string | null;
  activeStream: MediaStream | null;
  policyReason: string | null;
}

export type HardwareStateListener = (state: HardwareGuardState) => void;

export class HardwareGuardService {
  private state: HardwareGuardState = {
    isCameraLocked: false,
    isMicrophoneLocked: false,
    activeRestrictedZone: null,
    activeStream: null,
    policyReason: null
  };

  private listeners: HardwareStateListener[] = [];

  public getState(): HardwareGuardState {
    return { ...this.state };
  }

  public subscribe(listener: HardwareStateListener): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((l) => l(currentState));
  }

  /**
   * Enforces immediate hardware disablement for camera and microphone
   * when entering a restricted security geofence (Museum, Exam Hall, R&D Lab).
   */
  public enforceLock(zoneName: string, reason?: string): void {
    // 1. Immediately terminate any active media tracks
    if (this.state.activeStream) {
      this.state.activeStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      this.state.activeStream = null;
    }

    // 2. Set hardware lock state
    this.state.isCameraLocked = true;
    this.state.isMicrophoneLocked = true;
    this.state.activeRestrictedZone = zoneName;
    this.state.policyReason =
      reason || `All camera and audio recording hardware is disabled by policy inside ${zoneName}.`;

    this.notify();
  }

  /**
   * Releases hardware lock when user exits the restricted security geofence.
   */
  public releaseLock(): void {
    this.state.isCameraLocked = false;
    this.state.isMicrophoneLocked = false;
    this.state.activeRestrictedZone = null;
    this.state.policyReason = null;
    this.notify();
  }

  /**
   * Requests a live camera/microphone test stream.
   * If hardware is locked by geofence, request is rejected.
   */
  public async requestTestMedia(withVideo: boolean = true, withAudio: boolean = true): Promise<MediaStream> {
    if (this.state.isCameraLocked || this.state.isMicrophoneLocked) {
      throw new Error(
        `[SECURITY LOCKDOWN ACTIVE] Access Denied: Camera and microphone are disabled inside restricted security perimeter (${this.state.activeRestrictedZone}).`
      );
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('MediaDevices API not supported in this browser environment.');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo,
        audio: withAudio
      });
      this.state.activeStream = stream;
      this.notify();
      return stream;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Permission denied or hardware busy';
      throw new Error(`Media access failed: ${errorMsg}`);
    }
  }

  public stopTestMedia(): void {
    if (this.state.activeStream) {
      this.state.activeStream.getTracks().forEach((track) => track.stop());
      this.state.activeStream = null;
      this.notify();
    }
  }
}

export const hardwareGuardService = new HardwareGuardService();

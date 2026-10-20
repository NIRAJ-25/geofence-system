'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, Camera, Mic, CameraOff, MicOff, Play, Square, AlertOctagon, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hardwareGuardService, HardwareGuardState } from '@/lib/hardware/hardwareGuardService';

export function HardwareSecurityWidget() {
  const [guardState, setGuardState] = useState<HardwareGuardState>(hardwareGuardService.getState());
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const unsubscribe = hardwareGuardService.subscribe((state) => {
      setGuardState(state);
      if (state.isCameraLocked || state.isMicrophoneLocked) {
        setStreamActive(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStartStream = async () => {
    setActionError(null);
    try {
      const stream = await hardwareGuardService.requestTestMedia(true, true);
      setStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media access blocked.';
      setActionError(msg);
      setStreamActive(false);
    }
  };

  const handleStopStream = () => {
    hardwareGuardService.stopTestMedia();
    setStreamActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const isLocked = guardState.isCameraLocked || guardState.isMicrophoneLocked;

  return (
    <Card className={`overflow-hidden transition-colors border-2 ${
      isLocked
        ? 'border-rose-500 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/20'
        : 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/10'
    }`}>
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {isLocked ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm animate-pulse">
                <ShieldAlert className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                Hardware Policy & Security Guard
              </CardTitle>
              <p className="text-xs text-slate-500">
                Automated location-based Camera & Microphone permission enforcement
              </p>
            </div>
          </div>

          <div>
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <AlertOctagon className="h-3.5 w-3.5" />
                HARDWARE RESTRICTED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                MEDIA PERMITTED
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Status indicator row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Camera status */}
          <div className={`flex items-center justify-between rounded-lg p-3 border ${
            guardState.isCameraLocked
              ? 'border-rose-300 bg-rose-100/70 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {guardState.isCameraLocked ? (
                <CameraOff className="h-5 w-5 text-rose-600" />
              ) : (
                <Camera className="h-5 w-5 text-emerald-600" />
              )}
              <div>
                <span className="text-xs font-bold block">Camera Hardware</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {guardState.isCameraLocked ? 'Auto-Disabled by Zone Policy' : 'Available & Unrestricted'}
                </span>
              </div>
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              guardState.isCameraLocked ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-600'
            }`}>
              {guardState.isCameraLocked ? 'LOCKED' : 'ACTIVE'}
            </span>
          </div>

          {/* Microphone status */}
          <div className={`flex items-center justify-between rounded-lg p-3 border ${
            guardState.isMicrophoneLocked
              ? 'border-rose-300 bg-rose-100/70 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {guardState.isMicrophoneLocked ? (
                <MicOff className="h-5 w-5 text-rose-600" />
              ) : (
                <Mic className="h-5 w-5 text-emerald-600" />
              )}
              <div>
                <span className="text-xs font-bold block">Microphone Hardware</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {guardState.isMicrophoneLocked ? 'Auto-Disabled by Zone Policy' : 'Available & Unrestricted'}
                </span>
              </div>
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              guardState.isMicrophoneLocked ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-600'
            }`}>
              {guardState.isMicrophoneLocked ? 'LOCKED' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Policy alert banner if locked */}
        {isLocked && (
          <div className="rounded-xl border border-rose-300 bg-rose-100/80 p-3.5 text-xs text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200 flex items-start gap-2.5">
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Restricted Perimeter Active ({guardState.activeRestrictedZone})</span>
              <p className="text-[11px] opacity-90">{guardState.policyReason}</p>
              <p className="text-[10px] text-rose-700 dark:text-rose-300 italic pt-0.5">
                Note: In academic presentations, demonstrate this feature by entering the Museum or Exam Hall in the simulation controller above.
              </p>
            </div>
          </div>
        )}

        {/* Action Error if user attempted to bypass */}
        {actionError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
            {actionError}
          </div>
        )}

        {/* Live Hardware Stream Test Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-600" />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Interactive Test: Attempt camera/mic feed access to verify policy enforcement.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {streamActive ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStopStream}
                className="text-xs h-8 gap-1.5 w-full sm:w-auto"
              >
                <Square className="h-3.5 w-3.5" />
                Stop Feed
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartStream}
                className="text-xs h-8 gap-1.5 w-full sm:w-auto"
              >
                <Play className="h-3.5 w-3.5" />
                Test Camera & Mic Access
              </Button>
            )}
          </div>
        </div>

        {/* Video preview container when active */}
        {streamActive && (
          <div className="relative rounded-lg overflow-hidden bg-black h-48 w-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white font-mono">
              LIVE CAMERA FEED (UNRESTRICTED)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Geofence, CreateGeofenceInput, UpdateGeofenceInput } from '@/types/geofence';
import { geofenceRepository } from '@/lib/storage/localStorageAdapter';

export function useGeofences() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchGeofences = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await geofenceRepository.getAll();
      setGeofences(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  const addGeofence = async (input: CreateGeofenceInput) => {
    const created = await geofenceRepository.create(input);
    setGeofences((prev) => [created, ...prev]);
    return created;
  };

  const updateGeofence = async (id: string, input: UpdateGeofenceInput) => {
    const updated = await geofenceRepository.update(id, input);
    if (updated) {
      setGeofences((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
    return updated;
  };

  const deleteGeofence = async (id: string) => {
    await geofenceRepository.delete(id);
    setGeofences((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleGeofence = async (id: string, enabled: boolean) => {
    const updated = await geofenceRepository.toggleEnabled(id, enabled);
    if (updated) {
      setGeofences((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  };

  const activeCount = geofences.filter((g) => g.enabled).length;

  return {
    geofences,
    isLoading,
    activeCount,
    totalCount: geofences.length,
    fetchGeofences,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    toggleGeofence
  };
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationCoordinates, LocationErrorState, LocationPermissionState } from '@/types/location';
import { Geofence } from '@/types/geofence';
import { AmenityItem, AmenityCategory } from '@/types/amenity';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Crosshair,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import { formatDistance } from '@/lib/geofence/distanceCalculator';

export interface LeafletMapViewProps {
  location: LocationCoordinates | null;
  geofences: Geofence[];
  amenities?: AmenityItem[];
  selectedGeofenceId?: string;
  onSelectCoordinates?: (lat: number, lng: number) => void;
  onRequestLocation?: () => void;
  onSelectAmenity?: (amenity: AmenityItem) => void;
  heightClass?: string;
  showAmenitiesToggle?: boolean;
  locationError?: LocationErrorState | null;
  locationPermission?: LocationPermissionState;
}

const CATEGORY_COLORS: Record<AmenityCategory, { bg: string; letter: string }> = {
  ALL: { bg: '#6366f1', letter: '★' },
  HOSPITAL: { bg: '#ef4444', letter: 'H' },
  HOTEL: { bg: '#4f46e5', letter: 'H' },
  CAFE: { bg: '#d97706', letter: 'C' },
  GAS_STATION: { bg: '#059669', letter: 'G' },
  EV_CHARGING: { bg: '#10b981', letter: '⚡' },
  MALL: { bg: '#7c3aed', letter: 'M' },
  THEATRE: { bg: '#db2777', letter: 'T' },
  STORE: { bg: '#0891b2', letter: 'S' },
  SUPERMARKET: { bg: '#0284c7', letter: 'S' },
  PHARMACY: { bg: '#14b8a6', letter: 'P' },
  ELECTRONICS: { bg: '#6366f1', letter: 'E' },
  BOOKSTORE: { bg: '#8b5cf6', letter: 'B' },
  FASHION: { bg: '#ec4899', letter: 'F' },
  HARDWARE: { bg: '#f97316', letter: 'W' },
  FLORIST: { bg: '#f43f5e', letter: '🌸' },
  PET_SUPPLIES: { bg: '#eab308', letter: '🐾' },
  SPORTS: { bg: '#84cc16', letter: '⚽' },
  JEWELRY: { bg: '#a855f7', letter: '💎' },
  GOURMET_WINE: { bg: '#991b1b', letter: '🍷' }
};

// Safe div icon generator for user GPS position
function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-gps-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #4f46e5; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

// Safe div icon generator for Geofences
function createGeofenceIcon(fence: Geofence, isSelected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'custom-geofence-marker',
    html: `
      <div style="
        background-color: ${fence.color};
        width: ${isSelected ? '28px' : '22px'};
        height: ${isSelected ? '28px' : '22px'};
        border-radius: 9999px;
        border: ${isSelected ? '3px' : '2px'} solid #ffffff;
        color: #ffffff;
        font-weight: 700;
        font-size: ${isSelected ? '12px' : '10px'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        ${fence.name.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: isSelected ? [28, 28] : [22, 22],
    iconAnchor: isSelected ? [14, 14] : [11, 11],
    popupAnchor: [0, isSelected ? -14 : -11]
  });
}

// Safe div icon generator for OSM Amenities
function createAmenityIcon(item: AmenityItem): L.DivIcon {
  const config = CATEGORY_COLORS[item.category] || { bg: '#4f46e5', letter: 'P' };
  return L.divIcon({
    className: 'custom-amenity-marker',
    html: `
      <div style="
        background-color: ${config.bg};
        width: 26px;
        height: 26px;
        border-radius: 9999px;
        border: 2px solid #ffffff;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.15s ease-in-out;
      " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        ${config.letter}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
}

export function LeafletMapViewInner({
  location,
  geofences,
  amenities = [],
  selectedGeofenceId,
  onSelectCoordinates,
  onRequestLocation,
  onSelectAmenity,
  heightClass = 'h-[440px]',
  showAmenitiesToggle = true,
  locationError,
  locationPermission
}: LeafletMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const geofenceLayersRef = useRef<Map<string, { circle: L.Circle; marker: L.Marker }>>(new Map());
  const amenityMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const hasCenteredInitiallyRef = useRef(false);

  // Stable callback refs
  const onSelectCoordinatesRef = useRef(onSelectCoordinates);
  const onSelectAmenityRef = useRef(onSelectAmenity);
  useEffect(() => {
    onSelectCoordinatesRef.current = onSelectCoordinates;
    onSelectAmenityRef.current = onSelectAmenity;
  });

  const [showAmenitiesOnMap, setShowAmenitiesOnMap] = useState(true);

  // Initialize Map Instance ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = location?.latitude ?? (geofences[0]?.latitude ?? 37.7749);
    const initialLng = location?.longitude ?? (geofences[0]?.longitude ?? -122.4194);
    const initialZoom = location || geofences.length > 0 ? 15 : 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true
    });

    // OpenStreetMap Raster Tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Map Click Listener
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectCoordinatesRef.current) {
        onSelectCoordinatesRef.current(
          parseFloat(e.latlng.lat.toFixed(6)),
          parseFloat(e.latlng.lng.toFixed(6))
        );
      }
    });

    mapInstanceRef.current = map;

    // Invalidate size after initial layout
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Container Resizing
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update User GPS Marker & Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    const map = mapInstanceRef.current;
    const latLng: [number, number] = [location.latitude, location.longitude];

    // Initial pan
    if (!hasCenteredInitiallyRef.current) {
      map.setView(latLng, 15);
      hasCenteredInitiallyRef.current = true;
    }

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a; min-width: 180px;">
        <div style="display: flex; items-center; gap: 4px; font-weight: 700; font-size: 13px; color: #4338ca; margin-bottom: 2px;">
          <span>📍 Your Real GPS Location</span>
        </div>
        <div style="font-size: 11px; font-family: monospace; color: #334155;">
          ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Sensor Accuracy: ±${Math.round(location.accuracy)} meters
        </div>
        <div style="font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 4px;">
          ● Active GPS Fix (${new Date(location.timestamp || Date.now()).toLocaleTimeString()})
        </div>
      </div>
    `;

    // User GPS Marker
    if (!userMarkerRef.current) {
      const marker = L.marker(latLng, {
        icon: createUserIcon(),
        zIndexOffset: 1000
      }).addTo(map);

      marker.bindPopup(popupHtml);
      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLatLng(latLng);
      userMarkerRef.current.setPopupContent(popupHtml);
    }

    // Accuracy Circle
    const accuracyRadius = Math.max(10, location.accuracy || 20);
    if (!userAccuracyCircleRef.current) {
      const circle = L.circle(latLng, {
        radius: accuracyRadius,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
      userAccuracyCircleRef.current = circle;
    } else {
      userAccuracyCircleRef.current.setLatLng(latLng);
      userAccuracyCircleRef.current.setRadius(accuracyRadius);
    }
  }, [location]);

  // Update Geofence Circles & Center Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove deleted geofences
    geofenceLayersRef.current.forEach((layers, id) => {
      if (!geofences.some((g) => g.id === id)) {
        layers.circle.remove();
        layers.marker.remove();
        geofenceLayersRef.current.delete(id);
      }
    });

    // Add or update geofences
    geofences.forEach((fence) => {
      const isSelected = selectedGeofenceId === fence.id;
      const center: [number, number] = [fence.latitude, fence.longitude];
      const existing = geofenceLayersRef.current.get(fence.id);

      if (!existing) {
        const circle = L.circle(center, {
          radius: fence.radius,
          color: fence.color,
          fillColor: fence.color,
          fillOpacity: 0.22,
          weight: isSelected ? 3 : 2
        });

        const marker = L.marker(center, {
          icon: createGeofenceIcon(fence, isSelected),
          zIndexOffset: 500
        });

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a; max-width: 220px;">
            <h4 style="font-weight: 700; margin: 0 0 4px 0; font-size: 13px;">${fence.name}</h4>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Radius: ${fence.radius}m</div>
            <div style="display: flex; gap: 4px; margin-top: 4px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${
                fence.status === 'INSIDE' ? '#dcfce7' : '#f1f5f9'
              }; color: ${fence.status === 'INSIDE' ? '#15803d' : '#475569'};">
                ${fence.status}
              </span>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #e0e7ff; color: #3730a3;">
                ${fence.zoneType}
              </span>
            </div>
          </div>
        `);

        if (fence.enabled) {
          circle.addTo(map);
          marker.addTo(map);
        }

        geofenceLayersRef.current.set(fence.id, { circle, marker });
      } else {
        existing.circle.setLatLng(center);
        existing.circle.setRadius(fence.radius);
        existing.circle.setStyle({
          color: fence.color,
          fillColor: fence.color,
          weight: isSelected ? 3 : 2
        });

        existing.marker.setLatLng(center);
        existing.marker.setIcon(createGeofenceIcon(fence, isSelected));

        if (fence.enabled) {
          if (!map.hasLayer(existing.circle)) existing.circle.addTo(map);
          if (!map.hasLayer(existing.marker)) existing.marker.addTo(map);
        } else {
          existing.circle.remove();
          existing.marker.remove();
        }
      }
    });
  }, [geofences, selectedGeofenceId]);

  // Update Amenity Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove deleted or toggled-off amenities
    amenityMarkersRef.current.forEach((marker, id) => {
      if (!showAmenitiesOnMap || !amenities.some((a) => a.id === id)) {
        marker.remove();
        amenityMarkersRef.current.delete(id);
      }
    });

    if (!showAmenitiesOnMap) return;

    amenities.forEach((item) => {
      const pos: [number, number] = [item.latitude, item.longitude];
      let marker = amenityMarkersRef.current.get(item.id);

      if (!marker) {
        marker = L.marker(pos, {
          icon: createAmenityIcon(item),
          zIndexOffset: 300
        }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 6px; max-width: 240px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">
                ${item.category.replace('_', ' ')}
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">
                OSM Verified
              </span>
            </div>
            <h4 style="font-weight: 700; font-size: 13px; margin: 0 0 2px 0; color: #0f172a;">${item.name}</h4>
            <p style="font-size: 11px; color: #4338ca; font-weight: 500; margin: 0 0 4px 0;">${item.subCategory}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${item.address}</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              <span style="color: ${item.isOpen ? '#16a34a' : '#94a3b8'};">${item.isOpen ? 'Open Now' : 'Closed'}</span>
              <span style="color: #475569;">${formatDistance(item.distanceMeters)}</span>
            </div>
            <div style="margin-top: 6px; padding: 5px; background: #f8fafc; border-radius: 4px; font-size: 10px; color: #334155; line-height: 1.3;">
              <strong>Manners:</strong> ${item.mannerEtiquette}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectAmenityRef.current) {
            onSelectAmenityRef.current(item);
          }
        });

        amenityMarkersRef.current.set(item.id, marker);
      } else {
        marker.setLatLng(pos);
      }
    });
  }, [amenities, showAmenitiesOnMap]);

  // Center on GPS function
  const handleCenterOnLocation = () => {
    if (onRequestLocation) {
      onRequestLocation();
    }
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setView([location.latitude, location.longitude], 16, {
        animate: true
      });
    }
  };

  const isPermDenied = locationPermission === 'denied' || locationError?.type === 'PERMISSION_DENIED';
  const isLocUnavailable = !location || locationError?.type === 'POSITION_UNAVAILABLE';

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-base font-semibold">OpenStreetMap Interactive Canvas</CardTitle>
          <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Leaflet + OSM Live
          </span>

          {isPermDenied && (
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              Location permission denied
            </span>
          )}
          {isLocUnavailable && !isPermDenied && (
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Awaiting GPS fix...
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showAmenitiesToggle && amenities.length > 0 && (
            <button
              onClick={() => setShowAmenitiesOnMap(!showAmenitiesOnMap)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                showAmenitiesOnMap
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{showAmenitiesOnMap ? `Pins On (${amenities.length})` : 'Show Amenities'}</span>
            </button>
          )}

          <Button variant="outline" size="sm" onClick={handleCenterOnLocation} className="text-xs h-8">
            <Crosshair className="h-3.5 w-3.5 mr-1 text-indigo-600" />
            Center Fix
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />
      </CardContent>
    </Card>
  );
}

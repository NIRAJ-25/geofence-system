'use client';

import React, { useState } from 'react';
import {
  Building2,
  Coffee,
  Hospital,
  Fuel,
  Zap,
  ShoppingBag,
  Film,
  Store,
  ShoppingCart,
  Pill,
  Laptop,
  BookOpen,
  Shirt,
  Wrench,
  Flower2,
  Dog,
  Trophy,
  Gem,
  Wine,
  Sparkles,
  Search,
  MapPin,
  ArrowUpDown,
  RefreshCw,
  Eye,
  AlertCircle,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AmenityCategory, AmenityItem } from '@/types/amenity';
import { LocationCoordinates } from '@/types/location';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { useLocation } from '@/hooks/useLocation';
import { formatDistance } from '@/lib/geofence/distanceCalculator';
import { AmenityDetailModal } from './AmenityDetailModal';

interface LocalAmenitiesDirectoryProps {
  location?: LocationCoordinates | null;
  onLocateOnMap?: (lat: number, lng: number) => void;
  onPlacesChange?: (places: AmenityItem[]) => void;
  initialCategory?: AmenityCategory;
  overrideCenter?: { latitude: number; longitude: number } | null;
}

interface CategoryTabItem {
  label: string;
  value: AmenityCategory;
  icon: React.ElementType;
}

const ALL_CATEGORY_TABS: CategoryTabItem[] = [
  { label: 'All Places', value: 'ALL', icon: Sparkles },
  { label: 'Hospitals', value: 'HOSPITAL', icon: Hospital },
  { label: 'Cafes', value: 'CAFE', icon: Coffee },
  { label: 'Hotels', value: 'HOTEL', icon: Building2 },
  { label: 'Gas Stations', value: 'GAS_STATION', icon: Fuel },
  { label: 'EV Charging', value: 'EV_CHARGING', icon: Zap },
  { label: 'Malls', value: 'MALL', icon: ShoppingBag },
  { label: 'Theatres', value: 'THEATRE', icon: Film },
  { label: 'Stores', value: 'STORE', icon: Store },
  { label: 'Supermarkets', value: 'SUPERMARKET', icon: ShoppingCart },
  { label: 'Pharmacies', value: 'PHARMACY', icon: Pill },
  { label: 'Electronics', value: 'ELECTRONICS', icon: Laptop },
  { label: 'Bookstores', value: 'BOOKSTORE', icon: BookOpen },
  { label: 'Fashion', value: 'FASHION', icon: Shirt },
  { label: 'Hardware', value: 'HARDWARE', icon: Wrench },
  { label: 'Florists', value: 'FLORIST', icon: Flower2 },
  { label: 'Pet Supplies', value: 'PET_SUPPLIES', icon: Dog },
  { label: 'Sports', value: 'SPORTS', icon: Trophy },
  { label: 'Jewelry', value: 'JEWELRY', icon: Gem },
  { label: 'Wine & Gourmet', value: 'GOURMET_WINE', icon: Wine }
];

const RADIUS_OPTIONS = [500, 1000, 2000, 5000];

export function LocalAmenitiesDirectory({
  onLocateOnMap,
  onPlacesChange,
  initialCategory = 'ALL',
  overrideCenter
}: LocalAmenitiesDirectoryProps) {
  const [selectedAmenityForModal, setSelectedAmenityForModal] = useState<AmenityItem | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const showCoordinatesOnCards = true;

  const { isAcquiring, isStale, lastUpdateTimestamp, status: locStatus } = useLocation();

  const {
    places,
    isLoading,
    error,
    searchMetadata,
    centerLatitude,
    centerLongitude,
    gpsAccuracy,
    radiusMeters,
    setRadiusMeters,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    openOnly,
    setOpenOnly,
    sortBy,
    setSortBy,
    refetch
  } = useNearbyPlaces({
    initialCategory,
    overrideCenter
  });

  // Notify parent of updated real places for map rendering
  React.useEffect(() => {
    if (onPlacesChange) {
      onPlacesChange(places);
    }
  }, [places, onPlacesChange]);

  const activeCategoryDef = ALL_CATEGORY_TABS.find((t) => t.value === category) || ALL_CATEGORY_TABS[0];

  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Local Amenities & Stores Directory
                </CardTitle>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  OpenStreetMap + Overpass Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real establishments queried from live OpenStreetMap data around your exact GPS coordinates. Strict circular Haversine radius validation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="text-xs h-8 gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Places
              </Button>

              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-600" />
                <span>GPS Telemetry</span>
                {showTelemetry ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {places.length} Real Places Found
              </span>
            </div>
          </div>

          {/* TELEMETRY & DEBUG AUDIT PANEL */}
          {showTelemetry && (
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-3.5 font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  OPENSTREETMAP GPS TELEMETRY
                </span>
                <span className="text-[10px] text-slate-400">
                  {searchMetadata?.provider || 'OpenStreetMap (Overpass API)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">GPS Latitude</span>
                  <span className="font-bold text-white">
                    {centerLatitude !== null ? centerLatitude.toFixed(6) : 'Awaiting GPS'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">GPS Longitude</span>
                  <span className="font-bold text-white">
                    {centerLongitude !== null ? centerLongitude.toFixed(6) : 'Awaiting GPS'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">GPS Accuracy</span>
                  <span className="font-bold text-indigo-400">
                    {centerLatitude !== null ? `±${Math.round(gpsAccuracy)}m` : 'N/A'}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Search Radius</span>
                  <span className="font-bold text-amber-400">{radiusMeters}m</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">GPS Signal State</span>
                  <span className="font-bold text-emerald-400">
                    {isAcquiring ? 'Acquiring...' : isStale ? 'Stale' : locStatus}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block">Places Verified</span>
                  <span className="font-bold text-emerald-400">
                    {places.length} (≤ {radiusMeters}m)
                  </span>
                </div>
              </div>

              {lastUpdateTimestamp && (
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-1.5">
                  <span>Last GPS Sensor Fix: {new Date(lastUpdateTimestamp).toLocaleTimeString()}</span>
                  <span>Center: {centerLatitude?.toFixed(4)}, {centerLongitude?.toFixed(4)}</span>
                </div>
              )}
            </div>
          )}

          {/* All 20 Category Filter Tabs */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {ALL_CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = category === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setCategory(tab.value)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Radius, Open Now, and Sort Controls */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCategoryDef.label.toLowerCase()} by name or keyword...`}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-2 md:col-span-3">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">Radius:</span>
              <div className="flex items-center gap-1">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusMeters(r)}
                    className={`rounded px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                      radiusMeters === r
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Open Now Toggle & Sort */}
            <div className="flex items-center justify-between md:justify-end gap-3 md:col-span-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(e) => setOpenOnly(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Open Now</span>
              </label>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'DISTANCE' | 'RATING' | 'NAME')}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="DISTANCE">Nearest First</option>
                  <option value="NAME">Name (A-Z)</option>
                  <option value="RATING">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {/* ERROR STATE */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-5 text-center dark:border-rose-900/60 dark:bg-rose-950/40 my-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6 text-rose-600" />
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Nearby places could not be loaded
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 max-w-lg">
                  {error}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2 text-xs">
                  Retry Search
                </Button>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && !error && (
            <div className="py-16 text-center text-xs text-slate-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
              <span>Querying OpenStreetMap data around your current GPS coordinates...</span>
            </div>
          )}

          {/* EMPTY RESULTS (ZERO_RESULTS) */}
          {!isLoading && !error && places.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              <MapPin className="h-6 w-6 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">
                No {activeCategoryDef.label.toLowerCase()} found within {radiusMeters}m of your coordinates.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try selecting &quot;All Places&quot;, expanding the radius to 2km or 5km, or clearing your keyword filter.
              </p>
            </div>
          )}

          {/* REAL VERIFIED PLACES GRID */}
          {!isLoading && !error && places.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    {/* Top Meta: Category, Distance Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-300">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {formatDistance(item.distanceMeters)}
                        </span>
                      </div>

                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        OSM Verified
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.subCategory}
                    </p>

                    {/* Address & Timings */}
                    <div className="mt-3 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span
                          className={`font-semibold ${
                            item.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {item.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    {/* PLACE COORDINATES & DISTANCE VERIFICATION */}
                    {showCoordinatesOnCards && (
                      <div className="mt-2.5 rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">GPS Coords:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-slate-400">Distance:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatDistance(item.distanceMeters)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-600 border border-slate-100 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                    <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {formatDistance(item.distanceMeters)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onLocateOnMap && (
                        <button
                          onClick={() => onLocateOnMap(item.latitude, item.longitude)}
                          className="rounded px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Pin
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAmenityForModal(item)}
                        className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenity Detail Dossier Modal */}
      <AmenityDetailModal
        amenity={selectedAmenityForModal}
        onClose={() => setSelectedAmenityForModal(null)}
        onLocateOnMap={onLocateOnMap}
      />
    </>
  );
}

'use client';

import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Star,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Wifi,
  Car,
  CreditCard,
  Accessibility,
  Zap,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { AmenityItem } from '@/types/amenity';
import { Button } from '@/components/ui/Button';

interface AmenityDetailModalProps {
  amenity: AmenityItem | null;
  onClose: () => void;
  onLocateOnMap?: (lat: number, lng: number) => void;
}

export function AmenityDetailModal({
  amenity,
  onClose,
  onLocateOnMap
}: AmenityDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!amenity) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(amenity.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${amenity.latitude}%2C${amenity.longitude}`;
  const osmExploreUrl = `https://www.openstreetmap.org/?mlat=${amenity.latitude}&mlon=${amenity.longitude}#map=18/${amenity.latitude}/${amenity.longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Banner */}
        <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase text-indigo-300 border border-indigo-400/30">
              {amenity.category.replace('_', ' ')}
            </span>
            {amenity.storeVariety && (
              <span className="rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase text-emerald-300 border border-emerald-400/30">
                {amenity.storeVariety.replace('_', ' ')}
              </span>
            )}
            {amenity.priceLevel && (
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-300 border border-amber-400/30">
                {amenity.priceLevel}
              </span>
            )}
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                amenity.isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}
            >
              {amenity.isOpen ? '● Open Now' : '○ Closed'}
            </span>
          </div>

          <h3 id="modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {amenity.name}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200 font-medium">
            {amenity.subCategory}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            {amenity.rating > 0 ? (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{amenity.rating}</span>
                {amenity.reviewsCount && (
                  <span className="text-slate-400 font-normal">
                    ({amenity.reviewsCount.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            ) : (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                OSM Community Verified
              </span>
            )}
            {amenity.distanceMeters !== undefined && (
              <div className="font-mono text-indigo-300 font-semibold">
                ~{amenity.distanceMeters > 1000
                  ? `${(amenity.distanceMeters / 1000).toFixed(1)} km`
                  : `${amenity.distanceMeters} m`}{' '}
                from your coordinates
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
          {/* Curated Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              About This Establishment
            </h4>
            <p className="leading-relaxed text-slate-800 dark:text-slate-200">
              {amenity.curatedDescription}
            </p>
          </div>

          {/* MANNERED VISITOR ETIQUETTE — HIGHLIGHT OF THE SYSTEM */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/40">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-200">
              <HeartHandshake className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                Civic Etiquette & House Manners
              </h4>
            </div>
            <p className="text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
              {amenity.mannerEtiquette}
            </p>
          </div>

          {/* Address & Direct Actions */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Physical Address
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {amenity.address}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>

                <a
                  href={osmDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>OSM Directions</span>
                </a>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                <strong>Hours: </strong>
                {amenity.timings}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {amenity.phone && (
              <a
                href={`tel:${amenity.phone}`}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">
                    Direct Phone Line
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {amenity.phone}
                  </span>
                </div>
              </a>
            )}

            {amenity.website && (
              <a
                href={amenity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">
                    Official Website
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    Visit Portal <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            )}
          </div>

          {/* Featured Services & Offerings */}
          {amenity.featuredServices && amenity.featuredServices.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Available Services & Departments
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {amenity.featuredServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs font-medium text-slate-800 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facility Highlights Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Facility Accessibility & Amenities
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {amenity.amenityHighlights.wheelchairAccessible && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Accessibility className="h-3.5 w-3.5 text-indigo-600" />
                  Wheelchair Accessible
                </span>
              )}
              {amenity.amenityHighlights.wifi && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Wifi className="h-3.5 w-3.5 text-indigo-600" />
                  Free Wi-Fi
                </span>
              )}
              {amenity.amenityHighlights.parking && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Car className="h-3.5 w-3.5 text-indigo-600" />
                  Parking Available
                </span>
              )}
              {amenity.amenityHighlights.cardPayment && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                  Contactless / Card Pay
                </span>
              )}
              {amenity.amenityHighlights.evCharging && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  EV Fast Charging
                </span>
              )}
              {amenity.amenityHighlights.petFriendly && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Pet Friendly
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Dossier
          </Button>

          {onLocateOnMap && (
            <Button
              size="sm"
              onClick={() => {
                onLocateOnMap(amenity.latitude, amenity.longitude);
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              Focus on Live Map
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

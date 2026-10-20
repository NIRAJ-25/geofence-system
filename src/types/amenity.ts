export type AmenityCategory =
  | 'ALL'
  | 'HOSPITAL'
  | 'CAFE'
  | 'HOTEL'
  | 'GAS_STATION'
  | 'EV_CHARGING'
  | 'MALL'
  | 'THEATRE'
  | 'STORE'
  | 'SUPERMARKET'
  | 'PHARMACY'
  | 'ELECTRONICS'
  | 'BOOKSTORE'
  | 'FASHION'
  | 'HARDWARE'
  | 'FLORIST'
  | 'PET_SUPPLIES'
  | 'SPORTS'
  | 'JEWELRY'
  | 'GOURMET_WINE';

export type StoreVarietyType =
  | 'ALL_STORES'
  | 'SUPERMARKET'
  | 'PHARMACY'
  | 'ELECTRONICS'
  | 'BOOKSTORE'
  | 'FASHION'
  | 'HARDWARE'
  | 'FLORIST'
  | 'PET_SUPPLIES'
  | 'SPORTING_GOODS'
  | 'JEWELRY'
  | 'TOY_STORE'
  | 'GOURMET_WINE'
  | 'OTHER';

export interface AmenityHighlights {
  wheelchairAccessible: boolean;
  wifi: boolean;
  parking: boolean;
  cardPayment: boolean;
  restrooms?: boolean;
  petFriendly?: boolean;
  evCharging?: boolean;
  takeOut?: boolean;
  outdoorSeating?: boolean;
  emergencyHotline?: boolean;
}

export interface AmenityItem {
  id: string;
  name: string;
  category: AmenityCategory;
  categories?: AmenityCategory[]; // Supports multiple categories per establishment
  subCategory: string; // e.g. "Specialty Coffee", "Trauma Center", "EV Supercharger"
  storeVariety?: StoreVarietyType; // Specific store variety for categorized shopping
  rating: number; // e.g. 4.8
  reviewsCount?: number; // e.g. 1240
  priceLevel?: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  isOpen: boolean;
  phone?: string;
  email?: string;
  website?: string;
  timings?: string; // e.g. "Open 24/7", "8:00 AM - 10:00 PM"
  curatedDescription: string;
  tags: string[];
  amenityHighlights: AmenityHighlights;
  
  /**
   * Mannerly visitor etiquette & civic guidelines for this specific establishment
   * (e.g. noise levels, queueing etiquette, ICU visiting rules, phone silence in theatres)
   */
  mannerEtiquette: string;

  /**
   * Primary services or featured departments available at this location
   */
  featuredServices?: string[];
}

export interface AmenityFilter {
  category?: AmenityCategory | 'ALL';
  storeVariety?: StoreVarietyType;
  search?: string;
  openOnly?: boolean;
  maxDistanceMeters?: number;
  minRating?: number;
  sortBy?: 'DISTANCE' | 'RATING' | 'NAME';
}


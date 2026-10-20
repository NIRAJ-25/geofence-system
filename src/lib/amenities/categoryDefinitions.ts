/**
 * Centralized Category Definitions and OpenStreetMap Tag Registry
 * Implements a unified, robust categorization system across the entire application.
 */

export type CategoryId =
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

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  iconName: string;
  osmOverpassTargets: { key: string; val: string }[];
  matches: (tags: Record<string, string>) => boolean;
  getSubCategory: (tags: Record<string, string>) => string;
}

function humanize(str?: string): string {
  if (!str) return 'Establishment';
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const CATEGORY_DEFINITIONS: Record<CategoryId, CategoryDefinition> = {
  ALL: {
    id: 'ALL',
    label: 'All Places',
    iconName: 'Sparkles',
    osmOverpassTargets: [],
    matches: () => true,
    getSubCategory: (tags) => {
      return (
        humanize(tags.amenity) ||
        humanize(tags.shop) ||
        humanize(tags.tourism) ||
        humanize(tags.leisure) ||
        'Local Venue'
      );
    }
  },

  HOSPITAL: {
    id: 'HOSPITAL',
    label: 'Hospitals & Medical',
    iconName: 'Hospital',
    osmOverpassTargets: [
      { key: 'amenity', val: 'hospital' },
      { key: 'amenity', val: 'clinic' },
      { key: 'amenity', val: 'doctors' },
      { key: 'healthcare', val: 'hospital' },
      { key: 'healthcare', val: 'clinic' },
      { key: 'healthcare', val: 'centre' },
      { key: 'healthcare', val: 'doctor' }
    ],
    matches: (tags) => {
      const a = (tags.amenity || '').toLowerCase();
      const h = (tags.healthcare || '').toLowerCase();
      return (
        a === 'hospital' ||
        a === 'clinic' ||
        a === 'doctors' ||
        a === 'health_centre' ||
        h === 'hospital' ||
        h === 'clinic' ||
        h === 'centre' ||
        h === 'doctor'
      );
    },
    getSubCategory: (tags) => humanize(tags.healthcare || tags.amenity || 'Hospital')
  },

  CAFE: {
    id: 'CAFE',
    label: 'Cafes & Dining',
    iconName: 'Coffee',
    osmOverpassTargets: [
      { key: 'amenity', val: 'cafe' },
      { key: 'amenity', val: 'restaurant' },
      { key: 'amenity', val: 'fast_food' },
      { key: 'amenity', val: 'bakery' },
      { key: 'amenity', val: 'bar' },
      { key: 'amenity', val: 'pub' },
      { key: 'amenity', val: 'bistro' },
      { key: 'amenity', val: 'ice_cream' }
    ],
    matches: (tags) => {
      const a = (tags.amenity || '').toLowerCase();
      const c = (tags.cuisine || '').toLowerCase();
      return (
        a === 'cafe' ||
        a === 'restaurant' ||
        a === 'fast_food' ||
        a === 'bakery' ||
        a === 'bar' ||
        a === 'pub' ||
        a === 'bistro' ||
        a === 'ice_cream' ||
        c.includes('coffee')
      );
    },
    getSubCategory: (tags) => {
      if (tags.cuisine) return humanize(tags.cuisine) + ' Dining';
      return humanize(tags.amenity || 'Cafe');
    }
  },

  HOTEL: {
    id: 'HOTEL',
    label: 'Hotels & Lodging',
    iconName: 'Building2',
    osmOverpassTargets: [
      { key: 'tourism', val: 'hotel' },
      { key: 'tourism', val: 'motel' },
      { key: 'tourism', val: 'guest_house' },
      { key: 'tourism', val: 'hostel' },
      { key: 'tourism', val: 'apartment' },
      { key: 'tourism', val: 'bed_and_breakfast' },
      { key: 'tourism', val: 'resort' }
    ],
    matches: (tags) => {
      const t = (tags.tourism || '').toLowerCase();
      return (
        t === 'hotel' ||
        t === 'motel' ||
        t === 'guest_house' ||
        t === 'hostel' ||
        t === 'apartment' ||
        t === 'bed_and_breakfast' ||
        t === 'resort'
      );
    },
    getSubCategory: (tags) => humanize(tags.tourism || 'Hotel')
  },

  GAS_STATION: {
    id: 'GAS_STATION',
    label: 'Gas Stations',
    iconName: 'Fuel',
    osmOverpassTargets: [
      { key: 'amenity', val: 'fuel' }
    ],
    matches: (tags) => {
      return (tags.amenity || '').toLowerCase() === 'fuel';
    },
    getSubCategory: () => 'Fuel & Service Hub'
  },

  EV_CHARGING: {
    id: 'EV_CHARGING',
    label: 'EV Charging Stations',
    iconName: 'Zap',
    osmOverpassTargets: [
      { key: 'amenity', val: 'charging_station' }
    ],
    matches: (tags) => {
      const a = (tags.amenity || '').toLowerCase();
      const cs = (tags.charging_station || '').toLowerCase();
      const fe = (tags['fuel:electricity'] || '').toLowerCase();
      return (
        a === 'charging_station' ||
        cs === 'yes' ||
        fe === 'yes' ||
        Object.keys(tags).some((k) => k.startsWith('socket:'))
      );
    },
    getSubCategory: () => 'EV Supercharger'
  },

  MALL: {
    id: 'MALL',
    label: 'Malls & Plazas',
    iconName: 'ShoppingBag',
    osmOverpassTargets: [
      { key: 'shop', val: 'mall' },
      { key: 'shop', val: 'department_store' },
      { key: 'amenity', val: 'marketplace' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      const a = (tags.amenity || '').toLowerCase();
      return s === 'mall' || s === 'department_store' || a === 'marketplace';
    },
    getSubCategory: (tags) => humanize(tags.shop || tags.amenity || 'Shopping Mall')
  },

  THEATRE: {
    id: 'THEATRE',
    label: 'Theatres & Cinema',
    iconName: 'Film',
    osmOverpassTargets: [
      { key: 'amenity', val: 'theatre' },
      { key: 'amenity', val: 'cinema' },
      { key: 'amenity', val: 'arts_centre' },
      { key: 'leisure', val: 'theatre' },
      { key: 'leisure', val: 'cinema' }
    ],
    matches: (tags) => {
      const a = (tags.amenity || '').toLowerCase();
      const l = (tags.leisure || '').toLowerCase();
      return a === 'theatre' || a === 'cinema' || a === 'arts_centre' || l === 'theatre' || l === 'cinema';
    },
    getSubCategory: (tags) => humanize(tags.amenity || tags.leisure || 'Theatre')
  },

  STORE: {
    id: 'STORE',
    label: 'Stores (All)',
    iconName: 'Store',
    osmOverpassTargets: [
      { key: 'shop', val: '*' }
    ],
    matches: (tags) => {
      return (
        Boolean(tags.shop) ||
        (tags.amenity || '').toLowerCase() === 'pharmacy' ||
        (tags.amenity || '').toLowerCase() === 'marketplace'
      );
    },
    getSubCategory: (tags) => (tags.shop ? humanize(tags.shop) + ' Store' : 'Local Store')
  },

  SUPERMARKET: {
    id: 'SUPERMARKET',
    label: 'Supermarkets',
    iconName: 'ShoppingCart',
    osmOverpassTargets: [
      { key: 'shop', val: 'supermarket' },
      { key: 'shop', val: 'convenience' },
      { key: 'shop', val: 'grocery' },
      { key: 'shop', val: 'general' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return s === 'supermarket' || s === 'convenience' || s === 'grocery' || s === 'general';
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Supermarket')
  },

  PHARMACY: {
    id: 'PHARMACY',
    label: 'Pharmacies',
    iconName: 'Pill',
    osmOverpassTargets: [
      { key: 'amenity', val: 'pharmacy' },
      { key: 'shop', val: 'chemist' },
      { key: 'shop', val: 'medical_supply' },
      { key: 'healthcare', val: 'pharmacy' }
    ],
    matches: (tags) => {
      const a = (tags.amenity || '').toLowerCase();
      const s = (tags.shop || '').toLowerCase();
      const h = (tags.healthcare || '').toLowerCase();
      return a === 'pharmacy' || s === 'chemist' || s === 'medical_supply' || h === 'pharmacy';
    },
    getSubCategory: () => 'Pharmacy & Health'
  },

  ELECTRONICS: {
    id: 'ELECTRONICS',
    label: 'Electronics',
    iconName: 'Laptop',
    osmOverpassTargets: [
      { key: 'shop', val: 'electronics' },
      { key: 'shop', val: 'computer' },
      { key: 'shop', val: 'mobile_phone' },
      { key: 'shop', val: 'hifi' },
      { key: 'shop', val: 'telecommunication' },
      { key: 'shop', val: 'appliance' },
      { key: 'shop', val: 'video_games' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return (
        s === 'electronics' ||
        s === 'computer' ||
        s === 'mobile_phone' ||
        s === 'hifi' ||
        s === 'telecommunication' ||
        s === 'appliance' ||
        s === 'video_games'
      );
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Electronics')
  },

  BOOKSTORE: {
    id: 'BOOKSTORE',
    label: 'Bookstores',
    iconName: 'BookOpen',
    osmOverpassTargets: [
      { key: 'shop', val: 'books' },
      { key: 'shop', val: 'stationery' },
      { key: 'shop', val: 'newsagent' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return s === 'books' || s === 'stationery' || s === 'newsagent';
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Bookstore')
  },

  FASHION: {
    id: 'FASHION',
    label: 'Fashion & Apparel',
    iconName: 'Shirt',
    osmOverpassTargets: [
      { key: 'shop', val: 'clothes' },
      { key: 'shop', val: 'shoes' },
      { key: 'shop', val: 'boutique' },
      { key: 'shop', val: 'fashion' },
      { key: 'shop', val: 'tailor' },
      { key: 'shop', val: 'bags' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return (
        s === 'clothes' ||
        s === 'shoes' ||
        s === 'boutique' ||
        s === 'fashion' ||
        s === 'tailor' ||
        s === 'bags'
      );
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Fashion')
  },

  HARDWARE: {
    id: 'HARDWARE',
    label: 'Hardware & DIY',
    iconName: 'Wrench',
    osmOverpassTargets: [
      { key: 'shop', val: 'hardware' },
      { key: 'shop', val: 'doityourself' },
      { key: 'shop', val: 'trade' },
      { key: 'shop', val: 'building_materials' },
      { key: 'shop', val: 'paint' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return (
        s === 'hardware' ||
        s === 'doityourself' ||
        s === 'trade' ||
        s === 'building_materials' ||
        s === 'paint'
      );
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Hardware')
  },

  FLORIST: {
    id: 'FLORIST',
    label: 'Florists & Plants',
    iconName: 'Flower2',
    osmOverpassTargets: [
      { key: 'shop', val: 'florist' },
      { key: 'shop', val: 'garden_centre' },
      { key: 'shop', val: 'plants' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return s === 'florist' || s === 'garden_centre' || s === 'plants';
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Florist')
  },

  PET_SUPPLIES: {
    id: 'PET_SUPPLIES',
    label: 'Pet Supplies',
    iconName: 'Dog',
    osmOverpassTargets: [
      { key: 'shop', val: 'pet' },
      { key: 'shop', val: 'pet_grooming' },
      { key: 'amenity', val: 'veterinary' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      const a = (tags.amenity || '').toLowerCase();
      return s === 'pet' || s === 'pet_grooming' || a === 'veterinary';
    },
    getSubCategory: (tags) => humanize(tags.shop || tags.amenity || 'Pet Supplies')
  },

  SPORTS: {
    id: 'SPORTS',
    label: 'Sports & Outdoors',
    iconName: 'Trophy',
    osmOverpassTargets: [
      { key: 'shop', val: 'sports' },
      { key: 'shop', val: 'outdoor' },
      { key: 'shop', val: 'bicycle' },
      { key: 'leisure', val: 'sports_centre' },
      { key: 'leisure', val: 'fitness_centre' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      const l = (tags.leisure || '').toLowerCase();
      return (
        s === 'sports' ||
        s === 'outdoor' ||
        s === 'bicycle' ||
        l === 'sports_centre' ||
        l === 'fitness_centre'
      );
    },
    getSubCategory: (tags) => humanize(tags.shop || tags.leisure || 'Sports')
  },

  JEWELRY: {
    id: 'JEWELRY',
    label: 'Jewelry & Watches',
    iconName: 'Gem',
    osmOverpassTargets: [
      { key: 'shop', val: 'jewelry' },
      { key: 'shop', val: 'watches' },
      { key: 'shop', val: 'goldsmith' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return s === 'jewelry' || s === 'watches' || s === 'goldsmith';
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Jewelry')
  },

  GOURMET_WINE: {
    id: 'GOURMET_WINE',
    label: 'Wine & Gourmet',
    iconName: 'Wine',
    osmOverpassTargets: [
      { key: 'shop', val: 'alcohol' },
      { key: 'shop', val: 'wine' },
      { key: 'shop', val: 'beverages' },
      { key: 'shop', val: 'beer' },
      { key: 'shop', val: 'deli' },
      { key: 'shop', val: 'cheese' },
      { key: 'shop', val: 'confectionery' },
      { key: 'shop', val: 'tea' }
    ],
    matches: (tags) => {
      const s = (tags.shop || '').toLowerCase();
      return (
        s === 'alcohol' ||
        s === 'wine' ||
        s === 'beverages' ||
        s === 'beer' ||
        s === 'deli' ||
        s === 'cheese' ||
        s === 'confectionery' ||
        s === 'tea'
      );
    },
    getSubCategory: (tags) => humanize(tags.shop || 'Wine & Gourmet')
  }
};

/**
 * Ordered list of all 20 required categories for UI buttons and tabs
 */
export const ALL_CATEGORY_IDS: CategoryId[] = [
  'ALL',
  'HOSPITAL',
  'CAFE',
  'HOTEL',
  'GAS_STATION',
  'EV_CHARGING',
  'MALL',
  'THEATRE',
  'STORE',
  'SUPERMARKET',
  'PHARMACY',
  'ELECTRONICS',
  'BOOKSTORE',
  'FASHION',
  'HARDWARE',
  'FLORIST',
  'PET_SUPPLIES',
  'SPORTS',
  'JEWELRY',
  'GOURMET_WINE'
];

/**
 * Matches a set of OpenStreetMap tags against all defined categories.
 * Returns an array of ALL matching CategoryId values.
 */
export function matchOsmTagsToCategories(tags: Record<string, string>): CategoryId[] {
  const matched: CategoryId[] = [];

  for (const catId of ALL_CATEGORY_IDS) {
    if (catId === 'ALL') continue;
    const def = CATEGORY_DEFINITIONS[catId];
    if (def.matches(tags)) {
      matched.push(catId);
    }
  }

  // If matched a specific store variety, also add 'STORE'
  const storeSubcategories: CategoryId[] = [
    'SUPERMARKET',
    'PHARMACY',
    'ELECTRONICS',
    'BOOKSTORE',
    'FASHION',
    'HARDWARE',
    'FLORIST',
    'PET_SUPPLIES',
    'SPORTS',
    'JEWELRY',
    'GOURMET_WINE'
  ];

  if (matched.some((c) => storeSubcategories.includes(c)) && !matched.includes('STORE')) {
    matched.push('STORE');
  }

  // If a place has shop tag but didn't match any specific category, it is at least STORE
  if (tags.shop && !matched.includes('STORE')) {
    matched.push('STORE');
  }

  return matched;
}

/**
 * Derives the primary category and subcategory string for display
 */
export function getPrimaryCategory(
  tags: Record<string, string>,
  preferredCategory?: CategoryId
): { primaryCategory: CategoryId; allCategories: CategoryId[]; subCategory: string } {
  const allCategories = matchOsmTagsToCategories(tags);

  let primary: CategoryId = 'STORE';

  if (preferredCategory && preferredCategory !== 'ALL' && allCategories.includes(preferredCategory)) {
    primary = preferredCategory;
  } else if (allCategories.length > 0) {
    // Prefer more specific category over generic 'STORE'
    const specific = allCategories.find((c) => c !== 'STORE');
    primary = specific || allCategories[0];
  }

  const def = CATEGORY_DEFINITIONS[primary] || CATEGORY_DEFINITIONS.STORE;
  const subCategory = def.getSubCategory(tags);
  const effectiveAllCategories = allCategories.length > 0 ? allCategories : [primary];

  return {
    primaryCategory: primary,
    allCategories: effectiveAllCategories,
    subCategory
  };
}

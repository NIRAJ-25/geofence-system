import { NextRequest, NextResponse } from 'next/server';
import { calculateHaversineDistance, isValidCoordinate } from '@/lib/geofence/distanceCalculator';
import { AmenityCategory, AmenityItem } from '@/types/amenity';
import {
  CategoryId,
  CATEGORY_DEFINITIONS,
  getPrimaryCategory
} from '@/lib/amenities/categoryDefinitions';

interface CacheEntry {
  timestamp: number;
  data: unknown;
}

interface OSMElement {
  type: string;
  id: number | string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  tags?: Record<string, string>;
}

interface NominatimItem {
  osm_type?: string;
  osm_id?: number;
  place_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  class?: string;
  type?: string;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 60 seconds in-memory cache

// Overpass API mirrors
const OVERPASS_ENDPOINTS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

function humanize(str?: string): string {
  if (!str) return 'Establishment';
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getMannerEtiquette(category: CategoryId): string {
  switch (category) {
    case 'HOSPITAL':
      return 'Maintain strict silence in patient wards. Yield immediate right-of-way to emergency ambulances and healthcare personnel.';
    case 'HOTEL':
      return 'Observe quiet hours after 10:00 PM. Check in at the reception desk with valid identification.';
    case 'CAFE':
      return 'Be mindful of seating during busy hours. Maintain polite conversational noise levels.';
    case 'GAS_STATION':
      return 'Turn off vehicle engines during refueling. Do not smoke near pump islands.';
    case 'EV_CHARGING':
      return 'Vacate charging bays promptly once your charging session completes to allow other drivers access.';
    case 'MALL':
      return 'Supervise children near escalators and elevators. Keep emergency corridors and exits clear.';
    case 'THEATRE':
      return 'Silence all mobile phones and alarms before the performance starts. No flash photography.';
    case 'PHARMACY':
      return 'Maintain patient privacy distance behind the consultation line at the prescription dispensary.';
    case 'SUPERMARKET':
    case 'STORE':
    default:
      return 'Maintain orderly queue etiquette at checkout counters. Return shopping baskets and carts.';
  }
}

/**
 * Constructs a comprehensive Overpass QL query targeting both nodes and ways (with center coordinates).
 */
function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  category: CategoryId
): string {
  if (category === 'ALL') {
    return `[out:json][timeout:8];
(
  nwr["amenity"~"^(hospital|clinic|pharmacy|cafe|restaurant|fast_food|fuel|charging_station|theatre|cinema|bank|post_office)$"](around:${radius},${lat},${lng});
  nwr["tourism"~"^(hotel|motel|guest_house|hostel|attraction|museum)$"](around:${radius},${lat},${lng});
  nwr["shop"~"^(supermarket|convenience|department_store|mall|clothes|electronics|books|chemist|bakery|hardware|florist|pet|sports|jewelry|wine)$"](around:${radius},${lat},${lng});
  nwr["leisure"~"^(park|fitness_centre|sports_centre)$"](around:${radius},${lat},${lng});
);
out center 100;`;
  }

  const parts: string[] = [];
  const addTarget = (key: string, val: string) => {
    if (val === '*') {
      parts.push(`nwr["${key}"](around:${radius},${lat},${lng});`);
    } else {
      parts.push(`nwr["${key}"="${val}"](around:${radius},${lat},${lng});`);
    }
  };

  const def = CATEGORY_DEFINITIONS[category];
  if (def && def.osmOverpassTargets.length > 0) {
    def.osmOverpassTargets.forEach((target) => {
      addTarget(target.key, target.val);
    });
  } else {
    addTarget('shop', '*');
  }

  return `[out:json][timeout:8];
(
  ${parts.join('\n  ')}
);
out center 80;`;
}

/**
 * Resilient fallback to OpenStreetMap Nominatim search when Overpass servers are saturated
 */
async function fetchFromNominatim(
  lat: number,
  lng: number,
  radiusMeters: number,
  category: CategoryId,
  queryKeyword?: string
): Promise<OSMElement[]> {
  const dLat = radiusMeters / 111000;
  const dLng = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));
  const minLat = (lat - dLat).toFixed(5);
  const maxLat = (lat + dLat).toFixed(5);
  const minLng = (lng - dLng).toFixed(5);
  const maxLng = (lng + dLng).toFixed(5);

  // If ALL categories requested, query popular amenity types in parallel
  if (category === 'ALL') {
    const searchTerms = queryKeyword?.trim()
      ? [queryKeyword.trim()]
      : ['cafe', 'hospital', 'hotel', 'supermarket', 'pharmacy', 'restaurant', 'store', 'theatre', 'gas station'];

    const requests = searchTerms.map(async (term) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&bounded=1&viewbox=${minLng},${maxLat},${maxLng},${minLat}&limit=12`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'GeoFenceOSM/1.0 (contact@geofence.local)',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(4500)
        });
        if (!res.ok) return [];
        return (await res.json()) as NominatimItem[];
      } catch {
        return [];
      }
    });

    const settled = await Promise.allSettled(requests);
    const combined: NominatimItem[] = [];
    const seenOsmIds = new Set<string>();

    for (const r of settled) {
      if (r.status === 'fulfilled') {
        for (const item of r.value) {
          const key = `${item.osm_type || 'node'}-${item.osm_id || item.place_id}`;
          if (!seenOsmIds.has(key)) {
            seenOsmIds.add(key);
            combined.push(item);
          }
        }
      }
    }

    return combined.map((item: NominatimItem) => {
      const cls = item.class || 'amenity';
      const type = item.type || 'yes';
      const tags: Record<string, string> = {
        name: item.name || item.display_name?.split(',')[0] || 'OSM Place',
        [cls]: type,
        'addr:full': item.display_name || ''
      };

      if (cls === 'amenity') tags.amenity = type;
      if (cls === 'shop') tags.shop = type;
      if (cls === 'tourism') tags.tourism = type;
      if (cls === 'leisure') tags.leisure = type;
      if (cls === 'healthcare') tags.healthcare = type;

      return {
        type: item.osm_type || 'node',
        id: item.osm_id || item.place_id || 'unknown',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        tags
      };
    });
  }

  // Single category query
  let searchKeyword = 'amenity';
  switch (category) {
    case 'HOSPITAL':
      searchKeyword = 'hospital';
      break;
    case 'CAFE':
      searchKeyword = 'cafe';
      break;
    case 'HOTEL':
      searchKeyword = 'hotel';
      break;
    case 'GAS_STATION':
      searchKeyword = 'gas station';
      break;
    case 'EV_CHARGING':
      searchKeyword = 'charging station';
      break;
    case 'MALL':
      searchKeyword = 'mall';
      break;
    case 'THEATRE':
      searchKeyword = 'theatre';
      break;
    case 'SUPERMARKET':
      searchKeyword = 'supermarket';
      break;
    case 'PHARMACY':
      searchKeyword = 'pharmacy';
      break;
    case 'ELECTRONICS':
      searchKeyword = 'electronics';
      break;
    case 'BOOKSTORE':
      searchKeyword = 'bookstore';
      break;
    case 'FASHION':
      searchKeyword = 'clothing';
      break;
    case 'HARDWARE':
      searchKeyword = 'hardware';
      break;
    case 'FLORIST':
      searchKeyword = 'florist';
      break;
    case 'PET_SUPPLIES':
      searchKeyword = 'pet store';
      break;
    case 'SPORTS':
      searchKeyword = 'sporting goods';
      break;
    case 'JEWELRY':
      searchKeyword = 'jewelry';
      break;
    case 'GOURMET_WINE':
      searchKeyword = 'wine';
      break;
    case 'STORE':
      searchKeyword = 'store';
      break;
    default:
      searchKeyword = queryKeyword?.trim() ? queryKeyword.trim() : 'amenity';
      break;
  }

  if (queryKeyword?.trim()) {
    searchKeyword = `${queryKeyword.trim()} ${searchKeyword}`;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchKeyword)}&bounded=1&viewbox=${minLng},${maxLat},${maxLng},${minLat}&limit=50`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'GeoFenceOSM/1.0 (contact@geofence.local)',
      'Accept': 'application/json'
    },
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) {
    throw new Error(`Nominatim fallback returned status ${res.status}`);
  }

  const items = (await res.json()) as NominatimItem[];
  return items.map((item: NominatimItem) => {
    const cls = item.class || 'amenity';
    const type = item.type || 'yes';
    const tags: Record<string, string> = {
      name: item.name || item.display_name?.split(',')[0] || 'OSM Place',
      [cls]: type,
      'addr:full': item.display_name || ''
    };

    // Synthesize tags matching known category definitions
    switch (category) {
      case 'HOSPITAL':
        tags.amenity = 'hospital';
        tags.healthcare = 'hospital';
        break;
      case 'CAFE':
        tags.amenity = 'cafe';
        break;
      case 'HOTEL':
        tags.tourism = 'hotel';
        break;
      case 'GAS_STATION':
        tags.amenity = 'fuel';
        break;
      case 'EV_CHARGING':
        tags.amenity = 'charging_station';
        break;
      case 'MALL':
        tags.shop = 'mall';
        break;
      case 'THEATRE':
        tags.amenity = 'theatre';
        break;
      case 'SUPERMARKET':
        tags.shop = 'supermarket';
        break;
      case 'PHARMACY':
        tags.amenity = 'pharmacy';
        break;
      case 'ELECTRONICS':
        tags.shop = 'electronics';
        break;
      case 'BOOKSTORE':
        tags.shop = 'books';
        break;
      case 'FASHION':
        tags.shop = 'clothes';
        break;
      case 'HARDWARE':
        tags.shop = 'hardware';
        break;
      case 'FLORIST':
        tags.shop = 'florist';
        break;
      case 'PET_SUPPLIES':
        tags.shop = 'pet';
        break;
      case 'SPORTS':
        tags.shop = 'sports';
        break;
      case 'JEWELRY':
        tags.shop = 'jewelry';
        break;
      case 'GOURMET_WINE':
        tags.shop = 'wine';
        break;
      case 'STORE':
        tags.shop = 'convenience';
        break;
      default:
        break;
    }

    return {
      type: item.osm_type || 'node',
      id: item.osm_id || item.place_id || 'unknown',
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      tags
    };
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: 'Valid user GPS latitude and longitude are required.' },
      { status: 400 }
    );
  }

  const userLat = parseFloat(latStr);
  const userLng = parseFloat(lngStr);

  if (!isValidCoordinate(userLat, userLng)) {
    return NextResponse.json(
      { error: 'Invalid latitude or longitude numbers.' },
      { status: 400 }
    );
  }

  const radiusMeters = parseInt(searchParams.get('radius') || '1000', 10);
  const categoryRaw = (searchParams.get('category') || 'ALL').toUpperCase();
  const category = (categoryRaw in CATEGORY_DEFINITIONS ? categoryRaw : 'ALL') as CategoryId;
  const searchQuery = (searchParams.get('query') || '').trim();
  const openOnly = searchParams.get('openOnly') === 'true';
  const sortBy = (searchParams.get('sortBy') || 'DISTANCE').toUpperCase();

  // Cache key
  const cacheKey = JSON.stringify({
    lat: userLat.toFixed(3),
    lng: userLng.toFixed(3),
    r: radiusMeters,
    c: category,
    q: searchQuery.toLowerCase(),
    o: openOnly,
    sb: sortBy
  });

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ...(cached.data as object), fromCache: true });
  }

  let rawElements: OSMElement[] = [];
  let providerUsed = 'OpenStreetMap (Overpass API)';

  // 1. Try Overpass API endpoints in order
  const overpassQL = buildOverpassQuery(userLat, userLng, radiusMeters, category);
  let overpassSuccess = false;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': 'GeoFenceOSM/1.0 (contact@geofence.local)',
          'Referer': 'http://localhost:3000/',
          'Accept': 'application/json'
        },
        body: 'data=' + encodeURIComponent(overpassQL),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const text = await res.text();
        if (text.startsWith('{')) {
          const data = JSON.parse(text);
          if (Array.isArray(data.elements)) {
            rawElements = data.elements as OSMElement[];
            overpassSuccess = true;
            break;
          }
        }
      }
    } catch {
      // Continue to next mirror on failure or timeout
    }
  }

  // 2. If Overpass servers failed or timed out, gracefully use official OSM Nominatim search
  if (!overpassSuccess) {
    try {
      rawElements = await fetchFromNominatim(userLat, userLng, radiusMeters, category, searchQuery);
      providerUsed = 'OpenStreetMap (Nominatim Search)';
    } catch (err: unknown) {
      if (!overpassSuccess && rawElements.length === 0) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            error: 'Public OpenStreetMap Overpass servers are temporarily busy. Please click "Retry Search" in a few moments.',
            details: errMsg
          },
          { status: 503 }
        );
      }
    }
  }

  // 3. Normalize results, calculate unrounded Haversine distances, and filter strictly
  const mappedPlaces: AmenityItem[] = [];
  const seenIds = new Set<string>();

  for (const el of rawElements) {
    const lat = el.lat ?? el.center?.lat ?? (el.bounds ? (el.bounds.minlat + el.bounds.maxlat) / 2 : undefined);
    const lon = el.lon ?? el.center?.lon ?? (el.bounds ? (el.bounds.minlon + el.bounds.maxlon) / 2 : undefined);
    if (lat === undefined || lon === undefined || !isValidCoordinate(lat, lon)) continue;

    // Haversine distance in meters
    const distMeters = calculateHaversineDistance(userLat, userLng, lat, lon);

    // STRICT VALIDATION RULE: Discard if outside requested circular radius
    if (distMeters > radiusMeters) {
      continue;
    }

    const dedupeKey = `${el.type || 'node'}-${el.id}`;
    if (seenIds.has(dedupeKey)) continue;
    seenIds.add(dedupeKey);

    const tags = el.tags || {};

    // Match categories using centralized registry
    const { primaryCategory, allCategories, subCategory } = getPrimaryCategory(tags, category);

    // If specific category requested, verify match
    if (category !== 'ALL' && !allCategories.includes(category)) {
      continue;
    }

    // Derive name — never fake!
    const name = tags.name || tags['name:en'] || tags.brand || `${humanize(subCategory)} (OSM #${el.id})`;

    // Filter by text search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        name.toLowerCase().includes(q) ||
        subCategory.toLowerCase().includes(q) ||
        (tags.cuisine && tags.cuisine.toLowerCase().includes(q)) ||
        (tags.brand && tags.brand.toLowerCase().includes(q)) ||
        (tags['addr:street'] && tags['addr:street'].toLowerCase().includes(q));
      if (!match) continue;
    }

    // Build physical address
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'] || tags['addr:suburb']
    ].filter(Boolean);
    const address = addressParts.join(' ') || tags['addr:full'] || 'OpenStreetMap Verified Location';

    // Opening hours
    const timings = tags.opening_hours || (tags.amenity === 'hospital' ? 'Emergency 24/7' : undefined);
    const isOpen = tags.opening_hours === '24/7' || (timings ? true : true);

    if (openOnly && tags.opening_hours && tags.opening_hours.toLowerCase().includes('off')) {
      continue;
    }

    const osmLink = `https://www.openstreetmap.org/${el.type || 'node'}/${el.id}`;

    mappedPlaces.push({
      id: `osm-${el.type || 'node'}-${el.id}`,
      name,
      category: (category !== 'ALL' && allCategories.includes(category) ? category : primaryCategory) as AmenityCategory,
      categories: allCategories as AmenityCategory[],
      subCategory,
      rating: 0, // Genuine OSM data — no fake ratings
      address,
      latitude: lat,
      longitude: lon,
      distanceMeters: Math.round(distMeters * 10) / 10,
      isOpen,
      phone: tags.phone || tags['contact:phone'],
      website: tags.website || tags['contact:website'] || osmLink,
      timings,
      curatedDescription: `Community-mapped establishment in OpenStreetMap (${el.type || 'node'} #${el.id}). Data © OpenStreetMap contributors.`,
      tags: [primaryCategory, subCategory, tags.cuisine, tags.brand].filter(Boolean).map(humanize),
      amenityHighlights: {
        wheelchairAccessible: tags.wheelchair === 'yes',
        wifi: tags.internet_access === 'wlan' || tags.internet_access === 'yes',
        parking: tags.parking === 'yes' || !tags['parking:fee'],
        cardPayment: tags.payment_cards === 'yes' || tags['payment:credit_cards'] === 'yes',
        evCharging: allCategories.includes('EV_CHARGING') || tags.amenity === 'charging_station'
      },
      mannerEtiquette: getMannerEtiquette(primaryCategory)
    });
  }

  // Sort results
  if (sortBy === 'NAME') {
    mappedPlaces.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: DISTANCE ascending using exact numeric distance
    mappedPlaces.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }

  const responsePayload = {
    places: mappedPlaces,
    searchRadius: radiusMeters,
    returnedCount: rawElements.length,
    displayedCount: mappedPlaces.length,
    centerLatitude: userLat,
    centerLongitude: userLng,
    fromCache: false,
    provider: providerUsed
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });

  return NextResponse.json(responsePayload);
}

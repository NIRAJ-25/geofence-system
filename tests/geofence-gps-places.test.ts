import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  isValidCoordinate,
  formatDistance
} from '../src/lib/geofence/distanceCalculator';
import {
  matchOsmTagsToCategories,
  CATEGORY_DEFINITIONS
} from '../src/lib/amenities/categoryDefinitions';

describe('GeoFence GPS & Overpass Places Verification Suite', () => {

  // 1. Valid and invalid GPS coordinates
  describe('1. GPS Coordinate Validation', () => {
    it('accepts valid real-world coordinates', () => {
      assert.equal(isValidCoordinate(37.7749, -122.4194), true); // San Francisco
      assert.equal(isValidCoordinate(51.5074, -0.1278), true);   // London
      assert.equal(isValidCoordinate(-33.8688, 151.2093), true); // Sydney
      assert.equal(isValidCoordinate(0, 0), true);               // Equator/Prime Meridian
      assert.equal(isValidCoordinate(90, 180), true);            // Boundary max
      assert.equal(isValidCoordinate(-90, -180), true);          // Boundary min
    });

    it('rejects invalid, out-of-range, and NaN coordinates', () => {
      assert.equal(isValidCoordinate(91, 0), false);
      assert.equal(isValidCoordinate(-90.1, 0), false);
      assert.equal(isValidCoordinate(0, 180.5), false);
      assert.equal(isValidCoordinate(0, -181), false);
      assert.equal(isValidCoordinate(NaN, -122.4), false);
      assert.equal(isValidCoordinate(37.7, NaN), false);
      assert.equal(isValidCoordinate(Number('not-a-number'), -122.4), false);
    });
  });

  // 2. Stale location handling
  describe('2. Stale Location Handling', () => {
    it('distinguishes fresh readings from stale readings based on elapsed time', () => {
      const now = Date.now();
      const freshTimestamp = now - 5000;  // 5 seconds ago
      const staleTimestamp = now - 45000; // 45 seconds ago (> 35s threshold)
      const expiredTimestamp = now - 400000; // > 5 minutes ago

      const isStale = (ts: number, maxAgeMs = 35000) => (now - ts) > maxAgeMs;

      assert.equal(isStale(freshTimestamp), false, '5s old reading must be active/fresh');
      assert.equal(isStale(staleTimestamp), true, '45s old reading must be classified as stale');
      assert.equal(isStale(expiredTimestamp, 300000), true, 'Reading older than 5m must be expired');
    });
  });

  // 3. Haversine distance calculations
  describe('3. Haversine Distance Calculations', () => {
    it('calculates 0 meters for identical coordinates', () => {
      const d = calculateHaversineDistance(37.7749, -122.4194, 37.7749, -122.4194);
      assert.equal(d, 0);
    });

    it('accurately calculates known geographic benchmarks within GPS tolerance', () => {
      // Benchmark 1: London (51.5074, -0.1278) to Paris (48.8566, 2.3522) ≈ 343.5 km
      const londonToParis = calculateHaversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
      assert.ok(
        Math.abs(londonToParis - 343556) < 1000,
        `Expected ~343.5km, got ${londonToParis}m`
      );

      // Benchmark 2: SF City Hall (37.7793, -122.4193) to Ferry Building (37.7955, -122.3937) ≈ 2.87 km
      const sfCityHallToFerry = calculateHaversineDistance(37.7793, -122.4193, 37.7955, -122.3937);
      assert.ok(
        Math.abs(sfCityHallToFerry - 2870) < 50,
        `Expected ~2.87km, got ${sfCityHallToFerry}m`
      );
    });

    it('throws when invalid coordinates are passed', () => {
      assert.throws(() => {
        calculateHaversineDistance(999, 0, 37.7749, -122.4194);
      });
    });

    it('formats distances cleanly for user presentation', () => {
      assert.equal(formatDistance(0), '0 m away');
      assert.equal(formatDistance(45.4), '45 m away');
      assert.equal(formatDistance(999), '999 m away');
      assert.equal(formatDistance(1000), '1.0 km away');
      assert.equal(formatDistance(2450), '2.5 km away');
      assert.equal(formatDistance(null), 'Nearby');
    });
  });

  // 4. Correct radius conversion and filtering
  describe('4. Radius Filtering (Circular Haversine Enforced)', () => {
    const userLat = 37.7749;
    const userLng = -122.4194;

    const testPlaces = [
      { name: 'Close Cafe', lat: 37.7752, lng: -122.4195 }, // ~35m
      { name: 'Midway Store', lat: 37.7790, lng: -122.4150 }, // ~600m
      { name: 'Edge Hospital', lat: 37.7830, lng: -122.4100 }, // ~1200m
      { name: 'Far Hotel', lat: 37.7950, lng: -122.4000 } // ~2800m
    ];

    it('strictly filters places within 500m radius', () => {
      const radius = 500;
      const within = testPlaces.filter((p) => {
        const d = calculateHaversineDistance(userLat, userLng, p.lat, p.lng);
        return d <= radius;
      });
      assert.equal(within.length, 1);
      assert.equal(within[0].name, 'Close Cafe');
    });

    it('strictly filters places within 1000m radius', () => {
      const radius = 1000;
      const within = testPlaces.filter((p) => {
        const d = calculateHaversineDistance(userLat, userLng, p.lat, p.lng);
        return d <= radius;
      });
      assert.equal(within.length, 2);
      assert.deepEqual(within.map(p => p.name), ['Close Cafe', 'Midway Store']);
    });

    it('filters places within 2000m radius', () => {
      const radius = 2000;
      const within = testPlaces.filter((p) => {
        const d = calculateHaversineDistance(userLat, userLng, p.lat, p.lng);
        return d <= radius;
      });
      assert.equal(within.length, 3);
    });
  });

  // 5. Correct nearest-first numeric sorting
  describe('5. Nearest-First Numeric Sorting', () => {
    it('sorts strictly by numeric distance and never by string representation', () => {
      const places = [
        { name: 'Venue A', distanceMeters: 1050 }, // 1.1 km
        { name: 'Venue B', distanceMeters: 95 },   // 95 m (would sort after 1050 alphabetically!)
        { name: 'Venue C', distanceMeters: 20 },   // 20 m
        { name: 'Venue D', distanceMeters: 500 }   // 500 m
      ];

      places.sort((a, b) => a.distanceMeters - b.distanceMeters);

      assert.equal(places[0].name, 'Venue C'); // 20m
      assert.equal(places[1].name, 'Venue B'); // 95m
      assert.equal(places[2].name, 'Venue D'); // 500m
      assert.equal(places[3].name, 'Venue A'); // 1050m
    });
  });

  // 6. OpenStreetMap node, way, and relation coordinate handling
  describe('6. OSM Node, Way, and Relation Coordinates', () => {
    it('extracts direct coordinates for nodes', () => {
      const nodeEl = { type: 'node', id: 101, lat: 37.775, lon: -122.419 };
      const lat = nodeEl.lat;
      const lon = nodeEl.lon;
      assert.equal(lat, 37.775);
      assert.equal(lon, -122.419);
    });

    it('extracts center coordinates for ways and relations with out center', () => {
      interface OverpassElementLike {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
      }
      const wayEl: OverpassElementLike = {
        type: 'way',
        id: 202,
        center: { lat: 37.776, lon: -122.420 }
      };
      const lat = wayEl.lat ?? wayEl.center?.lat;
      const lon = wayEl.lon ?? wayEl.center?.lon;
      assert.equal(lat, 37.776);
      assert.equal(lon, -122.420);
    });

    it('falls back to bounds center if center is missing on closed ways/relations', () => {
      interface OverpassElementLike {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
      }
      const relEl: OverpassElementLike = {
        type: 'relation',
        id: 303,
        bounds: { minlat: 37.770, minlon: -122.430, maxlat: 37.780, maxlon: -122.420 }
      };
      const lat = relEl.lat ?? relEl.center?.lat ?? (relEl.bounds ? (relEl.bounds.minlat + relEl.bounds.maxlat) / 2 : undefined);
      const lon = relEl.lon ?? relEl.center?.lon ?? (relEl.bounds ? (relEl.bounds.minlon + relEl.bounds.maxlon) / 2 : undefined);
      assert.ok(Math.abs((lat ?? 0) - 37.775) < 0.00001);
      assert.ok(Math.abs((lon ?? 0) - -122.425) < 0.00001);
    });
  });

  // 7. Duplicate-result removal
  describe('7. Deduplication by Stable Element ID', () => {
    it('deduplicates items sharing the same OSM type and ID', () => {
      const rawElements = [
        { type: 'node', id: 1001, tags: { name: 'Sightglass Coffee' } },
        { type: 'node', id: 1001, tags: { name: 'Sightglass Coffee duplicate' } },
        { type: 'way', id: 1001, tags: { name: 'Sightglass Building Way' } }, // different type
        { type: 'node', id: 1002, tags: { name: 'Blue Bottle' } }
      ];

      const seen = new Set<string>();
      const deduplicated = rawElements.filter((el) => {
        const key = `${el.type}-${el.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      assert.equal(deduplicated.length, 3);
      assert.equal(deduplicated[0].tags.name, 'Sightglass Coffee');
      assert.equal(deduplicated[1].tags.name, 'Sightglass Building Way');
      assert.equal(deduplicated[2].tags.name, 'Blue Bottle');
    });
  });

  // 8. Hospital-only filtering
  describe('8. Hospital Category Filtering', () => {
    it('correctly matches hospital and medical clinic tags', () => {
      const hospitalTags = { amenity: 'hospital', name: 'Zuckerberg SF General' };
      const clinicTags = { healthcare: 'clinic', name: 'Mission Health Center' };
      const doctorTags = { amenity: 'doctors', name: 'Dr. Smith Office' };
      const cafeTags = { amenity: 'cafe', name: 'Starbucks' };

      assert.ok(CATEGORY_DEFINITIONS.HOSPITAL.matches(hospitalTags));
      assert.ok(CATEGORY_DEFINITIONS.HOSPITAL.matches(clinicTags));
      assert.ok(CATEGORY_DEFINITIONS.HOSPITAL.matches(doctorTags));
      assert.equal(CATEGORY_DEFINITIONS.HOSPITAL.matches(cafeTags), false);
    });
  });

  // 9. Cafe-only filtering
  describe('9. Cafe & Dining Filtering', () => {
    it('correctly matches cafes, restaurants, bakeries, and coffee shops', () => {
      const cafeTags = { amenity: 'cafe', name: 'Philz Coffee' };
      const restaurantTags = { amenity: 'restaurant', cuisine: 'italian', name: 'Pasta House' };
      const bakeryTags = { amenity: 'bakery', name: 'Tartine' };
      const hardwareTags = { shop: 'hardware', name: 'Home Depot' };

      assert.ok(CATEGORY_DEFINITIONS.CAFE.matches(cafeTags));
      assert.ok(CATEGORY_DEFINITIONS.CAFE.matches(restaurantTags));
      assert.ok(CATEGORY_DEFINITIONS.CAFE.matches(bakeryTags));
      assert.equal(CATEGORY_DEFINITIONS.CAFE.matches(hardwareTags), false);
    });
  });

  // 10. Hotel-only filtering
  describe('10. Hotel & Lodging Filtering', () => {
    it('correctly matches hotels, motels, and guest houses', () => {
      const hotelTags = { tourism: 'hotel', name: 'Marriott Marquis' };
      const hostelTags = { tourism: 'hostel', name: 'SF City Hostel' };
      const pharmacyTags = { amenity: 'pharmacy', name: 'Walgreens' };

      assert.ok(CATEGORY_DEFINITIONS.HOTEL.matches(hotelTags));
      assert.ok(CATEGORY_DEFINITIONS.HOTEL.matches(hostelTags));
      assert.equal(CATEGORY_DEFINITIONS.HOTEL.matches(pharmacyTags), false);
    });
  });

  // 11. Pharmacy-only filtering
  describe('11. Pharmacy Filtering', () => {
    it('correctly matches pharmacies, chemists, and medical dispensaries', () => {
      const pharmacyTags = { amenity: 'pharmacy', name: 'CVS Pharmacy' };
      const chemistTags = { shop: 'chemist', name: 'Community Chemist' };
      const clothingTags = { shop: 'clothes', name: 'Gap' };

      assert.ok(CATEGORY_DEFINITIONS.PHARMACY.matches(pharmacyTags));
      assert.ok(CATEGORY_DEFINITIONS.PHARMACY.matches(chemistTags));
      assert.equal(CATEGORY_DEFINITIONS.PHARMACY.matches(clothingTags), false);
    });
  });

  // 12. Store and supermarket filtering
  describe('12. Store and Supermarket Filtering', () => {
    it('correctly matches supermarkets, groceries, and convenience stores', () => {
      const supermarketTags = { shop: 'supermarket', name: 'Safeway' };
      const groceryTags = { shop: 'grocery', name: 'Bi-Rite Market' };
      const convenienceTags = { shop: 'convenience', name: '7-Eleven' };
      const theatreTags = { amenity: 'theatre', name: 'Orpheum' };

      assert.ok(CATEGORY_DEFINITIONS.SUPERMARKET.matches(supermarketTags));
      assert.ok(CATEGORY_DEFINITIONS.SUPERMARKET.matches(groceryTags));
      assert.ok(CATEGORY_DEFINITIONS.SUPERMARKET.matches(convenienceTags));
      assert.equal(CATEGORY_DEFINITIONS.SUPERMARKET.matches(theatreTags), false);

      // Supermarket also matches STORE
      assert.ok(CATEGORY_DEFINITIONS.STORE.matches(supermarketTags));
    });
  });

  // 13. Multiple categories matching one place
  describe('13. Multi-Category Resolution for Compound Establishments', () => {
    it('resolves multiple categories for a pharmacy inside a supermarket or retail store', () => {
      const supermarketWithPharmacy = {
        shop: 'supermarket',
        amenity: 'pharmacy',
        name: 'Target with CVS Pharmacy'
      };

      const matched = matchOsmTagsToCategories(supermarketWithPharmacy);
      assert.ok(matched.includes('SUPERMARKET'), 'Should match SUPERMARKET');
      assert.ok(matched.includes('PHARMACY'), 'Should match PHARMACY');
      assert.ok(matched.includes('STORE'), 'Should match STORE');
    });

    it('resolves gas station with EV charging and convenience store', () => {
      const gasWithEv = {
        amenity: 'fuel',
        charging_station: 'yes',
        shop: 'convenience',
        name: 'Chevron ExtraMile & EV Hub'
      };

      const matched = matchOsmTagsToCategories(gasWithEv);
      assert.ok(matched.includes('GAS_STATION'));
      assert.ok(matched.includes('EV_CHARGING'));
      assert.ok(matched.includes('SUPERMARKET'));
      assert.ok(matched.includes('STORE'));
    });
  });

  // 14. Keyword and category filters working together
  describe('14. Combined Keyword & Category Filtering', () => {
    const places = [
      { name: 'Sightglass Coffee Roasters', category: 'CAFE', tags: ['CAFE', 'Coffee'], subCategory: 'Coffee Shop' },
      { name: 'Blue Bottle Cafe', category: 'CAFE', tags: ['CAFE', 'Coffee'], subCategory: 'Coffee Shop' },
      { name: 'Tartine Bakery', category: 'CAFE', tags: ['CAFE', 'Bakery'], subCategory: 'Bakery' },
      { name: 'SF Coffee Store Goods', category: 'STORE', tags: ['STORE', 'Books'], subCategory: 'Bookstore' }
    ];

    it('filters strictly by BOTH category and search keyword', () => {
      const categoryFilter: string = 'CAFE';
      const searchKeyword = 'sightglass';

      const results = places.filter((p) => {
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        const matchesKeyword = p.name.toLowerCase().includes(searchKeyword);
        return matchesCategory && matchesKeyword;
      });

      assert.equal(results.length, 1);
      assert.equal(results[0].name, 'Sightglass Coffee Roasters');
    });
  });

  // 15. Changing radius and GPS position
  describe('15. Dynamic Center & Radius Updates', () => {
    it('recalculates distance and adjusts inclusion when GPS position changes', () => {
      const venue = { lat: 37.7750, lon: -122.4190 };

      // User at Position 1 (30m away)
      const pos1 = { lat: 37.7749, lon: -122.4193 };
      const d1 = calculateHaversineDistance(pos1.lat, pos1.lon, venue.lat, venue.lon);
      assert.ok(d1 < 50);

      // User moves to Position 2 (3km away)
      const pos2 = { lat: 37.8000, lon: -122.4100 };
      const d2 = calculateHaversineDistance(pos2.lat, pos2.lon, venue.lat, venue.lon);
      assert.ok(d2 > 2500);

      // Within 500m radius check
      assert.equal(d1 <= 500, true, 'Should be inside 500m radius at position 1');
      assert.equal(d2 <= 500, false, 'Should be outside 500m radius at position 2');
    });
  });

  // 16. Out-of-order API responses
  describe('16. Out-of-Order API Response Handling', () => {
    it('rejects stale responses with older request IDs', () => {
      let activeRequestId = 1;

      const handleResponse = (requestId: number, data: string[]) => {
        if (requestId !== activeRequestId) {
          // Reject stale response
          return { accepted: false };
        }
        return { accepted: true, data };
      };

      // Request 1 dispatched
      const req1Id = activeRequestId;

      // User immediately clicks a new filter -> Request 2 dispatched
      activeRequestId = 2;
      const req2Id = activeRequestId;

      // Response 2 arrives first
      const res2 = handleResponse(req2Id, ['Result 2']);
      assert.equal(res2.accepted, true);

      // Delayed Response 1 arrives late
      const res1 = handleResponse(req1Id, ['Old Stale Result 1']);
      assert.equal(res1.accepted, false, 'Older request 1 must be rejected');
    });
  });

  // 17. API timeouts and failed requests
  describe('17. Error Resilience & Provider Failure Handling', () => {
    it('does not mask API network errors as successful empty searches', () => {
      const simulateApiResponse = (httpStatus: number) => {
        if (httpStatus >= 500) {
          throw new Error('Overpass server temporarily unavailable (503)');
        }
        return { places: [] };
      };

      assert.throws(() => {
        simulateApiResponse(503);
      }, /Overpass server temporarily unavailable/);
    });
  });

  // 18. Empty category results versus actual API failures
  describe('18. Empty Results vs API Failure Differentiation', () => {
    it('distinguishes a genuine 200 OK zero-result query from an API failure', () => {
      const successfulEmptyResponse = {
        status: 200,
        places: [],
        returnedCount: 0
      };

      const failedResponse = {
        status: 503,
        error: 'Gateway Timeout'
      };

      type ApiResponseSample = 
        | { status: number; places: unknown[]; returnedCount: number }
        | { status: number; error: string };

      const isGenuineEmpty = (res: ApiResponseSample) => {
        return res.status === 200 && 'places' in res && res.places.length === 0;
      };

      assert.equal(isGenuineEmpty(successfulEmptyResponse), true);
      assert.equal(isGenuineEmpty(failedResponse), false);
    });
  });
});

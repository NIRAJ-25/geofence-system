import { AmenityItem, AmenityFilter } from '@/types/amenity';
import { overpassPlacesService, PlacesSearchResponse } from '@/lib/places/overpassPlacesService';

// Zero synthetic businesses: mock array is strictly empty in production
export const MASTER_AMENITIES: AmenityItem[] = [];

export class AmenityService {
  /**
   * Discovers real nearby establishments using OpenStreetMap and Overpass API
   * strictly centered on the user's GPS coordinates.
   */
  public async getAmenitiesNearLocation(
    userLat: number,
    userLng: number,
    filter?: AmenityFilter
  ): Promise<PlacesSearchResponse> {
    return overpassPlacesService.searchNearbyPlaces({
      latitude: userLat,
      longitude: userLng,
      radiusMeters: filter?.maxDistanceMeters || 1000,
      category: filter?.category || 'ALL',
      storeVariety: filter?.storeVariety,
      searchQuery: filter?.search,
      openOnly: filter?.openOnly,
      minRating: filter?.minRating,
      sortBy: filter?.sortBy || 'DISTANCE'
    });
  }

  public clearCache(): void {
    overpassPlacesService.clearCache();
  }
}

export const amenityService = new AmenityService();

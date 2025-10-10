/**
 * Location Finder Service
 *
 * Provides address autocomplete and geolocation services for team creation.
 * Integrates with browser geolocation API and address suggestion services.
 */

export interface AddressSuggestion {
  id: string;
  fullAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LocationFinderResult {
  success: boolean;
  suggestions: AddressSuggestion[];
  error?: string;
}

export interface GeolocationResult {
  success: boolean;
  address?: AddressSuggestion;
  error?: string;
}

export class LocationFinderService {
  /**
   * Get current location using browser geolocation API
   */
  static async getCurrentLocation(): Promise<GeolocationResult> {
    if (!navigator.geolocation) {
      return {
        success: false,
        error: "Geolocation is not supported by this browser",
      };
    }

    try {
      console.log("📍 Getting current location...");

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;
      console.log(`📍 Got coordinates: ${latitude}, ${longitude}`);

      // Reverse geocode to get address
      const address = await this.reverseGeocode(latitude, longitude);

      if (address) {
        console.log("📍 Reverse geocoding successful");
        return {
          success: true,
          address,
        };
      } else {
        return {
          success: false,
          error: "Could not determine address from location",
        };
      }
    } catch (error) {
      console.warn("Geolocation error:", error);

      let errorMessage = "Could not get your location";

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Search for address suggestions based on partial input
   */
  static async searchAddresses(query: string): Promise<LocationFinderResult> {
    if (!query || query.trim().length < 3) {
      return {
        success: true,
        suggestions: [],
      };
    }

    try {
      console.log(`🔍 Searching addresses for: "${query}"`);

      // For demo purposes, we'll use a mock geocoding service
      // In production, you'd integrate with Google Maps, Mapbox, or similar
      const suggestions = await this.mockAddressSearch(query);

      console.log(`🔍 Found ${suggestions.length} address suggestions`);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      console.error("Address search error:", error);

      return {
        success: false,
        suggestions: [],
        error: "Failed to search addresses",
      };
    }
  }

  /**
   * Validate and format an address
   */
  static validateAddress(address: Partial<AddressSuggestion>): {
    isValid: boolean;
    formatted?: AddressSuggestion;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!address.city) {
      errors.push("City is required");
    }

    if (!address.state) {
      errors.push("State is required");
    }

    if (!address.zipCode) {
      errors.push("ZIP code is required");
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.push("Invalid ZIP code format");
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    // Format the address
    const formatted: AddressSuggestion = {
      id: address.id || this.generateId(),
      fullAddress: this.formatFullAddress(address),
      streetAddress: address.streetAddress || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      county: address.county,
      coordinates: address.coordinates,
    };

    return {
      isValid: true,
      formatted,
      errors: [],
    };
  }

  /**
   * Get school district for a given address
   */
  static async getSchoolDistrict(
    address: AddressSuggestion
  ): Promise<string | null> {
    try {
      console.log("🏫 Looking up school district for address...");

      // In production, this would query a school district database
      // For demo, we'll return a mock district based on city/state
      const district = this.mockSchoolDistrictLookup(
        address.city,
        address.state
      );

      console.log(`🏫 Found school district: ${district}`);

      return district;
    } catch (error) {
      console.warn("Could not determine school district:", error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  private static async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<AddressSuggestion | null> {
    // In production, you'd use a real geocoding service
    // For demo, we'll return a mock address based on approximate coordinates

    try {
      // Mock reverse geocoding - in real app use Google Maps, Mapbox, etc.
      const mockAddress = this.mockReverseGeocode(lat, lng);
      return mockAddress;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  }

  /**
   * Mock address search for demo purposes
   */
  private static async mockAddressSearch(
    query: string
  ): Promise<AddressSuggestion[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockSuggestions: AddressSuggestion[] = [
      {
        id: "addr_1",
        fullAddress: "123 Main Street, Goshen, NY 10924",
        streetAddress: "123 Main Street",
        city: "Goshen",
        state: "NY",
        zipCode: "10924",
        county: "Orange County",
        coordinates: { lat: 41.4026, lng: -74.3243 },
      },
      {
        id: "addr_2",
        fullAddress: "456 School Avenue, Goshen, NY 10924",
        streetAddress: "456 School Avenue",
        city: "Goshen",
        state: "NY",
        zipCode: "10924",
        county: "Orange County",
        coordinates: { lat: 41.4056, lng: -74.3213 },
      },
      {
        id: "addr_3",
        fullAddress: "789 High School Drive, Montgomery, NY 12549",
        streetAddress: "789 High School Drive",
        city: "Montgomery",
        state: "NY",
        zipCode: "12549",
        county: "Orange County",
        coordinates: { lat: 41.5267, lng: -74.2362 },
      },
    ];

    // Filter suggestions based on query
    const filtered = mockSuggestions.filter(
      (addr) =>
        addr.fullAddress.toLowerCase().includes(query.toLowerCase()) ||
        addr.city.toLowerCase().includes(query.toLowerCase()) ||
        addr.streetAddress.toLowerCase().includes(query.toLowerCase())
    );

    return filtered;
  }

  /**
   * Mock reverse geocoding for demo
   */
  private static mockReverseGeocode(
    lat: number,
    lng: number
  ): AddressSuggestion {
    // Very basic mock - in real app this would query a proper service
    return {
      id: this.generateId(),
      fullAddress: "Current Location, Goshen, NY 10924",
      streetAddress: "Current Location",
      city: "Goshen",
      state: "NY",
      zipCode: "10924",
      county: "Orange County",
      coordinates: { lat, lng },
    };
  }

  /**
   * Mock school district lookup
   */
  private static mockSchoolDistrictLookup(city: string, state: string): string {
    const districts: Record<string, string> = {
      goshen_ny: "Goshen Central School District",
      montgomery_ny: "Valley Central School District",
      newburgh_ny: "Newburgh Enlarged City School District",
      middletown_ny: "Middletown City School District",
      warwick_ny: "Warwick Valley Central School District",
    };

    const key = `${city.toLowerCase()}_${state.toLowerCase()}`;
    return districts[key] || `${city} School District`;
  }

  /**
   * Format full address string
   */
  private static formatFullAddress(
    address: Partial<AddressSuggestion>
  ): string {
    const parts = [];

    if (address.streetAddress) {
      parts.push(address.streetAddress);
    }

    if (address.city) {
      parts.push(address.city);
    }

    if (address.state) {
      parts.push(address.state);
    }

    if (address.zipCode) {
      parts.push(address.zipCode);
    }

    return parts.join(", ");
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Location Finder Service
 *
 * Provides address autocomplete and geolocation services for team creation.
 * Integrates with browser geolocation API and address suggestion services.
 */

import { debug, error as logError } from "../utils/logger";
import {
  searchAddresses as searchAddressResults,
  type AddressResult,
} from "./addressAutocompleteService";

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
  private static parseAddressFromResult(result: AddressResult): AddressSuggestion {
    const components = result.address_components;

    const streetNumber =
      components.find((c) => c.types.includes("street_number"))?.long_name ||
      "";
    const route =
      components.find((c) => c.types.includes("route"))?.long_name || "";
    const city =
      components.find((c) => c.types.includes("locality"))?.long_name || "";
    const state =
      components.find((c) => c.types.includes("administrative_area_level_1"))
        ?.short_name || "";
    const zipCode =
      components.find((c) => c.types.includes("postal_code"))?.long_name || "";

    const streetAddress = [streetNumber, route].filter(Boolean).join(" ");

    return {
      id: result.place_id || this.generateId(),
      fullAddress: result.formatted_address,
      streetAddress,
      city,
      state,
      zipCode,
    };
  }

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
      debug("📍 Getting current location...");

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
      debug(`📍 Got coordinates: ${latitude}, ${longitude}`);

      // Reverse geocode to get address
      const address = await this.reverseGeocode(latitude, longitude);

      if (address) {
        debug("📍 Reverse geocoding successful");
        return {
          success: true,
          address,
        };
      }
      return {
        success: false,
        error: "Could not determine address from location",
      };
    } catch (error) {
      debug("Geolocation error:", error);

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
      debug(`🔍 Searching addresses for: "${query}"`);

      const results = await searchAddressResults({
        query,
        service: "nominatim",
        countryCode: "US",
      });

      const suggestions = results.map((r) => this.parseAddressFromResult(r));

      debug(`🔍 Found ${suggestions.length} address suggestions`);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      logError("Address search error:", error);

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
    _address: AddressSuggestion
  ): Promise<string | null> {
    try {
      debug("🏫 Looking up school district for address...");

      // Not yet wired to a real district provider.
      // Returning null is safer than guessing wrong data.
      return null;
    } catch (error) {
      debug("Could not determine school district:", error);
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
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(
          String(lat)
        )}&lon=${encodeURIComponent(String(lng))}`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      const streetAddress = [address.house_number, address.road]
        .filter(Boolean)
        .join(" ");

      const city = address.city || address.town || address.village || "";
      const state = address.state || "";
      const zipCode = address.postcode || "";

      return {
        id: data.place_id ? `nominatim_${data.place_id}` : this.generateId(),
        fullAddress: data.display_name || "",
        streetAddress,
        city,
        state,
        zipCode,
        county: address.county,
        coordinates: { lat, lng },
      };
    } catch (error) {
      logError("Reverse geocoding failed:", error);
      return null;
    }
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

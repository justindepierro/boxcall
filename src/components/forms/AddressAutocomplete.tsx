import React, { useState, useRef, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";
import { logError } from "../../utils/logger";
import {
  GlassmorphicDropdown,
  GlassmorphicDropdownItem,
  GlassmorphicDropdownSeparator,
} from "../ui/GlassmorphicDropdown";

/**
 * AddressAutocomplete Component
 *
 * SETUP REQUIRED:
 * 1. Install Google Places API library: npm install @googlemaps/js-api-loader
 * 2. Get Google Places API key from Google Cloud Console
 * 3. Add API key to environment variables: VITE_GOOGLE_PLACES_API_KEY
 * 4. Enable Places API (New) in Google Cloud Console
 *
 * ALTERNATIVE SERVICES:
 * - MapBox Geocoding API
 * - HERE Geocoding API
 * - OpenCage Geocoding API
 * - Nominatim (OpenStreetMap - Free)
 *
 * CURRENT STATUS: Using mock data for development
 */

interface AddressResult {
  formatted_address: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  place_id: string;
}

interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: ParsedAddress) => void;
  onAddressChange?: (address: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  service?: "nominatim" | "google" | "mapbox" | "mock";
  googleApiKey?: string;
  mapboxApiKey?: string;
  countryCode?: string;
  language?: string;
  debounceMs?: number;
}

// Environment variables
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Mock address data for development
const MOCK_ADDRESSES = [
  {
    formatted_address: "123 Main St, Austin, TX 78701, USA",
    address_components: [
      { long_name: "123", short_name: "123", types: ["street_number"] },
      { long_name: "Main Street", short_name: "Main St", types: ["route"] },
      { long_name: "Austin", short_name: "Austin", types: ["locality"] },
      {
        long_name: "Texas",
        short_name: "TX",
        types: ["administrative_area_level_1"],
      },
      { long_name: "78701", short_name: "78701", types: ["postal_code"] },
    ],
    place_id: "mock_1",
  },
  {
    formatted_address: "456 Oak Ave, Dallas, TX 75201, USA",
    address_components: [
      { long_name: "456", short_name: "456", types: ["street_number"] },
      { long_name: "Oak Avenue", short_name: "Oak Ave", types: ["route"] },
      { long_name: "Dallas", short_name: "Dallas", types: ["locality"] },
      {
        long_name: "Texas",
        short_name: "TX",
        types: ["administrative_area_level_1"],
      },
      { long_name: "75201", short_name: "75201", types: ["postal_code"] },
    ],
    place_id: "mock_2",
  },
  {
    formatted_address: "789 Pine Dr, Houston, TX 77001, USA",
    address_components: [
      { long_name: "789", short_name: "789", types: ["street_number"] },
      { long_name: "Pine Drive", short_name: "Pine Dr", types: ["route"] },
      { long_name: "Houston", short_name: "Houston", types: ["locality"] },
      {
        long_name: "Texas",
        short_name: "TX",
        types: ["administrative_area_level_1"],
      },
      { long_name: "77001", short_name: "77001", types: ["postal_code"] },
    ],
    place_id: "mock_3",
  },
  {
    formatted_address:
      "Lincoln High School, 2001 SW Lincoln St, Portland, OR 97201, USA",
    address_components: [
      { long_name: "2001", short_name: "2001", types: ["street_number"] },
      {
        long_name: "Southwest Lincoln Street",
        short_name: "SW Lincoln St",
        types: ["route"],
      },
      { long_name: "Portland", short_name: "Portland", types: ["locality"] },
      {
        long_name: "Oregon",
        short_name: "OR",
        types: ["administrative_area_level_1"],
      },
      { long_name: "97201", short_name: "97201", types: ["postal_code"] },
    ],
    place_id: "mock_4",
  },
  {
    formatted_address:
      "Roosevelt Elementary School, 500 School Ave, Denver, CO 80203, USA",
    address_components: [
      { long_name: "500", short_name: "500", types: ["street_number"] },
      {
        long_name: "School Avenue",
        short_name: "School Ave",
        types: ["route"],
      },
      { long_name: "Denver", short_name: "Denver", types: ["locality"] },
      {
        long_name: "Colorado",
        short_name: "CO",
        types: ["administrative_area_level_1"],
      },
      { long_name: "80203", short_name: "80203", types: ["postal_code"] },
    ],
    place_id: "mock_5",
  },
];

function parseAddress(result: AddressResult): ParsedAddress {
  const components = result.address_components;

  const streetNumber =
    components.find((c) => c.types.includes("street_number"))?.long_name || "";
  const route =
    components.find((c) => c.types.includes("route"))?.long_name || "";
  const city =
    components.find((c) => c.types.includes("locality"))?.long_name || "";
  const state =
    components.find((c) => c.types.includes("administrative_area_level_1"))
      ?.short_name || "";
  const zip =
    components.find((c) => c.types.includes("postal_code"))?.long_name || "";

  const street = [streetNumber, route].filter(Boolean).join(" ");

  return {
    street,
    city,
    state,
    zip,
    formatted: result.formatted_address,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchMockAddresses(query: string): Promise<AddressResult[]> {
  await delay(200);

  return MOCK_ADDRESSES.filter((addr) =>
    addr.formatted_address.toLowerCase().includes(query.toLowerCase())
  );
}

function parseMapBoxContext(feature: any): any[] {
  const components = [];

  // MapBox structure is different from Google Places
  if (feature.address) {
    components.push({
      long_name: feature.address,
      short_name: feature.address,
      types: ["street_number"],
    });
  }

  if (feature.text) {
    components.push({
      long_name: feature.text,
      short_name: feature.text,
      types: ["route"],
    });
  }

  feature.context?.forEach((ctx: any) => {
    if (ctx.id.startsWith("place")) {
      components.push({
        long_name: ctx.text,
        short_name: ctx.text,
        types: ["locality"],
      });
    } else if (ctx.id.startsWith("region")) {
      components.push({
        long_name: ctx.text,
        short_name: ctx.short_code?.replace("US-", "") || ctx.text,
        types: ["administrative_area_level_1"],
      });
    } else if (ctx.id.startsWith("postcode")) {
      components.push({
        long_name: ctx.text,
        short_name: ctx.text,
        types: ["postal_code"],
      });
    }
  });

  return components;
}

async function searchNominatim(params: {
  query: string;
  countryCode: string;
}): Promise<AddressResult[]> {
  const { query, countryCode } = params;

  try {
    const countryParam = countryCode
      ? `&countrycodes=${countryCode.toLowerCase()}`
      : "";
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}${countryParam}&email=contact@boxcall.com`
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((result: any) => {
      const address = result.address || {};
      const addressComponents = [];

      // Map Nominatim response to our format
      if (address.house_number) {
        addressComponents.push({
          long_name: address.house_number,
          short_name: address.house_number,
          types: ["street_number"],
        });
      }

      if (address.road) {
        addressComponents.push({
          long_name: address.road,
          short_name: address.road,
          types: ["route"],
        });
      }

      if (address.city || address.town || address.village) {
        const cityName = address.city || address.town || address.village;
        addressComponents.push({
          long_name: cityName,
          short_name: cityName,
          types: ["locality"],
        });
      }

      if (address.state) {
        addressComponents.push({
          long_name: address.state,
          short_name: address.state,
          types: ["administrative_area_level_1"],
        });
      }

      if (address.postcode) {
        addressComponents.push({
          long_name: address.postcode,
          short_name: address.postcode,
          types: ["postal_code"],
        });
      }

      return {
        formatted_address: result.display_name,
        address_components: addressComponents,
        place_id: `nominatim_${result.place_id}`,
      };
    });
  } catch (error) {
    console.warn("Nominatim search failed, falling back to mock data:", error);
    return searchMockAddresses(query);
  }
}

async function searchGooglePlaces(params: {
  query: string;
  countryCode: string;
}): Promise<AddressResult[]> {
  const { query, countryCode } = params;

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("Google Places API key not configured. Using mock data.");
    return searchMockAddresses(query);
  }

  try {
    // Dynamic import with fallback for missing package
    try {
      // @ts-ignore - Dynamic import may fail if package not installed
      const googleMapsLoader = await import("@googlemaps/js-api-loader");
      const { Loader } = googleMapsLoader;

      const loader = new Loader({
        apiKey: GOOGLE_PLACES_API_KEY,
        version: "weekly",
        libraries: ["places"],
      });

      const google = await (loader as any).load();
      const service = new (google as any).maps.places.AutocompleteService();

      return new Promise((resolve) => {
        service.getPlacePredictions(
          {
            input: query,
            types: ["address"],
            componentRestrictions: countryCode
              ? { country: countryCode }
              : undefined,
          },
          (predictions: any, status: any) => {
            if (
              status === (google as any).maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              const results = predictions.map((prediction: any) => ({
                formatted_address: prediction.description,
                address_components: [], // Would need Places Details API for full components
                place_id: prediction.place_id || "",
              }));
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });
    } catch {
      console.warn(
        "Google Maps JS API Loader not installed. Run: npm install @googlemaps/js-api-loader"
      );
      return searchMockAddresses(query);
    }
  } catch (error) {
    logError("Google Places API error:", error);
    return searchMockAddresses(query);
  }
}

async function searchMapBox(params: {
  query: string;
  countryCode: string;
}): Promise<AddressResult[]> {
  const { query, countryCode } = params;

  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn("MapBox access token not configured. Using mock data.");
    return searchMockAddresses(query);
  }

  try {
    const countryParam = countryCode ? `&country=${countryCode}` : "";
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address${countryParam}&limit=5`
    );

    if (!response.ok) throw new Error("MapBox API request failed");

    const data = await response.json();

    return data.features.map((feature: any) => ({
      formatted_address: feature.place_name,
      address_components: feature.context ? parseMapBoxContext(feature) : [],
      place_id: feature.id,
    }));
  } catch (error) {
    logError("MapBox API error:", error);
    return searchMockAddresses(query);
  }
}

async function searchAddresses(params: {
  query: string;
  service: AddressAutocompleteProps["service"];
  countryCode: string;
}): Promise<AddressResult[]> {
  const { query, service, countryCode } = params;
  if (query.length < 3) return [];

  switch (service) {
    case "nominatim":
      return searchNominatim({ query, countryCode });
    case "google":
      return searchGooglePlaces({ query, countryCode });
    case "mapbox":
      return searchMapBox({ query, countryCode });
    case "mock":
    default:
      return searchMockAddresses(query);
  }
}

function useCloseOnOutsideClick(params: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const { containerRef, onClose } = params;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef, onClose]);
}

function useDebouncedAddressSuggestions(params: {
  searchTerm: string;
  service: AddressAutocompleteProps["service"];
  countryCode: string;
  debounceMs: number;
}) {
  const { searchTerm, service, countryCode, debounceMs } = params;
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      if (searchTerm.length >= 3) {
        setLoading(true);
        const results = await searchAddresses({
          query: searchTerm,
          service,
          countryCode,
        });
        if (cancelled) return;
        setSuggestions(results);
        setLoading(false);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    const debounce = window.setTimeout(() => {
      void runSearch();
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(debounce);
    };
  }, [countryCode, debounceMs, searchTerm, service]);

  return { suggestions, setSuggestions, isOpen, setIsOpen, loading };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressChange,
  placeholder = "Start typing an address...",
  className = "",
  disabled = false,
  required = false,
  error,
  label,
  helperText,
  service = "nominatim",
  countryCode = "US",
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isOpen, setIsOpen, loading } =
    useDebouncedAddressSuggestions({
      searchTerm,
      service,
      countryCode,
      debounceMs: 300,
    });

  useCloseOnOutsideClick({
    containerRef,
    onClose: () => setIsOpen(false),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onAddressChange?.(newValue);
    setSelectedIndex(-1);
  };

  const handleSelectAddress = (result: AddressResult) => {
    const parsed = parseAddress(result);
    setSearchTerm(parsed.formatted);
    onChange(parsed);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectAddress(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200
            focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500 focus:backdrop-blur-sm
            focus:shadow-lg focus:shadow-jade-500/10
            ${
              error
                ? "border-status-error focus:ring-status-error/50 focus:border-status-error focus:shadow-red-500/10"
                : "border-secondary hover:border-jade-300 dark:hover:border-jade-600"
            }
            ${disabled ? "bg-subtle text-muted cursor-not-allowed" : "bg-white/80 dark:bg-navy-900/80"}
            ${className}
          `}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <div className="w-6 h-6 rounded-full bg-jade-500/10 dark:bg-jade-400/10 backdrop-blur-sm flex items-center justify-center">
              <Icon
                name="refresh-cw"
                size="xs"
                className="text-jade-600 dark:text-jade-400 animate-spin"
              />
            </div>
          )}
          <div className="w-6 h-6 rounded-full bg-surface-secondary0/10 dark:bg-muted/10 backdrop-blur-sm flex items-center justify-center">
            <Icon
              name="map-pin"
              size="xs"
              className="text-secondary dark:text-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown - Glassmorphic Style */}
      <GlassmorphicDropdown isOpen={isOpen && suggestions.length > 0}>
        {suggestions.map((suggestion, index) => (
          <GlassmorphicDropdownItem
            key={suggestion.place_id}
            onClick={() => handleSelectAddress(suggestion)}
            isSelected={index === selectedIndex}
            isLast={index === suggestions.length - 1 && service !== "nominatim"}
            icon={
              <Icon
                name="map-pin"
                size="xs"
                className="text-jade-600 dark:text-jade-400"
              />
            }
          >
            <Typography variant="body-sm" className="font-medium">
              {suggestion.formatted_address.split(",")[0]}
            </Typography>
            <Typography variant="body-xs" color="muted" className="truncate">
              {suggestion.formatted_address
                .split(",")
                .slice(1)
                .join(",")
                .trim()}
            </Typography>
          </GlassmorphicDropdownItem>
        ))}

        {/* Attribution for Nominatim */}
        {service === "nominatim" && (
          <GlassmorphicDropdownSeparator>
            <Typography variant="body-xs" color="muted" className="text-center">
              Powered by{" "}
              <a
                href="https://openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jade-600 hover:text-jade-700 underline"
              >
                OpenStreetMap
              </a>
            </Typography>
          </GlassmorphicDropdownSeparator>
        )}
      </GlassmorphicDropdown>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-status-error">
          <Icon name="warning" size="xs" />
          <Typography variant="body-xs">{error}</Typography>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Typography variant="body-xs" color="muted" className="mt-2">
          {helperText}
        </Typography>
      )}
    </div>
  );
};

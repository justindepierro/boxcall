import React, { useState, useRef, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";
import {
  GlassmorphicDropdown,
  GlassmorphicDropdownItem,
  GlassmorphicDropdownSeparator,
} from "../ui/GlassmorphicDropdown";
import {
  searchAddresses,
  type AddressResult,
  type AddressAutocompleteServiceName,
} from "../../services/addressAutocompleteService";

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
 */

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
  service?: "nominatim" | "google" | "mapbox";
  googleApiKey?: string;
  mapboxApiKey?: string;
  countryCode?: string;
  language?: string;
  debounceMs?: number;
}

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
          service: (service || "nominatim") as AddressAutocompleteServiceName,
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

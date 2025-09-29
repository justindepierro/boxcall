import React, { useState, useRef, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

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
}

// Mock address data for development (replace with Google Places API)
const MOCK_ADDRESSES = [
  {
    formatted_address: "123 Main St, Austin, TX 78701, USA",
    address_components: [
      { long_name: "123", short_name: "123", types: ["street_number"] },
      { long_name: "Main Street", short_name: "Main St", types: ["route"] },
      { long_name: "Austin", short_name: "Austin", types: ["locality"] },
      { long_name: "Texas", short_name: "TX", types: ["administrative_area_level_1"] },
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
      { long_name: "Texas", short_name: "TX", types: ["administrative_area_level_1"] },
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
      { long_name: "Texas", short_name: "TX", types: ["administrative_area_level_1"] },
      { long_name: "77001", short_name: "77001", types: ["postal_code"] },
    ],
    place_id: "mock_3",
  },
];

function parseAddress(result: AddressResult): ParsedAddress {
  const components = result.address_components;
  
  const streetNumber = components.find(c => c.types.includes("street_number"))?.long_name || "";
  const route = components.find(c => c.types.includes("route"))?.long_name || "";
  const city = components.find(c => c.types.includes("locality"))?.long_name || "";
  const state = components.find(c => c.types.includes("administrative_area_level_1"))?.short_name || "";
  const zip = components.find(c => c.types.includes("postal_code"))?.long_name || "";
  
  const street = [streetNumber, route].filter(Boolean).join(" ");
  
  return {
    street,
    city,
    state,
    zip,
    formatted: result.formatted_address,
  };
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock search function (replace with Google Places API)
  const searchAddresses = async (query: string): Promise<AddressResult[]> => {
    if (query.length < 3) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return MOCK_ADDRESSES.filter(addr => 
      addr.formatted_address.toLowerCase().includes(query.toLowerCase())
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length >= 3) {
        setLoading(true);
        const results = await searchAddresses(searchTerm);
        setSuggestions(results);
        setLoading(false);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

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
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
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
        <label className="block text-sm font-medium text-text-primary mb-2">
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
            w-full px-4 py-3 pr-12 border rounded-lg
            focus:ring-2 focus:ring-jade-500 focus:border-jade-500
            ${error 
              ? "border-status-error focus:ring-status-error focus:border-status-error" 
              : "border-border-medium"
            }
            ${disabled ? "bg-surface-subtle text-text-muted cursor-not-allowed" : ""}
            ${className}
          `}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Icon name="refresh-cw" size="sm" className="text-text-muted animate-spin" />
          )}
          <Icon name="map-pin" size="sm" className="text-text-muted" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface-card border border-border-medium rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectAddress(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-surface-subtle
                flex items-start gap-3 border-b border-border-subtle last:border-b-0
                ${index === selectedIndex ? "bg-jade-50 dark:bg-jade-900/20" : ""}
              `}
            >
              <Icon name="map-pin" size="sm" className="text-jade-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Typography variant="body-sm" className="font-medium">
                  {suggestion.formatted_address.split(",")[0]}
                </Typography>
                <Typography variant="body-xs" color="muted" className="truncate">
                  {suggestion.formatted_address.split(",").slice(1).join(",").trim()}
                </Typography>
              </div>
            </button>
          ))}
        </div>
      )}

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
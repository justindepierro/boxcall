import { error as logError, warn } from "../utils/logger";

export interface AddressResult {
  formatted_address: string;
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  place_id: string;
}

export type AddressAutocompleteServiceName =
  | "nominatim"
  | "google"
  | "mapbox"
  | "mock";

// Environment variables
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Mock address data for development
const MOCK_ADDRESSES: AddressResult[] = [
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
    warn("Nominatim search failed, falling back to mock data", error);
    return searchMockAddresses(query);
  }
}

async function searchGooglePlaces(params: {
  query: string;
  countryCode: string;
}): Promise<AddressResult[]> {
  const { query, countryCode } = params;

  if (!GOOGLE_PLACES_API_KEY) {
    warn("Google Places API key not configured. Using mock data.");
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
                address_components: [],
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
      warn(
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
    warn("MapBox access token not configured. Using mock data.");
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

export async function searchAddresses(params: {
  query: string;
  service: AddressAutocompleteServiceName;
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

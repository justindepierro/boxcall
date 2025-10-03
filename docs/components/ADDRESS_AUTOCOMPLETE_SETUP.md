# Address Autocomplete Component Setup

This component provides retail-style address autocomplete functionality with support for multiple services:

- **Nominatim (OpenStreetMap)** ⭐ **RECOMMENDED** - FREE, no API key required!
- **Google Places API** (requires API key and billing)
- **MapBox Geocoding API** (requires API key and billing)
- **Mock addresses** (for development/testing)

## Quick Start

### Option 1: Nominatim - FREE! ⭐ **RECOMMENDED**

**Zero setup required!** Just use the component:

```tsx
<AddressAutocomplete
  service="nominatim" // This is now the default!
  value={address}
  onChange={(parsed) => {
    setFormData({
      ...formData,
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
    });
  }}
  countryCode="US" // Optional: limit to specific country
  label="Address"
  placeholder="Start typing an address..."
  required
/>
```

**Pros:**

- ✅ Completely free
- ✅ No API key required
- ✅ No billing or usage limits
- ✅ Good coverage worldwide
- ✅ Respects user privacy

**Cons:**

- ⚠️ Slightly less accurate than Google for some addresses
- ⚠️ Requires attribution to OpenStreetMap (included in component)

### Option 2: Google Places API (Most Accurate)

1. **Get API Key**: Visit [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Places API (new) and Geocoding API
3. **Set Environment Variable**:

```bash
# .env.local
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

4. **Use Component**:

```tsx
<AddressAutocomplete
  service="google"
  value={address}
  onChange={(parsed) => {
    setFormData({
      ...formData,
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
    });
  }}
  countryCode="US"
  label="Address"
  required
/>
```

### Option 3: MapBox Geocoding API

1. **Get Access Token**: Visit [MapBox Account](https://account.mapbox.com/)
2. **Set Environment Variable**:

```bash
# .env.local
VITE_MAPBOX_ACCESS_TOKEN=your_access_token_here
```

3. **Use Component**:

```tsx
<AddressAutocomplete
  service="mapbox"
  value={address}
  onChange={(parsed) => setAddress(parsed)}
  countryCode="US"
  label="Address"
  required
/>
```

### Option 4: Mock Data (Development)

Perfect for testing and development:

```tsx
<AddressAutocomplete
  service="mock"
  value={address}
  onChange={(parsed) => setAddress(parsed)}
  label="Address"
  helperText="Type 'Main', 'Oak', or 'Pine' to see mock suggestions"
/>
```

## Features

- **Retail-style UX**: Familiar dropdown interface like Amazon/Shopify checkout
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Auto-fill**: Automatically populates city, state, ZIP when address selected
- **Loading States**: Visual feedback during search
- **Error Handling**: Graceful fallbacks when services fail
- **Mobile Responsive**: Works great on all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## API Reference

### Props

| Prop              | Type                                            | Default                        | Description                     |
| ----------------- | ----------------------------------------------- | ------------------------------ | ------------------------------- |
| `value`           | `string`                                        | -                              | Current address value           |
| `onChange`        | `(address: ParsedAddress) => void`              | -                              | Called when address is selected |
| `onAddressChange` | `(address: string) => void`                     | -                              | Called on every input change    |
| `service`         | `"nominatim" \| "google" \| "mapbox" \| "mock"` | `"nominatim"`                  | Address service to use          |
| `countryCode`     | `string`                                        | `"US"`                         | ISO country code for filtering  |
| `placeholder`     | `string`                                        | `"Start typing an address..."` | Input placeholder               |
| `label`           | `string`                                        | -                              | Field label                     |
| `helperText`      | `string`                                        | -                              | Helper text below input         |
| `error`           | `string`                                        | -                              | Error message                   |
| `required`        | `boolean`                                       | `false`                        | Whether field is required       |
| `disabled`        | `boolean`                                       | `false`                        | Whether field is disabled       |
| `debounceMs`      | `number`                                        | `300`                          | Search debounce delay           |

### ParsedAddress Type

```tsx
interface ParsedAddress {
  street: string; // "123 Main St"
  city: string; // "Austin"
  state: string; // "TX"
  zip: string; // "78701"
  formatted: string; // "123 Main St, Austin, TX 78701, USA"
}
```

## Production Deployment

For production apps, we **strongly recommend Nominatim** because:

1. ✅ **Zero cost** - No surprise bills
2. ✅ **No API limits** - Handle any traffic volume
3. ✅ **Privacy-friendly** - Doesn't track users
4. ✅ **Global coverage** - Works worldwide
5. ✅ **Open-source** - Community-maintained and transparent

### Rate Limiting Best Practices

While Nominatim is free, please be respectful:

- ✅ Built-in 300ms debounce (adjustable)
- ✅ Minimum 3 characters before search
- ✅ Proper User-Agent header included
- ✅ Email contact provided in requests

## Troubleshooting

### Common Issues

**Q: Nominatim returns no results**
A: Try different search terms or remove country filtering. US addresses work best with "123 Main St, City, State" format.

**Q: Google Places not working**
A: Check API key is correct and Places API is enabled in Google Cloud Console.

**Q: Component shows mock data**
A: This is the fallback when the selected service fails. Check network and API keys.

### Debug Mode

Enable debug logging:

```tsx
<AddressAutocomplete
  service="nominatim"
  value={address}
  onChange={(parsed) => {
    console.log("Address selected:", parsed);
    setAddress(parsed);
  }}
  // ... other props
/>
```

## Attribution

When using Nominatim, attribution is automatically included in the dropdown. OpenStreetMap requires attribution for their free service.

---

**Need help?** The component gracefully falls back to mock data if anything fails, so your users always have a working experience!

# Campus Ride - Mapbox Integration Guide

## 🚌 Smart College Bus Tracking with Mapbox

This comprehensive guide will help you integrate Mapbox into your campus ride application with all the features you requested.

## ✨ Features Implemented

### 🗺️ Interactive Map Features
- **Real-time GPS Tracking**: Live bus positions with automatic updates every 5 seconds
- **Dynamic Markers**: Bus and stop markers with status indicators
- **Interactive Popups**: Click on markers to see detailed information
- **Route Visualization**: Visual path between user location and selected destinations
- **Multiple Map Styles**: Streets, Satellite, Dark, Light, and Outdoors views

### 🔍 Search & Navigation
- **Location Search**: Autocomplete search box with Mapbox Geocoder
- **Directions**: Get routes between user location and bus stops/buses
- **Current Location**: One-click location detection
- **Navigation Controls**: Zoom, pan, and compass controls

### 📱 Responsive Design
- **Mobile Optimized**: Works perfectly on phones, tablets, and desktops
- **Touch Gestures**: Pinch to zoom, drag to pan on mobile devices
- **Adaptive Layout**: Map adjusts to different screen sizes

### 🔒 Security & Performance
- **Environment Variables**: Secure API key management
- **Performance Optimization**: Efficient marker rendering and updates
- **Error Handling**: Graceful fallbacks for API failures

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-geocoder @types/mapbox-gl
```

### 2. Get Mapbox Access Token

1. Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Create a new access token or use an existing one
3. Copy your access token

### 3. Environment Setup

Create a `.env` file in your project root:

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

**⚠️ Security Note**: Never commit your `.env` file to version control. Add it to your `.gitignore`.

### 4. Basic Usage

```tsx
import MapboxMap from '@/components/MapboxMap';
import { useBusTracking } from '@/hooks/useBusTracking';

const MyComponent = () => {
  const { busLocations, routeStops } = useBusTracking();

  return (
    <MapboxMap
      busLocations={busLocations}
      routeStops={routeStops}
      height="400px"
      showControls={true}
      enableRouting={true}
      enableSearch={true}
    />
  );
};
```

## 📋 Component API

### MapboxMap Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `busLocations` | `BusLocation[]` | `[]` | Array of bus location data |
| `routeStops` | `RouteStop[]` | `[]` | Array of route stop data |
| `selectedRoute` | `string` | - | Currently selected route |
| `onBusSelect` | `(bus: BusLocation) => void` | - | Callback when bus is selected |
| `onStopSelect` | `(stop: RouteStop) => void` | - | Callback when stop is selected |
| `height` | `string` | `'400px'` | Map container height |
| `showControls` | `boolean` | `true` | Show navigation controls |
| `enableRouting` | `boolean` | `true` | Enable routing functionality |
| `enableSearch` | `boolean` | `true` | Enable search functionality |

### Data Types

```typescript
interface BusLocation {
  id: string;
  name: string;
  driver: string;
  lat: number;
  lng: number;
  status: 'moving' | 'stopped' | 'maintenance';
  capacity: number;
  occupied: number;
  eta: string;
  nextStop: string;
  route: string;
  speed?: number;
  lastUpdated?: string;
}

interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  eta?: string;
  status?: 'next' | 'upcoming' | 'passed';
  order?: number;
}
```

## 🛠️ Advanced Configuration

### Custom Map Styles

You can use custom Mapbox styles by updating the `mapStyles` array in `MapboxMap.tsx`:

```typescript
const mapStyles = [
  { value: 'mapbox://styles/your-username/your-style-id', label: 'Custom Style' },
  // ... other styles
];
```

### API Key Security Best Practices

1. **Environment Variables**: Always use environment variables for API keys
2. **Token Scoping**: Limit your Mapbox token to specific domains/IPs
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Token Rotation**: Regularly rotate your access tokens

### Performance Optimization

1. **Marker Clustering**: For large numbers of markers, implement clustering
2. **Lazy Loading**: Load map data only when needed
3. **Debouncing**: Debounce search queries to reduce API calls
4. **Caching**: Cache frequently accessed data

## 🔧 Customization Examples

### Custom Marker Icons

```typescript
// In MapboxMap.tsx, modify the marker rendering
const CustomBusMarker = ({ bus }: { bus: BusLocation }) => (
  <div className="relative">
    <img 
      src="/custom-bus-icon.png" 
      alt="Bus" 
      className="w-8 h-8 cursor-pointer"
    />
    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
      bus.status === 'moving' ? 'bg-green-500' : 'bg-red-500'
    }`}></div>
  </div>
);
```

### Custom Popup Content

```typescript
// Customize popup content in the Popup component
<Popup>
  <div className="custom-popup-content">
    <h3>{bus.name}</h3>
    <p>Driver: {bus.driver}</p>
    <p>Status: {bus.status}</p>
    <button onClick={() => trackBus(bus.id)}>Track Bus</button>
  </div>
</Popup>
```

## 📱 Mobile Optimization

The map is fully responsive and includes:

- **Touch Gestures**: Pinch to zoom, drag to pan
- **Mobile Controls**: Optimized control placement for mobile
- **Responsive Markers**: Appropriate marker sizes for touch
- **Mobile Popups**: Touch-friendly popup interactions

## 🚨 Error Handling

The component includes comprehensive error handling:

```typescript
// Handle API failures gracefully
try {
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('API Error');
  // Process data
} catch (error) {
  console.error('Mapbox API Error:', error);
  // Show user-friendly error message
}
```

## 🔄 Real-time Updates

The `useBusTracking` hook provides:

- **Automatic Updates**: Bus positions update every 5 seconds
- **Status Changes**: Real-time status updates (moving/stopped/maintenance)
- **Occupancy Tracking**: Live passenger count updates
- **ETA Calculations**: Dynamic arrival time estimates

## 📊 Additional Features You Can Add

### 1. Bus Tracking History
```typescript
const trackBusHistory = (busId: string) => {
  // Store bus location history
  // Display route path over time
};
```

### 2. Push Notifications
```typescript
const sendNotification = (message: string) => {
  if ('Notification' in window) {
    new Notification('Bus Alert', { body: message });
  }
};
```

### 3. Offline Support
```typescript
// Cache map tiles for offline use
const cacheMapTiles = () => {
  // Implement offline map caching
};
```

### 4. Analytics Dashboard
```typescript
const trackMapInteractions = (event: string) => {
  // Track user interactions for analytics
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Map Not Loading**
   - Check if `VITE_MAPBOX_ACCESS_TOKEN` is set correctly
   - Verify the token has the correct permissions

2. **Markers Not Showing**
   - Ensure `busLocations` data has valid `lat` and `lng` values
   - Check console for coordinate errors

3. **Search Not Working**
   - Verify Mapbox Geocoder is properly initialized
   - Check network requests in browser dev tools

4. **Routing Issues**
   - Ensure coordinates are in correct format [lng, lat]
   - Check Mapbox Directions API quota

### Debug Mode

Enable debug mode by adding to your `.env`:

```env
VITE_MAPBOX_DEBUG=true
```

## 📈 Performance Monitoring

Monitor your Mapbox usage:

1. **API Calls**: Track API call frequency
2. **Token Usage**: Monitor token consumption
3. **Error Rates**: Track API error rates
4. **Load Times**: Measure map load performance

## 🎯 Next Steps

1. **Custom Styling**: Create custom map styles for your brand
2. **Advanced Routing**: Implement multi-stop routing
3. **Real-time Data**: Connect to live GPS data feeds
4. **User Preferences**: Save user map preferences
5. **Accessibility**: Add screen reader support

## 📞 Support

For issues with this implementation:

1. Check the console for error messages
2. Verify your Mapbox token permissions
3. Test with sample data first
4. Review the Mapbox documentation

## 🔗 Useful Links

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [React Map GL Documentation](https://visgl.github.io/react-map-gl/)
- [Mapbox Geocoder API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)

---

**Happy Mapping! 🗺️✨**

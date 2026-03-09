import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { 
  MapRef, 
  Marker, 
  Popup, 
  NavigationControl, 
  GeolocateControl,
  Source,
  Layer
} from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Navigation, 
  Route, 
  Layers, 
  Locate,
  Bus,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Types
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
}

interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  eta?: string;
  status?: 'next' | 'upcoming' | 'passed';
}

interface MapboxMapProps {
  busLocations?: BusLocation[];
  routeStops?: RouteStop[];
  selectedRoute?: string;
  onBusSelect?: (bus: BusLocation) => void;
  onStopSelect?: (stop: RouteStop) => void;
  height?: string;
  showControls?: boolean;
  enableRouting?: boolean;
  enableSearch?: boolean;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  busLocations = [],
  routeStops = [],
  selectedRoute,
  onBusSelect,
  onStopSelect,
  height = '400px',
  showControls = true,
  enableRouting = true,
  enableSearch = true
}) => {
  const mapRef = useRef<MapRef>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const routeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State management
  const [viewState, setViewState] = useState({
    longitude: 78.4867, // Default to Hyderabad, India
    latitude: 17.3850,
    zoom: 12
  });
  
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized map styles configuration
  const mapStyles = useMemo(() => [
    { value: 'mapbox://styles/mapbox/streets-v12', label: 'Streets' },
    { value: 'mapbox://styles/mapbox/satellite-v9', label: 'Satellite' },
    { value: 'mapbox://styles/mapbox/dark-v11', label: 'Dark' },
    { value: 'mapbox://styles/mapbox/light-v11', label: 'Light' },
    { value: 'mapbox://styles/mapbox/outdoors-v12', label: 'Outdoors' }
  ], []);

  // Debounced route calculation
  const debouncedCalculateRoute = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (start: [number, number], end: [number, number]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => calculateRoute(start, end), 300);
      };
    })(),
    []
  );

  // Get user's current location with error handling
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setViewState(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please check location permissions.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Initialize geocoder with error handling
  useEffect(() => {
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!accessToken) {
      setError('Mapbox access token is not configured');
      return;
    }
    
    if (enableSearch && mapRef.current) {
      try {
        const geocoder = new MapboxGeocoder({
          accessToken,
          mapboxgl: window.mapboxgl,
          marker: false,
          placeholder: 'Search for locations...',
          bbox: [78.0, 17.0, 79.0, 18.0], // Approximate bounds for Hyderabad area
          proximity: {
            longitude: viewState.longitude,
            latitude: viewState.latitude
          },
          countries: 'in', // Restrict to India
          types: 'place,locality,neighborhood,address,poi'
        });

        geocoderRef.current = geocoder;
        mapRef.current.getMap().addControl(geocoder);
      } catch (err) {
        console.error('Error initializing geocoder:', err);
        setError('Failed to initialize search functionality');
      }
    }

    return () => {
      if (geocoderRef.current && mapRef.current) {
        mapRef.current.getMap().removeControl(geocoderRef.current);
      }
    };
  }, [enableSearch, viewState.longitude, viewState.latitude]);

  // Calculate route between two points with error handling
  const calculateRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!accessToken) {
      setError('Mapbox access token is not configured');
      return;
    }

    try {
      setIsRouting(true);
      setError(null);
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates;
        setRouteCoordinates(route);
      } else {
        setError('No route found between the selected points');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Failed to calculate route. Please try again.');
    } finally {
      setIsRouting(false);
    }
  }, []);

  // Handle bus marker click with performance optimization
  const handleBusClick = useCallback((bus: BusLocation) => {
    setSelectedBus(bus);
    setSelectedStop(null);
    onBusSelect?.(bus);
    
    // Center map on bus with smooth transition
    setViewState(prev => ({
      ...prev,
      latitude: bus.lat,
      longitude: bus.lng,
      zoom: Math.max(prev.zoom, 15)
    }));
  }, [onBusSelect]);

  // Handle stop marker click with performance optimization
  const handleStopClick = useCallback((stop: RouteStop) => {
    setSelectedStop(stop);
    setSelectedBus(null);
    onStopSelect?.(stop);
    
    // Center map on stop with smooth transition
    setViewState(prev => ({
      ...prev,
      latitude: stop.lat,
      longitude: stop.lng,
      zoom: Math.max(prev.zoom, 15)
    }));
  }, [onStopSelect]);

  // Memoized status icons and colors
  const getBusStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'moving':
        return <Navigation className="h-4 w-4 text-green-500 animate-pulse" />;
      case 'stopped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  }, []);

  const getBusStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'stopped': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStopStatusColor = useCallback((status?: string) => {
    switch (status) {
      case 'next': return 'bg-blue-500';
      case 'upcoming': return 'bg-gray-400';
      case 'passed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  }, []);

  // Memoized markers to prevent unnecessary re-renders
  const busMarkers = useMemo(() => 
    busLocations.map((bus) => (
      <Marker
        key={bus.id}
        longitude={bus.lng}
        latitude={bus.lat}
        onClick={() => handleBusClick(bus)}
      >
        <div className="relative">
          <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer ${getBusStatusColor(bus.status)}`}>
            <Bus className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${getBusStatusColor(bus.status)}`}></div>
          </div>
        </div>
      </Marker>
    )), [busLocations, handleBusClick, getBusStatusColor]
  );

  const stopMarkers = useMemo(() => 
    routeStops.map((stop) => (
      <Marker
        key={stop.id}
        longitude={stop.lng}
        latitude={stop.lat}
        onClick={() => handleStopClick(stop)}
      >
        <div className="relative">
          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer ${getStopStatusColor(stop.status)}`}>
            <MapPin className="h-3 w-3 text-white" />
          </div>
        </div>
      </Marker>
    )), [routeStops, handleStopClick, getStopStatusColor]
  );

  // Debug environment variable
  console.log('Mapbox Token Debug:', {
    token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    hasToken: !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    tokenLength: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.length,
    allEnv: import.meta.env
  });

  // Error boundary fallback
  if (!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Configuration Error</h3>
          <p className="text-gray-600 mb-4">
            Please configure your Mapbox access token in the environment variables.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Add VITE_MAPBOX_ACCESS_TOKEN to your .env file
          </p>
          <p className="text-xs text-gray-400">
            Current token: {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'Not found'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Please restart your development server after adding the token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mapbox-map-container" style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-40">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        attributionControl={false}
        maxZoom={18}
        minZoom={8}
        scrollZoom={true}
        boxZoom={true}
        dragRotate={false}
        dragPan={true}
        keyboard={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
      >
        {/* Navigation Controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" />
            <GeolocateControl
              position="top-right"
              onGeolocate={(e) => {
                const { latitude, longitude } = e.coords;
                setUserLocation({ lat: latitude, lng: longitude });
              }}
            />
          </>
        )}

        {/* Route Line */}
        {routeCoordinates.length > 0 && (
          <Source
            id="route"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            }}
          >
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Bus Markers */}
        {busMarkers}

        {/* Stop Markers */}
        {stopMarkers}

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </Marker>
        )}

        {/* Bus Popup */}
        {selectedBus && (
          <Popup
            longitude={selectedBus.lng}
            latitude={selectedBus.lat}
            onClose={() => setSelectedBus(null)}
            closeButton={false}
            className="custom-popup"
            maxWidth="320px"
          >
            <Card className="w-80 border-0 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    {selectedBus.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBus(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {getBusStatusIcon(selectedBus.status)}
                  <Badge variant={selectedBus.status === 'moving' ? 'default' : 'secondary'}>
                    {selectedBus.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Driver</div>
                    <div className="font-medium">{selectedBus.driver}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ETA</div>
                    <div className="font-medium text-primary">{selectedBus.eta}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Next Stop</div>
                    <div className="font-medium">{selectedBus.nextStop}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Occupancy</div>
                    <div className="font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedBus.occupied}/{selectedBus.capacity}
                    </div>
                  </div>
                </div>

                {enableRouting && userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => debouncedCalculateRoute(
                      [userLocation.lng, userLocation.lat],
                      [selectedBus.lng, selectedBus.lat]
                    )}
                    disabled={isRouting}
                  >
                    <Route className="h-4 w-4 mr-2" />
                    {isRouting ? 'Calculating...' : 'Get Directions'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Popup>
        )}

        {/* Stop Popup */}
        {selectedStop && (
          <Popup
            longitude={selectedStop.lng}
            latitude={selectedStop.lat}
            onClose={() => setSelectedStop(null)}
            closeButton={false}
            className="custom-popup"
            maxWidth="280px"
          >
            <Card className="w-64 border-0 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    {selectedStop.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStop(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedStop.eta && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">ETA: {selectedStop.eta}</span>
                  </div>
                )}
                
                {selectedStop.status && (
                  <Badge variant={selectedStop.status === 'next' ? 'default' : 'secondary'}>
                    {selectedStop.status}
                  </Badge>
                )}

                {enableRouting && userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => debouncedCalculateRoute(
                      [userLocation.lng, userLocation.lat],
                      [selectedStop.lng, selectedStop.lat]
                    )}
                    disabled={isRouting}
                  >
                    <Route className="h-4 w-4 mr-2" />
                    {isRouting ? 'Calculating...' : 'Get Directions'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Popup>
        )}
      </Map>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Map Style Selector */}
        <Card className="p-2">
          <Select value={mapStyle} onValueChange={setMapStyle}>
            <SelectTrigger className="w-32 h-8">
              <Layers className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              {mapStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Location Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={getUserLocation}
          className="w-8 h-8 p-0"
          title="Get my location"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default MapboxMap;
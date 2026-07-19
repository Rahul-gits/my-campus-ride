import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { websocketService } from '@/services/websocketService';

// Types
export interface BusLocation {
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

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  eta?: string;
  status?: 'next' | 'upcoming' | 'passed';
  order?: number;
}

export interface RouteData {
  id: string;
  name: string;
  stops: RouteStop[];
  buses: BusLocation[];
  totalDistance?: number;
  estimatedDuration?: number;
}

// Custom hook for managing bus tracking data
export const useBusTracking = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load routes on mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const result = await apiService.getAllRoutes();
        if (result.success && result.data) {
          setRoutes(result.data);
          if (result.data.length > 0) {
            setSelectedRoute(result.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load routes from backend API:', err);
      }
    };
    loadRoutes();
  }, []);

  // Fetch bus data
  const fetchBusData = useCallback(async () => {
    if (!selectedRoute) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getRouteById(selectedRoute);
      if (result.success && result.data) {
        const { route, buses } = result.data;
        
        // Map stops
        const mappedStops: RouteStop[] = (route.stops || [])
          .map((s: any, idx: number) => ({
            id: s.stop?._id || `stop-${idx}`,
            name: s.stop?.name || 'Unknown Stop',
            lat: s.stop?.location?.lat ?? 17.3850,
            lng: s.stop?.location?.lng ?? 78.4867,
            eta: `${s.estimatedTime || (idx * 5)} min`,
            status: idx === 0 ? 'passed' : idx === 1 ? 'next' : 'upcoming',
            order: s.order
          }))
          .sort((a: any, b: any) => a.order - b.order);

        setRouteStops(mappedStops);

        // Map buses
        const mappedBuses: BusLocation[] = (buses || []).map((b: any) => ({
          id: b._id,
          name: b.name || b.busNumber,
          driver: b.driver ? `${b.driver.profile?.firstName || ''} ${b.driver.profile?.lastName || ''}`.trim() || b.driver.username : 'Unknown Driver',
          lat: b.currentLocation?.lat ?? 17.3850,
          lng: b.currentLocation?.lng ?? 78.4867,
          status: b.currentStatus || 'moving',
          capacity: b.capacity ?? 45,
          occupied: b.occupancy?.current ?? 0,
          eta: `${b.nextStop?.eta || '5'} min`,
          nextStop: b.nextStop?.stop?.name || 'Main Gate',
          route: b.route?._id || b.route,
          speed: b.speed ?? 0,
          lastUpdated: b.currentLocation?.lastUpdated
        }));

        setBusLocations(mappedBuses);
      }
    } catch (err) {
      setError('Failed to fetch bus data');
      console.error('Error fetching bus data:', err);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  }, [selectedRoute]);

  // Fetch route stops
  const fetchRouteStops = useCallback(async (routeId: string) => {
    // Stops are fetched in fetchBusData for the selected route
  }, []);

  // Get bus by ID
  const getBusById = useCallback((busId: string) => {
    return busLocations.find(bus => bus.id === busId);
  }, [busLocations]);

  // Get buses by route
  const getBusesByRoute = useCallback((route: string) => {
    return busLocations.filter(bus => bus.route === route);
  }, [busLocations]);

  // Get next stop for a bus
  const getNextStop = useCallback((bus: BusLocation) => {
    const busStops = routeStops.filter(stop => stop.status !== 'passed');
    return busStops.find(stop => stop.status === 'next') || busStops[0];
  }, [routeStops]);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Get ETA for a bus to a specific stop
  const getETA = useCallback((bus: BusLocation, stop: RouteStop) => {
    const distance = calculateDistance(bus.lat, bus.lng, stop.lat, stop.lng);
    const speed = bus.speed || 25; // km/h
    const timeInMinutes = Math.round((distance / speed) * 60);
    return `${timeInMinutes} min`;
  }, [calculateDistance]);

  // Set up real-time updates via Socket.IO
  useEffect(() => {
    if (!selectedRoute) return;

    // Load initial data via REST HTTP API
    fetchBusData();

    // Subscribe to WebSocket channel for this route
    websocketService.send({
      type: 'subscribe_route',
      routeId: selectedRoute
    });

    const handleBusLocation = (data: any) => {
      // Find and update the bus coordinates in our local state list
      setBusLocations(prevBuses => {
        return prevBuses.map(bus => {
          if (bus.id === data.busId || bus.name === data.busId) {
            return {
              ...bus,
              lat: data.location.lat,
              lng: data.location.lng,
              speed: data.speed ?? bus.speed,
              occupied: data.occupancy?.current ?? bus.occupied,
              status: data.status ?? bus.status,
              lastUpdated: new Date().toISOString()
            };
          }
          return bus;
        });
      });
    };

    const handleRouteUpdate = (data: any) => {
      // Update specific bus coordinates from the route-update broadcast
      setBusLocations(prevBuses => {
        return prevBuses.map(bus => {
          if (bus.id === data.busId || bus.name === data.busId) {
            return {
              ...bus,
              lat: data.location.lat,
              lng: data.location.lng,
              status: data.status ?? bus.status,
              speed: data.speed ?? bus.speed,
              lastUpdated: new Date().toISOString()
            };
          }
          return bus;
        });
      });
    };

    // Register event listeners
    websocketService.on('bus_location_update', handleBusLocation);
    websocketService.on('route_update', handleRouteUpdate);

    // Clean up
    return () => {
      websocketService.send({
        type: 'unsubscribe_route',
        routeId: selectedRoute
      });
      websocketService.off('bus_location_update', handleBusLocation);
      websocketService.off('route_update', handleRouteUpdate);
    };
  }, [selectedRoute, fetchBusData]);

  return {
    // Data
    routes,
    busLocations,
    routeStops,
    selectedRoute,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    setSelectedRoute,
    fetchBusData,
    getBusById,
    getBusesByRoute,
    getNextStop,
    getETA,
    calculateDistance
  };
};

// Utility function to format coordinates for Mapbox
export const formatCoordinates = (lat: number, lng: number): [number, number] => [lng, lat];

// Utility function to get map bounds from locations
export const getMapBounds = (locations: Array<{lat: number, lng: number}>) => {
  if (locations.length === 0) return null;
  
  const lats = locations.map(loc => loc.lat);
  const lngs = locations.map(loc => loc.lng);
  
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs)
  };
};

export default useBusTracking;

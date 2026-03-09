import { useState, useEffect, useCallback } from 'react';

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

// Mock data - Replace with actual API calls
const mockBusData: BusLocation[] = [
  {
    id: 'BUS-001',
    name: 'Campus Express',
    driver: 'Srinu',
    lat: 17.3850,
    lng: 78.4867,
    status: 'moving',
    capacity: 45,
    occupied: 32,
    eta: '3 min',
    nextStop: 'Lakshmipuram',
    route: 'Route A',
    speed: 25,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'BUS-002',
    name: 'Downtown Shuttle',
    driver: 'Rangayya',
    lat: 17.3950,
    lng: 78.4967,
    status: 'stopped',
    capacity: 45,
    occupied: 28,
    eta: '8 min',
    nextStop: 'BR Stadium',
    route: 'Route A',
    speed: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'BUS-003',
    name: 'Mall Connector',
    driver: 'Kumar',
    lat: 17.3750,
    lng: 78.4767,
    status: 'moving',
    capacity: 40,
    occupied: 35,
    eta: '5 min',
    nextStop: 'Shopping Center',
    route: 'Route B',
    speed: 20,
    lastUpdated: new Date().toISOString()
  }
];

const mockRouteStops: RouteStop[] = [
  {
    id: 'stop-001',
    name: 'Main Gate',
    lat: 17.3850,
    lng: 78.4867,
    eta: '3 min',
    status: 'next',
    order: 1
  },
  {
    id: 'stop-002',
    name: 'Library',
    lat: 17.3900,
    lng: 78.4900,
    eta: '5 min',
    status: 'upcoming',
    order: 2
  },
  {
    id: 'stop-003',
    name: 'Cafeteria',
    lat: 17.3950,
    lng: 78.4950,
    eta: '8 min',
    status: 'upcoming',
    order: 3
  },
  {
    id: 'stop-004',
    name: 'Sports Complex',
    lat: 17.4000,
    lng: 78.5000,
    eta: '12 min',
    status: 'upcoming',
    order: 4
  },
  {
    id: 'stop-005',
    name: 'Downtown Hub',
    lat: 17.4100,
    lng: 78.5100,
    eta: '18 min',
    status: 'upcoming',
    order: 5
  }
];

// Custom hook for managing bus tracking data
export const useBusTracking = () => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('Route A');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate real-time updates
  const updateBusPositions = useCallback(() => {
    setBusLocations(prevBuses => 
      prevBuses.map(bus => {
        // Simulate movement for moving buses
        if (bus.status === 'moving') {
          const latOffset = (Math.random() - 0.5) * 0.001;
          const lngOffset = (Math.random() - 0.5) * 0.001;
          
          return {
            ...bus,
            lat: Math.max(17.3, Math.min(17.5, bus.lat + latOffset)),
            lng: Math.max(78.4, Math.min(78.6, bus.lng + lngOffset)),
            lastUpdated: new Date().toISOString()
          };
        }
        return bus;
      })
    );
    setLastUpdated(new Date());
  }, []);

  // Fetch bus data
  const fetchBusData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter buses by selected route
      const filteredBuses = mockBusData.filter(bus => bus.route === selectedRoute);
      setBusLocations(filteredBuses);
      setRouteStops(mockRouteStops);
    } catch (err) {
      setError('Failed to fetch bus data');
      console.error('Error fetching bus data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoute]);

  // Fetch route stops
  const fetchRouteStops = useCallback(async (routeId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      setRouteStops(mockRouteStops);
    } catch (err) {
      console.error('Error fetching route stops:', err);
    }
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

  // Set up real-time updates
  useEffect(() => {
    fetchBusData();
    
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      updateBusPositions();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [fetchBusData, updateBusPositions]);

  // Update route stops when route changes
  useEffect(() => {
    fetchRouteStops(selectedRoute);
  }, [selectedRoute, fetchRouteStops]);

  return {
    // Data
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
    calculateDistance,
    
    // Real-time updates
    updateBusPositions
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
